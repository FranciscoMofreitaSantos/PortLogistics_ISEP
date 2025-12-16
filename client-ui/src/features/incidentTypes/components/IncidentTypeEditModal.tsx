import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import "../style/incidentType.css";
import type { IncidentType, Severity } from "../domain/incidentType";
import type { UpdateIncidentTypeDTO } from "../dtos/updateIncidentTypeDTO";
import {
    updateIncidentType,
    getIncidentTypeRoots,
    getIncidentTypesByName,
    getIncidentTypeByCode
} from "../services/incidentTypeService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
    resource: IncidentType;
}

const severities: Severity[] = ["Minor", "Major", "Critical"];

function IncidentTypeEditModal({ isOpen, onClose, onUpdated, resource }: Props) {
    const { t } = useTranslation();

    // Form Data
    const [formData, setFormData] = useState<UpdateIncidentTypeDTO>({
        name: resource.name,
        description: resource.description,
        severity: resource.severity,
        parentCode: resource.parentCode ?? null
    });

    // Parent Search Logic
    const [parentSearch, setParentSearch] = useState("");
    const [parentCandidates, setParentCandidates] = useState<IncidentType[]>([]);
    const [isSearchingParent, setIsSearchingParent] = useState(false);

    // Loading/Error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: resource.name,
                description: resource.description,
                severity: resource.severity,
                parentCode: resource.parentCode ?? null
            });
            setError(null);
            setParentSearch("");
            // Load roots initially as suggestions
            loadDefaultParents();
        }
    }, [isOpen, resource]);

    const loadDefaultParents = async () => {
        try {
            const data = await getIncidentTypeRoots();
            // Filter out self to prevent immediate cycle
            setParentCandidates(data.filter(i => i.code !== resource.code));
        } catch {
            // silent fail or toast
        }
    };

    // Debounced Parent Search
    useEffect(() => {
        if (!isOpen) return;

        const q = parentSearch.trim();
        const handle = setTimeout(async () => {
            if (q === "") {
                loadDefaultParents();
                return;
            }

            setIsSearchingParent(true);
            try {
                // Search by Name
                const resultsByName = await getIncidentTypesByName(q);

                // Try Search by Code if short
                let resultsByCode: IncidentType[] = [];
                if (q.length < 10) {
                    try {
                        const res = await getIncidentTypeByCode(q);
                        if (res) resultsByCode = [res];
                    } catch { /* ignore */ }
                }

                // Merge and Deduplicate
                const merged = [...resultsByCode, ...resultsByName];
                const unique = Array.from(new Map(merged.map(item => [item.code, item])).values());

                // Filter out SELF (cannot be own parent)
                setParentCandidates(unique.filter(i => i.code !== resource.code));

            } catch (err) {
                console.error(err);
            } finally {
                setIsSearchingParent(false);
            }
        }, 300);

        return () => clearTimeout(handle);
    }, [parentSearch, isOpen, resource.code]);

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError(null);
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || formData.name.trim() === "") {
            toast.error(t("incidentType.errors.nameRequired"));
            return;
        }

        setIsLoading(true);
        try {
            await updateIncidentType(resource.code, {
                name: formData.name.trim(),
                description: (formData.description ?? "").trim(),
                severity: formData.severity,
                parentCode: formData.parentCode // null or string
            });
            toast.success(t("incidentType.success.updated"));
            onUpdated();
        } catch (err) {
            const apiError = err as Error;
            setError(apiError);
            toast.error(apiError.message || t("incidentType.errors.updateFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="it-modal-overlay">
            <div className="it-modal-content">
                <h2>{t("incidentType.editModal.title")} - {resource.code}</h2>

                <form onSubmit={handleSubmit} className="it-form">

                    {/* Read Only Code */}
                    <div className="it-form-group">
                        <label>{t("incidentType.form.code")} ({t("incidentType.read-only")})</label>
                        <input type="text" value={resource.code} disabled className="info-card-input" />
                    </div>

                    {/* Name */}
                    <div className="it-form-group">
                        <label>{t("incidentType.form.name")}</label>
                        <input
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleValueChange}
                        />
                    </div>

                    {/* Description */}
                    <div className="it-form-group">
                        <label>{t("incidentType.form.description")}</label>
                        <input
                            name="description"
                            type="text"
                            value={formData.description}
                            onChange={handleValueChange}
                        />
                    </div>

                    {/* Severity */}
                    <div className="it-form-group">
                        <label>{t("incidentType.form.severity")}</label>
                        <select
                            name="severity"
                            value={formData.severity}
                            onChange={handleValueChange}
                        >
                            {severities.map(s => (
                                <option key={s} value={s}>{t(`incidentType.severity.${s}`)}</option>
                            ))}
                        </select>
                    </div>

                    {/* --- NEW: PARENT SELECTOR WITH SEARCH --- */}
                    <div className="it-form-group">
                        <label>{t("incidentType.form.parent")}</label>

                        {/* 1. Search Box to find the parent */}
                        <input
                            type="text"
                            placeholder={t("incidentType.parent.searchPlaceholder")}
                            value={parentSearch}
                            onChange={(e) => setParentSearch(e.target.value)}
                            className="it-search-input-small"
                            style={{ marginBottom: '0.5rem' }}
                        />

                        {/* 2. Select Box populated by search results */}
                        <select
                            name="parentCode"
                            value={formData.parentCode ?? ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({ ...prev, parentCode: val === "" ? null : val }));
                            }}
                            disabled={isSearchingParent}
                        >
                            <option value="">{t("incidentType.parent.none")}</option>

                            {/* Always show the CURRENT parent if it's not in the candidates list (to avoid UI bug where it looks empty) */}
                            {resource.parentCode && !parentCandidates.find(c => c.code === resource.parentCode) && (
                                <option value={resource.parentCode}>
                                    {resource.parentCode} (Current)
                                </option>
                            )}

                            {parentCandidates.map(p => (
                                <option key={p.id} value={p.code}>
                                    {p.code} – {p.name}
                                </option>
                            ))}
                        </select>
                        <small style={{ color: '#666', fontSize: '0.8rem' }}>
                            {t("incidentType.parent.searchPlaceholder")}
                        </small>
                    </div>
                    {/* ---------------------------------------- */}

                    {error && <p className="it-error-message">{error.message}</p>}

                    <div className="it-modal-actions-wizard">
                        <button type="button" onClick={onClose} className="it-cancel-button">
                            {t("actions.cancel")}
                        </button>
                        <button type="submit" className="it-submit-button" disabled={isLoading}>
                            {isLoading ? t("common.saving") : t("actions.save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default IncidentTypeEditModal;