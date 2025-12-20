import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { createCT } from "../services/complementaryTaskService";
import { getAllCTC } from "../../complementaryTaskCategory/services/complementaryTaskCategoryService";
import type { CreateComplementaryTaskDTO } from "../dtos/createComplementaryTaskDTO";
import type { ComplementaryTaskCategory } from "../../complementaryTaskCategory/domain/complementaryTaskCategory";
import type { VesselVisitExecutionDTO } from "../../vesselVisitExecution/dto/vesselVisitExecutionDTO";
import "../style/complementaryTask.css";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    vveList: VesselVisitExecutionDTO[];
}

type FormState = {
    category: string;
    staff: string;
    vve: string;
    timeStart: string;
};

const initialData: FormState = {
    category: "",
    staff: "",
    vve: "",
    timeStart: ""
};

function ComplementaryTaskCreateModal({ isOpen, onClose, onCreated, vveList }: Props) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<FormState>(initialData);
    const [categories, setCategories] = useState<ComplementaryTaskCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
            setError(null);
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            const data = await getAllCTC();
            setCategories(data.filter(c => c.isActive));
        } catch {
            toast.error("Failed to load categories");
        }
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError(null);
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.category) {
            toast.error(t("ct.errors.categoryRequired") || "Category is required");
            return;
        }
        if (!formData.vve) {
            toast.error(t("ct.errors.vveRequired") || "VVE is required");
            return;
        }

        setIsLoading(true);

        // Prepara os dados para o DTO
        const submitData: CreateComplementaryTaskDTO = {
            category: formData.category, // ID da Categoria
            staff: formData.staff,
            vve: formData.vve,           // ID da VVE
            timeStart: new Date(formData.timeStart)
        };

        // --- DEBUG: Vê os dados no console antes de enviar ---
        console.log("📤 A enviar para API:", {
            category_id: submitData.category,
            vve_id: submitData.vve,
            staff: submitData.staff,
            timeStart: submitData.timeStart.toISOString()
        });

        try {
            await createCT(submitData);
            toast.success(t("ct.success.created") || "Task created successfully");
            onCreated();
            onClose();
        } catch (err) {
            const apiError = err as Error;
            setError(apiError);
            toast.error(apiError.message || "Creation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="ct-modal-overlay">
            <div className="ct-modal-content">
                <h2>{t("ct.createTitle") || "Create Complementary Task"}</h2>

                <form onSubmit={handleSubmit} className="ct-form">
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div className="ct-form-group" style={{ flex: 1 }}>
                            <label>{t("ct.form.category")}</label>
                            <select
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleValueChange}
                            >
                                <option value="">{t("common.select")}</option>
                                {categories.map(cat => (
                                    /* Corrigido: value agora é cat.id */
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="ct-form-group" style={{ flex: 1 }}>
                            <label>{t("ct.form.vve")}</label>
                            <select
                                required
                                name="vve"
                                value={formData.vve}
                                onChange={handleValueChange}
                            >
                                <option value="">{t("common.select")}</option>
                                {vveList.map(vve => (
                                    /* Corrigido: value agora é vve.id (o code é só para o utilizador ler) */
                                    <option key={vve.id} value={vve.id}>
                                        {vve.code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="ct-form-group">
                        <label>{t("ct.form.staff")}</label>
                        <input
                            required
                            name="staff"
                            type="text"
                            value={formData.staff}
                            onChange={handleValueChange}
                            placeholder="Staff ID or Name"
                        />
                    </div>

                    <div className="ct-form-group">
                        <label>{t("ct.form.startTime")}</label>
                        <input
                            required
                            name="timeStart"
                            type="datetime-local"
                            value={formData.timeStart}
                            onChange={handleValueChange}
                        />
                    </div>

                    {error && <p className="ct-error-message">{error.message}</p>}

                    <div className="ct-modal-actions-wizard">
                        <button type="button" onClick={onClose} className="ct-cancel-button">
                            {t("actions.cancel")}
                        </button>
                        <button type="submit" disabled={isLoading} className="ct-submit-button">
                            {isLoading ? t("common.saving") : t("ct.actions.create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ComplementaryTaskCreateModal;