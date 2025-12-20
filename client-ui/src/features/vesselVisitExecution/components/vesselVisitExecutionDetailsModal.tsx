// features/vesselVisitExecution/components/VesselVisitExecutionDetailsModal.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { VesselVisitExecutionDTO } from '../dto/vesselVisitExecutionDTO';
import '../../complementaryTask/style/complementaryTask.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vve: VesselVisitExecutionDTO | null;
}

const VesselVisitExecutionDetailsModal: React.FC<Props> = ({ isOpen, onClose, vve }) => {
    const { t } = useTranslation();

    if (!isOpen || !vve) return null;

    const formatDate = (date: Date | string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString();
    };

    // CORREÇÃO: Verificação segura para evitar crash se o status for undefined
    const getStatusClassName = (status: string | undefined) => {
        if (!status) return 'status-unknown';
        return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
    };

    return (
        <div className="ct-modal-overlay">
            <div className="ct-modal-content">
                <div className="ct-modal-header">
                    <h2>{t('vve.details.title') || 'Detalhes da Execução de Visita de Navio'}</h2>
                </div>

                <div className="info-grid">
                    <div className="info-card">
                        <label>{t('vve.form.code') || 'Código'}</label>
                        <p>{vve.code || 'N/A'}</p>
                    </div>

                    <div className="info-card">
                        <label>{t('vve.form.vesselImo') || 'IMO do Navio'}</label>
                        <p>{vve.vesselImo || 'N/A'}</p>
                    </div>

                    <div className="info-card">
                        <label>{t('vve.form.actualArrivalTime') || 'Hora de Chegada Real'}</label>
                        <p>{formatDate(vve.actualArrivalTime)}</p>
                    </div>

                    <div className="info-card">
                        <label>{t('vve.form.status') || 'Estado'}</label>
                        <span className={`status-pill ${getStatusClassName(vve.status)}`}>
                            {vve.status || t('vve.status.unknown')}
                        </span>
                    </div>

                    <div className="info-card">
                        <label>{t('vve.form.creatorEmail') || 'Email do Criador'}</label>
                        <p>{vve.creatorEmail || 'N/A'}</p>
                    </div>
                </div>

                <div className="ct-modal-actions">
                    <button onClick={onClose} className="ct-cancel-button">
                        {t('actions.close') || 'Fechar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VesselVisitExecutionDetailsModal;