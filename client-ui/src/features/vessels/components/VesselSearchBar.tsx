import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";

type SearchMode = "local" | "imo" | "owner";

type Props = {
    searchMode: SearchMode;
    setSearchMode: (m: SearchMode) => void;
    searchValue: string;
    setSearchValue: (v: string) => void;
    onSearch: () => void;
    resetFilter: () => void;
};

export function VesselSearchBar({searchMode, setSearchMode, searchValue, setSearchValue, onSearch, resetFilter,}: Props) {
    const { t } = useTranslation();

    return (
        <>
            <div className="vt-search-mode">
                {["local", "imo", "owner"].map(m => (
                    <button
                        key={m}
                        className={searchMode === m ? "active" : ""}
                        onClick={() => setSearchMode(m as SearchMode)}
                    >
                        {t(`Vessel.modes.${m}`)}
                    </button>
                ))}
            </div>

            <div className="vt-search-box">
                <div className="vt-search-wrapper">
                    <input
                        placeholder={t("Vessel.searchPlaceholder")}
                        className="vt-search"
                        value={searchValue}
                        onChange={e => {
                            const val = e.target.value;
                            setSearchValue(val);
                            if (!val) resetFilter();
                        }}
                        onKeyDown={e => e.key === "Enter" && onSearch()}
                    />
                    {searchValue !== "" && (
                        <button
                            className="vt-clear-input"
                            onClick={() => {
                                setSearchValue("");
                                resetFilter();
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
                <button className="vt-search-btn" onClick={onSearch}>
                    <FaSearch />
                </button>
            </div>
        </>
    );
}
