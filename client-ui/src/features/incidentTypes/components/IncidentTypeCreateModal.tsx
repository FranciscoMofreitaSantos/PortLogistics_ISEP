import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import "../style/incidentType.css";
import type { CreateIncidentTypeDTO } from "../dtos/createIncidentTypeDTO";
import type { Severity, IncidentType } from "../domain/incidentType";
import {
    createIncidentType,
    getIncidentTypeRoots,
    getIncidentTypesByName,
    getIncidentTypeByCode,
} from "../services/incidentTypeService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const severities: Severity[] = ["Minor", "Major", "Critical"];

const initialData: Partial<CreateIncidentTypeDTO> = {
    code: "",
    name: "",
    description: "",
    severity: "Minor",
    parentCode: null,
};

function dedupeByCode(list: IncidentType[]) {
    const map = new Map<string, IncidentType>();
    for (const it of list) map.set(it.code, it);
    return Array.from(map.values());
}

function IncidentTypeCreateModal({ isOpen, onClose, onCreated }: Props) {
    const { t } = useTranslation();

    const [step, setStep] = useState<1 | 2>(1);

    // Parent selection
    const [parentSearch, setParentSearch] = useState("");
    const [selectedParent, setSelectedParent] = useState<IncidentType | null>(null); // null => Root
    const [parentCandidates, setParentCandidates] = useState<IncidentType[]>([]);
    const [parentLoading, setParentLoading] = useState(false);
    const [parentError, setParentError] = useState<string | null>(null);

    // Form
    const [formData, setFormData] = useState<Partial<CreateIncidentTypeDTO>>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<Error | null>(null);

    // When modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setParentSearch("");
            setSelectedParent(null);
            setParentCandidates([]);
            setParentLoading(false);
            setParentError(null);

            setFormData(initialData);
            setIsLoading(false);
            setSubmitError(null);
            return;
        }

        // Load default suggestions (roots) for convenience
        (async () => {
            setParentLoading(true);
            setParentError(null);
            try {
                const roots = await getIncidentTypeRoots();
                setParentCandidates(roots);
            } catch {
                setParentCandidates([]);
                setParentError(t("incidentType.errors.loadRoots"));
                toast.error(t("incidentType.errors.loadRoots"));
            } finally {
                setParentLoading(false);
            }
        })();
    }, [isOpen, t]);

    // Debounced search across ALL incident types (not only roots)
    useEffect(() => {
        if (!isOpen) return;

        const q = parentSearch.trim();
        const handle = setTimeout(async () => {
            // If empty, return to roots (quick pick)
            if (q === "") {
                setParentLoading(true);
                setParentError(null);
                try {
                    const roots = await getIncidentTypeRoots();
                    setParentCandidates(roots);
                } catch {
                    setParentCandidates([]);
                    setParentError(t("incidentType.errors.loadRoots"));
                } finally {
                    setParentLoading(false);
                }
                return;
            }

            setParentLoading(true);
            setParentError(null);

            try {
                const resultsByName = await getIncidentTypesByName(q);

                // If user typed something that looks like a code, also attempt direct lookup
                let byCode: IncidentType[] = [];
                const looksLikeCode = /[A-Za-z]-/i.test(q) || q.length <= 12;
                if (looksLikeCode) {
                    try {
                        const one = await getIncidentTypeByCode(q);
                        if (one) byCode = [one];
                    } catch {
                        // ignore code lookup failure; name results still usable
                    }
                }

                const merged = dedupeByCode([...byCode, ...resultsByName]);
                setParentCandidates(merged);
            } catch (err) {
                setParentCandidates([]);
                setParentError((err as Error)?.message ?? t("incidentType.errors.search"));
            } finally {
                setParentLoading(false);
            }
        }, 300);

        return () => clearTimeout(handle);
    }, [parentSearch, isOpen, t]);

    const parentSummary = useMemo(() => {
        if (!selectedParent) return t("incidentType.parent.none");
        return `${selectedParent.code} — ${selectedParent.name}`;
    }, [selectedParent, t]);

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSubmitError(null);
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const goToDetails = () => setStep(2);
    const goBackToParent = () => setStep(1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!formData.code || formData.code.trim() === "") {
            const msg = t("incidentType.errors.codeRequired");
            setSubmitError(new Error(msg));
            toast.error(msg);
            return;
        }
        if (!formData.name || formData.name.trim() === "") {
            const msg = t("incidentType.errors.nameRequired");
            setSubmitError(new Error(msg));
            toast.error(msg);
            return;
        }

        setIsLoading(true);
        try {
            const dtoToSend: CreateIncidentTypeDTO = {
                code: formData.code!.trim(),
                name: formData.name!.trim(),
                description: (formData.description ?? "").trim(),
                severity: (formData.severity ?? "Minor") as Severity,
                parentCode: selectedParent?.code ?? null,
            };

            await createIncidentType(dtoToSend);
            toast.success(t("incidentType.success.created"));
            onCreated();
        } catch (err) {
            const apiError = err as Error;
            setSubmitError(apiError);
            toast.error(apiError.message || t("incidentType.errors.createFailedGeneric"));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="it-modal-overlay">
            <div className="it-modal-content it-modal-content--wide">
                <div className="it-modal-header">
                    <div>
                        <h2 className="it-modal-title">{t("incidentType.createModal.title")}</h2>
                        <p className="it-modal-subtitle">{t("incidentType.createModal.subtitle")}</p>
                    </div>
                </div>

                <div className="it-stepper">
                    <div className={`it-step ${step === 1 ? "active" : "complete"}`}>
                        <div className="it-step-dot">{step === 1 ? "1" : "✓"}</div>
                        <div className="it-step-meta">
                            <div className="it-step-title">{t("incidentType.steps.parent")}</div>
                            <div className="it-step-desc">{t("incidentType.steps.parentDesc")}</div>
                        </div>
                    </div>

                    <div className={`it-step ${step === 2 ? "active" : ""}`}>
                        <div className="it-step-dot">2</div>
                        <div className="it-step-meta">
                            <div className="it-step-title">{t("incidentType.steps.details")}</div>
                            <div className="it-step-desc">{t("incidentType.steps.detailsDesc")}</div>
                        </div>
                    </div>
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="it-step-body">
                        <div className="it-parent-header">
                            <div>
                                <h3 className="it-section-title">{t("incidentType.selectParent")}</h3>
                                {/* Atualiza este texto nas traduções: agora é “qualquer tipo”, não só roots */}
                                <p className="it-section-help">{t("incidentType.parent.help")}</p>
                            </div>

                            <div className="it-parent-meta">
                <span className="it-count-pill">
                  {t("incidentType.parent.resultsCount", { count: parentCandidates.length })}
                </span>
                            </div>
                        </div>

                        <div className="it-parent-search">
                            <input
                                type="text"
                                value={parentSearch}
                                onChange={(e) => setParentSearch(e.target.value)}
                                placeholder={t("incidentType.parent.searchPlaceholder")}
                                className="it-search-input it-search-input--soft"
                            />
                            {parentSearch.trim() !== "" && (
                                <button
                                    type="button"
                                    className="it-clear-inline"
                                    onClick={() => setParentSearch("")}
                                    aria-label={t("actions.clear")}
                                    title={t("actions.clear")}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {parentLoading && <p>{t("common.loading")}</p>}
                        {parentError && <p className="it-error-message">{parentError}</p>}

                        <div className="it-parent-grid">
                            {/* Root option */}
                            <button
                                type="button"
                                className={`it-parent-card ${selectedParent === null ? "selected" : ""}`}
                                onClick={() => setSelectedParent(null)}
                            >
                                <div className="it-parent-icon">🌳</div>
                                <div className="it-parent-text">
                                    <div className="it-parent-title">{t("incidentType.parent.none")}</div>
                                    <div className="it-parent-sub">{t("incidentType.parent.noneDesc")}</div>
                                </div>
                            </button>

                            {/* Candidates: roots by default; search results can include children */}
                            {!parentLoading && parentCandidates.length === 0 ? (
                                <div className="it-parent-empty">
                                    <div className="it-parent-empty-title">{t("incidentType.parent.noResults")}</div>
                                    <div className="it-parent-empty-sub">{t("incidentType.parent.noResultsHint")}</div>
                                </div>
                            ) : (
                                parentCandidates.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        className={`it-parent-card ${selectedParent?.code === r.code ? "selected" : ""}`}
                                        onClick={() => setSelectedParent(r)}
                                    >
                                        <div className="it-parent-icon">📁</div>
                                        <div className="it-parent-text">
                                            <div className="it-parent-title">{r.code}</div>
                                            <div className="it-parent-sub">{r.name}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="it-modal-actions-wizard it-modal-actions-wizard--single">
                            <button type="button" onClick={onClose} className="it-cancel-button">
                                {t("actions.cancel")}
                            </button>
                            <button type="button" onClick={goToDetails} className="it-submit-button">
                                {t("actions.next")}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="it-step-body">
                        <div className="it-details-header">
                            <div className="it-parent-summary">
                                <span className="it-parent-summary-label">{t("incidentType.parent.selected")}</span>
                                <span className="it-parent-summary-value">{parentSummary}</span>
                            </div>
                        </div>

                        <div className="it-form-grid">
                            <div className="it-form-group">
                                <label>{t("incidentType.form.code")}</label>
                                <input
                                    required
                                    name="code"
                                    type="text"
                                    value={formData.code ?? ""}
                                    onChange={handleValueChange}
                                    placeholder={t("incidentType.form.codePH")}
                                />
                            </div>

                            <div className="it-form-group">
                                <label>{t("incidentType.form.name")}</label>
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    value={formData.name ?? ""}
                                    onChange={handleValueChange}
                                    placeholder={t("incidentType.form.namePH")}
                                />
                            </div>

                            <div className="it-form-group it-form-group--full">
                                <label>{t("incidentType.form.description")}</label>
                                <input
                                    name="description"
                                    type="text"
                                    value={formData.description ?? ""}
                                    onChange={handleValueChange}
                                    placeholder={t("incidentType.form.descriptionPH")}
                                />
                            </div>

                            <div className="it-form-group">
                                <label>{t("incidentType.form.severity")}</label>
                                <select
                                    name="severity"
                                    value={(formData.severity ?? "Minor") as Severity}
                                    onChange={handleValueChange}
                                >
                                    {severities.map((s) => (
                                        <option key={s} value={s}>
                                            {t(`incidentType.severity.${s}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {submitError && <p className="it-error-message">{submitError.message}</p>}

                        <div className="it-modal-actions-wizard">
                            <button type="button" onClick={goBackToParent} className="it-cancel-button">
                                {t("actions.back")}
                            </button>

                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button type="button" onClick={onClose} className="it-clear-button">
                                    {t("actions.cancel")}
                                </button>
                                <button type="submit" disabled={isLoading} className="it-submit-button">
                                    {isLoading ? t("common.saving") : t("actions.create")}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default IncidentTypeCreateModal;
