import { useTranslation } from "react-i18next";

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div style={{ padding: "2rem" }}>
            <h2>{t("notFound.title")}</h2>
            <p>{t("notFound.text")}</p>
        </div>
    );
}
