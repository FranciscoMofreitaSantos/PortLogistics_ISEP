// src/features/users/components/UserSearch.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Select, TextInput, Button, Group } from "@mantine/core";
import { FaSearch } from "react-icons/fa";

type FilterType = "all" | "email" | "noRole";

interface UserSearchProps {
    onSearch: (type: FilterType, value: string) => void;
    isLoading: boolean;
}

export default function UserSearch({ onSearch, isLoading }: UserSearchProps) {
    const { t } = useTranslation();
    const [filterType, setFilterType] = useState<FilterType>("email");
    const [filterValue, setFilterValue] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (filterType === "email" && filterValue.trim() === "") {
            toast.error(t("search.errorEmpty"));
            return;
        }
        onSearch(filterType, filterValue.trim());
    };

    const handleClear = () => {
        setFilterType("email");
        setFilterValue("");
        onSearch("all", "");
    };

    const handleTypeChange = (value: string | null) => {
        const newType = (value ?? "email") as FilterType;
        setFilterType(newType);
        setFilterValue("");
    };

    const searchOptions = [
        { value: "email", label: t("search.byEmail") },
        { value: "noRole", label: t("search.noRole") },
        { value: "all", label: t("search.all") },
    ];

    return (
        <form onSubmit={handleSubmit}>
            <Group>
                <Select
                    data={searchOptions}
                    value={filterType}
                    onChange={handleTypeChange}
                    aria-label={t("search.title")}
                    disabled={isLoading}
                    style={{ width: 180 }}
                />

                <TextInput
                    type="email"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder={t("search.emailPlaceholder")}
                    disabled={filterType !== "email" || isLoading}
                    style={{ flex: 1 }} // Ocupa o espaço restante
                />

                <Button
                    type="submit"
                    leftSection={<FaSearch size={14} />}
                    loading={isLoading}
                >
                    {t("actions.search")}
                </Button>

                <Button
                    variant="default"
                    onClick={handleClear}
                    disabled={isLoading}
                >
                    {t("actions.clear")}
                </Button>
            </Group>
        </form>
    );
}