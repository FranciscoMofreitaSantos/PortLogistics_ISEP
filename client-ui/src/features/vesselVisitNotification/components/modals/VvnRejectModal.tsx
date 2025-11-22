import { useTranslation } from "react-i18next";

type Props = {
    open: boolean;
    onClose: () => void;
    message: string;
    setMessage: (v: string) => void;
    onConfirm: () => void;
};

export function VvnRejectModal({
                                   open,
                                   onClose,
                                   message,
                                   setMessage,
                                   onConfirm,
                               }: Props) {
    const { t } = useTranslation();
    if (!open) return null;

    return (
        <div className="sa-modal-backdrop" onClick={onClose}>
            <div className="vvn-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sa-dock-head">
                    <div className="sa-dock-spacer" />
                    <h3 className="sa-dock-title">{t("vvn.modals.reject.title")}</h3>
                    <button className="sa-icon-btn sa-dock-close" onClick={onClose}>
                        ✖
                    </button>
                </div>
                <div className="vvn-modal-body">
                    <textarea
                        className="sa-textarea"
                        placeholder={t("vvn.modals.reject.placeholder") as string}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <div className="vvn-modal-actions">
                    <button className="sa-btn sa-btn-cancel" onClick={onClose}>
                        {t("common.cancel")}
                    </button>
                    <button className="sa-btn sa-btn-danger" onClick={onConfirm}>
                        {t("common.confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}
