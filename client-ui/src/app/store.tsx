import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

interface AppState {
    user: User | null;
    loading: boolean;
    setUser: (u: User | null) => void;
    setLoading: (v: boolean) => void;
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            loading: false,
            setUser: (u) => set({ user: u }),
            setLoading: (v) => set({ loading: v }),
            theme: "light",
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === "light" ? "dark" : "light",
                })),
        }),
        {
            name: "thpa-auth",
        }
    )
);