import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type { PhysicalResource } from "../domain/physicalResource";
import type { UpdatePhysicalResourceRequest } from "../dtos/physicalResource";
import { PhysicalResourceType } from "../domain/physicalResource";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../style/physicalResource.css";

interface PhysicalResourceBusyModalProps {
    resource: PhysicalResource;
    isOpen: boolean;
    onClose: () => void;
    operations: PhysicalResource[];
}

function PhysicalResourceBusyModal({ isOpen, onClose, resource, operations }: PhysicalResourceBusyModalProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [formData, setFormData] = useState<UpdatePhysicalResourceRequest & {
        busyFrom?: Date | null;
        busyTo?: Date | null;
    }>({
        busyFrom: null,
        busyTo: null,
    });
    const [busyTime, setBusyTime] = useState(0);
    const opsN = operations.entries();

    useEffect(() => {
        if (isOpen && resource) {
            setIsAnimatingOut(false);
            setFormData({
                busyFrom: null,
                busyTo: null,
            });
            setError(null);
        }
    }, [isOpen, resource, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!formData.description) {
                throw new Error(t("physicalResource.errors.descriptionRequired"));
            }
            
            //todo get PR availability by dates

        } catch (err) {
            const error = err as Error;
            setError(error);
            toast.error(error.message || t("physicalResource.errors.updateFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    const payload = {
        ...formData,
        busyFrom: formData.busyFrom?.toISOString(),
        busyTo: formData.busyTo?.toISOString(),
    };

    

    if (!isOpen && !isAnimatingOut) {
        return null;
    }

    return (
        <div className={`pr-modal-overlay ${isAnimatingOut ? 'anim-out' : ''}`}>
            {/* Modal Content */}
            <form onSubmit={handleSubmit} className={`pr-details-modal-content ${isAnimatingOut ? 'anim-out' : ''}`}>

                {/* Hero Header */}
                <div className="pr-details-hero">
                    <div className="hero-icon-wrapper">
                        📅
                    </div>
                    <div className="hero-text">
                        <h2>{t("physicalResource.Allocationform.title", { code: resource.code.value })}</h2>
                        {/* Exibir o Tipo */}
                        <p className="details-description">{t(`physicalResource.types.${resource.physicalResourceType}`)}</p>
                    </div>
                </div>

                {/* Grid de Inputs */}
                <div className="pr-busy-bars">
                    <div className="pr-busy-bar">
                        <span className="pr-busy-bar-label"> {t("physicalResource.Allocationform.busyFrom")}</span>
                        <DatePicker
                            selected={formData.busyFrom}
                            onChange={(date: Date|null) =>
                                setFormData(prev => ({ ...prev, busyFrom: date }))
                            }
                            dateFormat="yyyy-MM-dd"
                        />
                    </div>

                    <div className="pr-busy-bar">
                        <span className="pr-busy-bar-label">{t("physicalResource.Allocationform.busyTo")}</span>
                        <DatePicker
                            selected={formData.busyTo}
                            onChange={(date: Date|null) =>
                                setFormData(prev => ({ ...prev, busyTo: date }))
                            }
                            minDate={formData.busyFrom || undefined}
                            dateFormat="yyyy-MM-dd"
                        />
                    </div>
                </div>
                
                {/*Barra de ocupação*/}
                <div>
                    <div className="pr-occupancy-wrapper">
                        <div className="pr-occupancy-label">
                           <h2>{t("physicalResource.Allocationform.occupancy")}{busyTime}</h2> 
                        </div>
                    </div>
                </div>

                {/*Lista de Operation Plans*/} 
                <h3> {t("physicalResource.Allocationform.operationsQuant")}{opsN} </h3>           
                <table className="pr-table">
                    <thead>
                        <tr>
                            <th>{t("physicalResource.table.code")}</th>
                            <th>{t("physicalResource.table.description")}</th>
                            <th>{t("physicalResource.table.type")}</th>
                            <th>{t("physicalResource.table.status")}</th>
                            <th>{t("physicalResource.table.actions")}</th>
                        </tr>
                        <tbody>
                        {operations.map((operation) => (
                            <tr key={operation.id}>
                                <td>{operation.code.value}</td>
                                <td>{operation.description}</td>
                            </tr>
                        ))}
                        </tbody>
                    </thead>
                </table>

                {/* Botões de Ação */}
                <div className="pr-modal-actions">
                    <button type="button" onClick={handleClose} className="pr-cancel-button" disabled={isLoading}>
                        {t("physicalResource.actions.cancel")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PhysicalResourceBusyModal;