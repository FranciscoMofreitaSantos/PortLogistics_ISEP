// src/features/dataRightsRequests/admin/components/RectificationDecisionModal.tsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import type {
    RectificationApplyDto,
    RectificationPayloadDto,
} from "../../dto/dataRightsDtos";
import type { DataRightsRequest } from "../../domain/dataRights";
import dataRightsAdminService from "../../service/dataRightsAdminService";
import { mapRequestDto } from "../../mappers/dataRightsMapper";

type Props = {
    open: boolean;
    request: DataRightsRequest | null;
    onClose: () => void;
    onApplied: (updated: DataRightsRequest) => void;
};

/** Inicializa o form */
function buildInitialForm(requestId: string): RectificationApplyDto {
    return {
        requestId,
        rejectEntireRequest: false,
        globalReason: null,
        finalName: null,
        finalNameReason: null,
        finalEmail: null,
        finalEmailReason: null,
        finalPicture: null,
        finalPictureReason: null,
        finalIsActive: null,
        finalIsActiveReason: null,
        finalPhoneNumber: null,
        finalPhoneNumberReason: null,
        finalNationality: null,
        finalNationalityReason: null,
        finalCitizenId: null,
        finalCitizenIdReason: null,
        adminGeneralComment: null,
    };
}

/** Helper para limpar strings vazias */
function emptyToNull(v?: string | null): string | null {
    if (v == null) return null;
    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
}

/** * Limpa o prefixo "data:image/..." para o C# não rebentar.
 */
function cleanBase64(base64Str: string | null): string | null {
    if (!base64Str) return null;
    if (base64Str.includes(",")) {
        return base64Str.split(",")[1]; // Pega só o código depois da vírgula
    }
    return base64Str;
}

export function RectificationDecisionModal({
                                               open,
                                               request,
                                               onClose,
                                               onApplied,
                                           }: Props) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<RectificationApplyDto>(() => buildInitialForm(""));

    // PREENCHER AUTOMATICAMENTE O FORM COM O PAYLOAD
    useEffect(() => {
        if (!open || !request) return;

        // 1. Reset base
        const newForm = buildInitialForm(request.requestId);

        // 2. Tentar ler o payload e preencher o form (Auto-fill)
        if (request.payload) {
            try {
                const payload = JSON.parse(request.payload) as RectificationPayloadDto;

                if (payload.newName) newForm.finalName = payload.newName;
                if (payload.newEmail) newForm.finalEmail = payload.newEmail;
                if (payload.newPicture) newForm.finalPicture = payload.newPicture;
                if (payload.newPhoneNumber) newForm.finalPhoneNumber = payload.newPhoneNumber;
                if (payload.newNationality) newForm.finalNationality = payload.newNationality;
                if (payload.newCitizenId) newForm.finalCitizenId = payload.newCitizenId;

                if (payload.isActive !== undefined && payload.isActive !== null) {
                    newForm.finalIsActive = payload.isActive;
                }

            } catch (e) {
                console.error("Failed to parse payload for auto-fill", e);
            }
        }

        setForm(newForm);
    }, [open, request]);

    if (!open || !request) return null;

    function updateForm(partial: Partial<RectificationApplyDto>) {
        setForm(prev => ({ ...prev, ...partial }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);

            // Preparar DTO limpo
            const dtoToSend: RectificationApplyDto = {
                ...form,
                globalReason: emptyToNull(form.globalReason),
                finalName: emptyToNull(form.finalName),
                finalNameReason: emptyToNull(form.finalNameReason),
                finalEmail: emptyToNull(form.finalEmail),
                finalEmailReason: emptyToNull(form.finalEmailReason),

                // AQUI ESTÁ A CORREÇÃO CRÍTICA:
                finalPicture: emptyToNull(cleanBase64(form.finalPicture ?? null)),
                finalPictureReason: emptyToNull(form.finalPictureReason),
                finalIsActive: form.finalIsActive,
                finalIsActiveReason: emptyToNull(form.finalIsActiveReason),
                finalPhoneNumber: emptyToNull(form.finalPhoneNumber),
                finalPhoneNumberReason: emptyToNull(form.finalPhoneNumberReason),
                finalNationality: emptyToNull(form.finalNationality),
                finalNationalityReason: emptyToNull(form.finalNationalityReason),
                finalCitizenId: emptyToNull(form.finalCitizenId),
                finalCitizenIdReason: emptyToNull(form.finalCitizenIdReason),
                adminGeneralComment: emptyToNull(form.adminGeneralComment),
            };

            const updatedDto = await dataRightsAdminService.applyRectification(dtoToSend);
            const mapped = mapRequestDto(updatedDto);

            toast.success(t("dataRights.admin.rectificationApplied", "Decision applied successfully."));
            onApplied(mapped);
            onClose();
        } catch (e: any) {
            console.error(e);
            const msg = e?.response?.data?.detail
                || e?.response?.data?.message
                || t("dataRights.admin.rectificationError", "Error applying decision.");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="dr-modal-overlay">
            <div className="dr-modal">
                <header className="dr-modal-header">
                    <h2>{t("dataRights.admin.rectificationTitle", "Review & Approve Changes")}</h2>
                    <button type="button" className="dr-modal-close" onClick={onClose} disabled={loading}>✕</button>
                </header>

                <form onSubmit={handleSubmit} className="dr-modal-body">

                    {/* AVISO / REJEIÇÃO TOTAL */}
                    <div className="dr-admin-alert-box">
                        <label className="dr-checkbox-row">
                            <input
                                type="checkbox"
                                checked={form.rejectEntireRequest}
                                onChange={e => updateForm({ rejectEntireRequest: e.target.checked })}
                            />
                            <span className="dr-reject-label">
                                {t("dataRights.admin.rejectEntire", "Reject entire request (no changes will be applied)")}
                            </span>
                        </label>
                        {form.rejectEntireRequest && (
                            <textarea
                                rows={2}
                                className="dr-textarea"
                                value={form.globalReason ?? ""}
                                onChange={e => updateForm({ globalReason: e.target.value })}
                                placeholder={t("dataRights.admin.globalReason_PH", "Why are you rejecting this request?")}
                                style={{marginTop: '0.5rem'}}
                            />
                        )}
                    </div>

                    {!form.rejectEntireRequest && (
                        <div className="dr-rect-grid">

                            {/* --- COLUNA 1: FOTO & IDENTIDADE --- */}
                            <div className="dr-rect-col">
                                <h3 className="dr-section-title">👤 {t("dataRights.admin.sectionIdentity", "Profile Identity")}</h3>

                                {/* FOTO PREVIEW */}
                                <div className="dr-field-group">
                                    <label className="dr-label">{t("dataRights.create.photo", "Profile Picture")}</label>
                                    {form.finalPicture ? (
                                        <div className="dr-admin-img-preview-container">
                                            <img
                                                src={form.finalPicture}
                                                alt="New Avatar"
                                                className="dr-admin-img-preview"
                                            />
                                            <div className="dr-img-actions">
                                                <span className="dr-badge-new">NEW</span>
                                                <button
                                                    type="button"
                                                    className="dr-text-btn-danger"
                                                    onClick={() => updateForm({ finalPicture: null })}
                                                >
                                                    {t("dataRights.admin.discardImage", "Discard Image")}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="dr-no-change">{t("dataRights.admin.noPictureChange", "No picture change requested")}</div>
                                    )}
                                </div>

                                <div className="dr-field-group">
                                    <label className="dr-label">{t("dataRights.create.name", "Full Name")}</label>
                                    <input
                                        className="dr-input"
                                        value={form.finalName ?? ""}
                                        onChange={e => updateForm({ finalName: e.target.value })}
                                        placeholder={t("dataRights.admin.noChange", "No change")}
                                    />
                                </div>

                                <div className="dr-field-group">
                                    <label className="dr-label">{t("dataRights.create.email", "Email")}</label>
                                    <input
                                        className="dr-input"
                                        value={form.finalEmail ?? ""}
                                        onChange={e => updateForm({ finalEmail: e.target.value })}
                                        placeholder={t("dataRights.admin.noChange", "No change")}
                                    />
                                </div>
                            </div>

                            {/* --- COLUNA 2: DETALHES & ESTADO --- */}
                            <div className="dr-rect-col">
                                <h3 className="dr-section-title">📋 {t("dataRights.admin.sectionDetails", "Details & Status")}</h3>

                                <div className="dr-field-group">
                                    <label className="dr-label">{t("dataRights.create.newPhoneNumber", "Phone Number")}</label>
                                    <input
                                        className="dr-input"
                                        value={form.finalPhoneNumber ?? ""}
                                        onChange={e => updateForm({ finalPhoneNumber: e.target.value })}
                                        placeholder={t("dataRights.admin.noChange", "No change")}
                                    />
                                </div>

                                <div className="dr-field-group">
                                    <label className="dr-label">{t("dataRights.create.newCitizenId", "Citizen ID")}</label>
                                    <input
                                        className="dr-input"
                                        value={form.finalCitizenId ?? ""}
                                        onChange={e => updateForm({ finalCitizenId: e.target.value })}
                                        placeholder={t("dataRights.admin.noChange", "No change")}
                                    />
                                </div>

                                <div className="dr-field-group">
                                    <label className="dr-label">{t("dataRights.create.newNationality", "Nationality")}</label>
                                    <input
                                        className="dr-input"
                                        value={form.finalNationality ?? ""}
                                        onChange={e => updateForm({ finalNationality: e.target.value })}
                                        placeholder={t("dataRights.admin.noChange", "No change")}
                                    />
                                </div>

                                <div className="dr-field-group">
                                    <label className="dr-label">{t("dataRights.create.isActive", "Account Status")}</label>
                                    <select
                                        className="dr-select"
                                        value={
                                            form.finalIsActive === null || form.finalIsActive === undefined
                                                ? ""
                                                : form.finalIsActive ? "true" : "false"
                                        }
                                        onChange={e => {
                                            const v = e.target.value;
                                            updateForm({
                                                finalIsActive: v === "" ? null : v === "true"
                                            });
                                        }}
                                    >
                                        <option value="">({t("dataRights.admin.noChange", "No change")})</option>
                                        <option value="true">{t("dataRights.admin.setActive", "Active ✅")}</option>
                                        <option value="false">{t("dataRights.admin.setInactive", "Inactive ⛔")}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COMENTÁRIO FINAL */}
                    <div className="dr-form-section" style={{marginTop: '1.5rem'}}>
                        <label className="dr-label">{t("dataRights.admin.adminComment", "Admin Note / Response")}</label>
                        <textarea
                            className="dr-textarea"
                            rows={2}
                            value={form.adminGeneralComment ?? ""}
                            onChange={e => updateForm({ adminGeneralComment: e.target.value })}
                            placeholder={t("dataRights.admin.commentPlaceholder", "Optional comment...")}
                        />
                    </div>

                </form>

                <footer className="dr-modal-footer">
                    <button type="button" className="dr-secondary-btn" onClick={onClose} disabled={loading}>
                        {t("common.cancel", "Cancel")}
                    </button>
                    <button
                        type="submit"
                        className={form.rejectEntireRequest ? "dr-danger-btn" : "dr-primary-btn"}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? t("dataRights.admin.processing", "Processing...")
                            : form.rejectEntireRequest
                                ? t("dataRights.admin.confirmReject", "Reject Request")
                                : t("dataRights.admin.applyDecision", "Apply Changes")
                        }
                    </button>
                </footer>
            </div>
        </div>
    );
}