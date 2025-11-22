import { useTranslation } from "react-i18next";
import type { CargoManifestEntryDto } from "../dto/vvnTypesDtos";
import { isoString } from "../mappers/vvnMappers";

type Props = { entries: CargoManifestEntryDto[] | undefined | null };

export function EntriesTable({ entries }: Props) {
    const { t } = useTranslation();
    if (!entries || entries.length === 0) {
        return <div className="sa-empty">{t("vvn.modals.loading.empty")}</div>;
    }

    return (
        <div className="vvn-table-wrap">
            <table className="vvn-table">
                <thead>
                <tr>
                    <th>{t("vvn.entriesTable.storageArea")}</th>
                    <th>{t("vvn.entriesTable.position")}</th>
                    <th>{t("vvn.entriesTable.iso")}</th>
                    <th>{t("vvn.entriesTable.type")}</th>
                    <th>{t("vvn.entriesTable.status")}</th>
                    <th>{t("vvn.entriesTable.weight")}</th>
                </tr>
                </thead>
                <tbody>
                {entries.map((e) => (
                    <tr key={e.id}>
                        <td>{e.storageAreaName}</td>
                        <td>{`Bay ${e.bay} · Row ${e.row} · Tier ${e.tier}`}</td>
                        <td>{isoString(e.container?.isoCode)}</td>
                        <td>{e.container?.type ?? "-"}</td>
                        <td>{e.container?.status ?? "-"}</td>
                        <td>{e.container?.weightKg ?? 0}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
