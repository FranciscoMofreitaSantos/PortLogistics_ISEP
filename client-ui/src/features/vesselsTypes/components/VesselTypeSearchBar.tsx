import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import type { VesselType } from "../domain/vesselType";
import { apiGetVesselTypeByName } from "../services/vesselTypeService";
import { mapVesselTypeDto } from "../mappers/vesselTypeMapper";

interface Props {
    items: VesselType[];
    onFilteredChange: (filtered: VesselType[]) => void;
}

const MIN_LOADING_TIME = 500;

async function runWithLoading<T>(promise: Promise<T>, text: string) {
    const id = toast.loading(text);
    const start = Date.now();
    try {
        return await promise;
    } finally {
        const elapsed = Date.now() - start;
        if (elapsed < MIN_LOADING_TIME) {
            await new Promise(res => setTimeout(res, MIN_LOADING_TIME - elapsed));
        }
        toast.dismiss(id);
    }
}

export default function VesselTypeSearchBar({ items, onFilteredChange }: Props) {
    const { t } = useTranslation();
    const [searchMode, setSearchMode] = useState<"local" | "name">("local");
    const [searchValue, setSearchValue] = useState("");

    const executeSearch = async () => {
        if (!searchValue.trim()) {
            onFilteredChange(items);
            return;
        }

        // ===== LOCAL =====
        if (searchMode === "local") {
            const q = searchValue.toLowerCase();
            const results = items.filter(v =>
                v.name.toLowerCase().includes(q) ||
                v.description?.toLowerCase().includes(q)
            );

            onFilteredChange(results);
            toast.success(t("vesselTypes.loadSuccess", { count: results.length }));
            return;
        }

        // ===== NAME (REMOTE) =====
        const dto = await runWithLoading(apiGetVesselTypeByName(searchValue), t("vesselTypes.loading")).catch(() => null);

        if (!dto) {
            onFilteredChange([]);
            //toast.error(t("vesselTypes.empty"));
            return;
        }

        const mapped = mapVesselTypeDto(dto);
        onFilteredChange([mapped]);
        toast.success(t("vesselTypes.loadSuccess", { count: 1 }));
    };

    return (
        <>
            <div className="vt-search-mode">
                <button
                    className={searchMode === "local" ? "active" : ""}
                    onClick={() => setSearchMode("local")}
                >
                    Local
                </button>
                <button
                    className={searchMode === "name" ? "active" : ""}
                    onClick={() => setSearchMode("name")}
                >
                    Name
                </button>
            </div>

            <div className="vt-search-box">
                <div className="vt-search-wrapper">
                    <input
                        placeholder={t("vesselTypes.searchPlaceholder")}
                        className="vt-search"
                        value={searchValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchValue(value);
                            if (value === "") onFilteredChange(items);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && executeSearch()}
                    />

                    {searchValue !== "" && (
                        <button
                            className="vt-clear-input"
                            onClick={() => {
                                setSearchValue("");
                                onFilteredChange(items);
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <button
                    className="vt-search-btn"
                    onClick={executeSearch}
                    title="Search"
                >
                    ↵
                </button>
            </div>
        </>
    );
}
