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

        const submitData: CreateComplementaryTaskDTO = {
            category: formData.category,
            staff: formData.staff,
            vve: formData.vve,
            timeStart: new Date(formData.timeStart)
        };

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
                            <label htmlFor="ct-category">{t("ct.form.category")}</label>
                            <select
                                id="ct-category"
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleValueChange}
                            >
                                <option value="">{t("common.select")}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="ct-form-group" style={{ flex: 1 }}>
                            <label htmlFor="ct-vve">{t("ct.form.vve")}</label>
                            <select
                                id="ct-vve"
                                required
                                name="vve"
                                value={formData.vve}
                                onChange={handleValueChange}
                            >
                                <option value="">{t("common.select")}</option>
                                {vveList.map(vve => (
                                    <option key={vve.id} value={vve.id}>
                                        {vve.code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="ct-form-group">
                        <label htmlFor="ct-staff">{t("ct.form.staff")}</label>
                        <input
                            id="ct-staff"
                            required
                            name="staff"
                            type="text"
                            value={formData.staff}
                            onChange={handleValueChange}
                            placeholder="Staff ID or Name"
                        />
                    </div>

                    <div className="ct-form-group">
                        <label htmlFor="ct-timeStart">{t("ct.form.startTime")}</label>
                        <input
                            id="ct-timeStart"
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