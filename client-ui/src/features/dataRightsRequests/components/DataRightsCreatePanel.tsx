// src/features/dataRightsRequests/components/DataRightsCreatePanel.tsx
import { useEffect, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import type {
    CreatingDataRightsRequest,
    RequestType,
} from "../domain/dataRights";

type Props = {
    creating: CreatingDataRightsRequest;
    setType: (t: RequestType) => void;
    updateRectification: (
        p: Partial<CreatingDataRightsRequest["rectification"]>,
    ) => void;
    setCreating: (c: CreatingDataRightsRequest) => void;
    onSubmit: () => void;
};

/* ===== HELPERS: TELEFONE ===== */
const PHONE_CODES: string[] = ["+351", "+34", "+33", "+44", "+49", "+30", "+1", "+55", "+244", "+41"];

function buildPhoneE164(code: string, rawNumber: string): string {
    const digits = rawNumber.replace(/\D/g, "");
    if (!code || !digits) return "";
    return `${code}${digits}`;
}

/* ===== HELPERS: NACIONALIDADES ===== */
const NATIONALITY_VALUES: string[] = [
    "Portugal", "Spain", "France", "Germany", "UnitedKingdom", "UnitedStates", "Brazil", "Angola",
    "Mozambique", "CapeVerde", "Italy", "Greece", "China", "India", "Russia", "Ukraine",
    "SouthAfrica", "Switzerland", "Luxembourg", "Belgium", "Netherlands"
];

function nationalityLabel(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

/* ===== COMPONENTE WIZARD ===== */
export function DataRightsCreatePanel({
                                          creating,
                                          setType,
                                          updateRectification,
                                          setCreating,
                                          onSubmit,
                                      }: Props) {
    const { t } = useTranslation();
    const [step, setStep] = useState<1 | 2>(1);
    const type = creating.type;

    // Estados locais para inputs compostos
    const [phoneCode, setPhoneCode] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");

    // Sincronizar dados iniciais
    useEffect(() => {
        const full = creating.rectification.newPhoneNumber ?? "";
        if (!full) { setPhoneCode(""); setPhoneNumber(""); return; }

        const match = PHONE_CODES.find(c => full.startsWith(c));
        if (match) {
            setPhoneCode(match);
            setPhoneNumber(full.slice(match.length));
        } else {
            setPhoneNumber(full);
        }
    }, [creating.rectification.newPhoneNumber]);

    const updatePhone = (c: string, n: string) => {
        setPhoneCode(c);
        setPhoneNumber(n);
        updateRectification({ newPhoneNumber: buildPhoneE164(c, n) || null });
    };

    // UPLOAD DE IMAGEM
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateRectification({ newPicture: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        updateRectification({ newPicture: null });
    };

    // --- PASSO 1: SELEÇÃO DE TIPO ---
    const renderStep1 = () => (
        <div className="dr-type-grid fade-enter">
            <div
                className={`dr-type-card ${type === "Access" ? "selected" : ""}`}
                onClick={() => { setType("Access"); setStep(2); }}
            >
                <div className="dr-type-icon-lg">📄</div>
                <span className="dr-type-title">
                    {t("dataRights.filters.access", "Access")}
                </span>
                <span className="dr-type-desc">
                    {t("dataRights.create.accessDesc", "Get a full copy of your data.")}
                </span>
            </div>

            <div
                className={`dr-type-card ${type === "Deletion" ? "selected" : ""}`}
                onClick={() => { setType("Deletion"); setStep(2); }}
            >
                <div className="dr-type-icon-lg">🧹</div>
                <span className="dr-type-title">
                    {t("dataRights.filters.deletion", "Deletion")}
                </span>
                <span className="dr-type-desc">
                    {t("dataRights.create.delDesc", "Request permanent removal of data.")}
                </span>
            </div>

            <div
                className={`dr-type-card ${type === "Rectification" ? "selected" : ""}`}
                onClick={() => { setType("Rectification"); setStep(2); }}
            >
                <div className="dr-type-icon-lg">✏️</div>
                <span className="dr-type-title">
                    {t("dataRights.filters.rectification", "Rectification")}
                </span>
                <span className="dr-type-desc">
                    {t("dataRights.create.rectDesc", "Update your profile details.")}
                </span>
            </div>
        </div>
    );

    // --- PASSO 2: FORMULÁRIO ---
    const renderStep2 = () => (
        <div className="fade-enter">
            {type === "Access" && (
                <div className="dr-form-section">
                    <p className="dr-value" style={{textAlign: 'center', marginTop: '3rem'}}>
                        📄 {t("dataRights.create.accessConfirm", "You are about to request a full report of your personal data.")}
                    </p>
                    <p className="dr-note" style={{textAlign: 'center'}}>
                        {t("dataRights.create.clickSubmit", "Click 'Submit Request' to proceed.")}
                    </p>
                </div>
            )}

            {type === "Deletion" && (
                <div className="dr-form-section">
                    <label className="dr-label">
                        {t("dataRights.create.deletionReason", "Reason (Optional)")}
                    </label>
                    <textarea
                        className="dr-textarea"
                        rows={4}
                        placeholder={t("dataRights.create.delPlaceholder", "Why do you want to delete your data?")}
                        value={creating.deletionReason}
                        onChange={e => setCreating({ ...creating, deletionReason: e.target.value })}
                    />
                    <p className="dr-note">
                        ⚠️ {t("dataRights.create.deletionWarning", "Note: Some data may be retained for legal purposes.")}
                    </p>
                </div>
            )}

            {type === "Rectification" && (
                <div className="dr-form-section">

                    {/* UPLOAD IMAGEM */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="dr-label">
                            {t("dataRights.create.photo", "New Profile Picture")}
                        </label>
                        {!creating.rectification.newPicture ? (
                            <div className="dr-upload-box">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="dr-upload-input"
                                    onChange={handleImageUpload}
                                />
                                <div className="dr-upload-placeholder">
                                    <span className="dr-upload-icon">☁️</span>
                                    <strong>{t("dataRights.create.uploadClick", "Click to upload photo")}</strong>
                                    <small>{t("dataRights.create.uploadFormats", "JPG, PNG or SVG")}</small>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div className="dr-image-preview-wrapper">
                                    <img
                                        src={creating.rectification.newPicture}
                                        alt="Preview"
                                        className="dr-image-preview"
                                    />
                                    <button type="button" className="dr-remove-image" onClick={handleRemoveImage}>✕</button>
                                </div>
                                <p className="dr-note" style={{marginTop: '0.5rem'}}>
                                    {t("dataRights.create.imageSelected", "Image selected")}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* DADOS PESSOAIS */}
                    <div className="dr-grid-2">
                        {/* Nome e Email */}
                        <div>
                            <label className="dr-label">
                                {t("dataRights.create.name", "New Name")}
                            </label>
                            <input
                                className="dr-input"
                                value={creating.rectification.newName ?? ""}
                                onChange={e => updateRectification({ newName: e.target.value })}
                                placeholder={t("dataRights.create.newName_PH", "Full Name")}
                            />
                        </div>
                        <div>
                            <label className="dr-label">
                                {t("dataRights.create.email", "New Email")}
                            </label>
                            <input
                                className="dr-input"
                                value={creating.rectification.newEmail ?? ""}
                                onChange={e => updateRectification({ newEmail: e.target.value })}
                                placeholder={t("dataRights.create.newEmail_PH", "email@example.com")}
                            />
                        </div>

                        {/* Telefone */}
                        <div className="dr-grid-full">
                            <label className="dr-label">
                                {t("dataRights.create.newPhoneNumber", "New Phone Number (SAR)")}
                            </label>
                            <div className="dr-phone-row">
                                <select
                                    className="dr-select dr-phone-code"
                                    value={phoneCode}
                                    onChange={e => updatePhone(e.target.value, phoneNumber)}
                                >
                                    <option value="">{t("dataRights.create.phoneCode", "Code")}</option>
                                    {PHONE_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input
                                    className="dr-input dr-phone-number"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={e => updatePhone(phoneCode, e.target.value)}
                                    placeholder={t("dataRights.create.phoneNumber_PH", "912345678")}
                                />
                            </div>
                        </div>

                        {/* Citizen ID e Nacionalidade */}
                        <div>
                            <label className="dr-label">
                                {t("dataRights.create.newCitizenId", "New Citizen ID / Passport")}
                            </label>
                            <input
                                className="dr-input"
                                value={creating.rectification.newCitizenId ?? ""}
                                onChange={e => updateRectification({ newCitizenId: e.target.value })}
                                placeholder={t("dataRights.create.idPlaceholder", "ID Number")}
                            />
                        </div>
                        <div>
                            <label className="dr-label">
                                {t("dataRights.create.newNationality", "New Nationality")}
                            </label>
                            <select
                                className="dr-select"
                                value={creating.rectification.newNationality ?? ""}
                                onChange={e => updateRectification({ newNationality: e.target.value || null })}
                            >
                                <option value="">{t("dataRights.create.selectOption", "Select...")}</option>
                                {NATIONALITY_VALUES.map(val => (
                                    <option key={val} value={val}>{nationalityLabel(val)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Estado Ativo */}
                        <div className="dr-grid-full">
                            <label className="dr-label">
                                {t("dataRights.create.isActive", "Mark Account as Active?")}
                            </label>
                            <select
                                className="dr-select"
                                value={
                                    creating.rectification.isActive === null || creating.rectification.isActive === undefined
                                        ? ""
                                        : creating.rectification.isActive ? "true" : "false"
                                }
                                onChange={e => {
                                    const v = e.target.value;
                                    updateRectification({
                                        isActive: v === "" ? null : v === "true"
                                    });
                                }}
                            >
                                <option value="">{t("dataRights.create.keepAsIs", "Keep as is")}</option>
                                <option value="true">{t("dataRights.create.setActive", "Set as Active")}</option>
                                <option value="false">{t("dataRights.create.setInactive", "Set as Inactive")}</option>
                            </select>
                        </div>

                        {/* Motivo */}
                        <div className="dr-grid-full">
                            <label className="dr-label">
                                {t("dataRights.create.reason", "Reason for changes")}
                            </label>
                            <textarea
                                className="dr-textarea"
                                rows={2}
                                value={creating.rectification.reason ?? ""}
                                onChange={e => updateRectification({ reason: e.target.value })}
                                placeholder={t("dataRights.create.reason_PH", "Why are these corrections needed?")}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="dr-wizard-container">
            <h2 className="dr-card-title">
                {step === 1
                    ? t("dataRights.create.wizardTitleDefault", "New Data Request")
                    : t("dataRights.create.wizardTitleType", "New {{type}} Request", { type: type })
                }
            </h2>

            {/* PROGRESSO */}
            <div className="dr-wizard-progress">
                <div className={`dr-progress-step ${step >= 1 ? "active" : ""}`}>
                    <div className="dr-step-badge">1</div>
                    <span>{t("dataRights.create.stepType", "Type")}</span>
                </div>
                <div className={`dr-progress-line ${step >= 2 ? "filled" : ""}`} />
                <div className={`dr-progress-step ${step >= 2 ? "active" : ""}`}>
                    <div className="dr-step-badge">2</div>
                    <span>{t("dataRights.create.stepDetails", "Details")}</span>
                </div>
            </div>

            {/* CONTEÚDO */}
            <div style={{ flex: 1 }}>
                {step === 1 ? renderStep1() : renderStep2()}
            </div>

            {/* RODAPÉ */}
            <div className="dr-wizard-footer">
                {step === 2 ? (
                    <button type="button" className="dr-back-btn" onClick={() => setStep(1)}>
                        ← {t("dataRights.create.back", "Back")}
                    </button>
                ) : <div />}

                {step === 2 && (
                    <button type="button" className="dr-primary-btn" onClick={onSubmit}>
                        🚀 {t("dataRights.create.submit", "Submit Request")}
                    </button>
                )}
            </div>
        </div>
    );
}