// src/features/storageAreas/tests/StorageAreaCreatePage.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CreatingStorageArea } from "../domain/storageArea";

/* ========= MOCKS (SEM VARIÁVEIS EXTERNAS) ========= */

// react-router-dom
vi.mock("react-router-dom", () => {
    const navigate = vi.fn();
    return {
        useNavigate: () => navigate,
    };
});

// i18n
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// toast – só stubs, não precisamos inspecionar
vi.mock("react-hot-toast", () => ({
    default: {
        loading: () => "toast-id",
        dismiss: () => {},
        error: () => {},
        success: () => {},
    },
}));

// service – createStorageArea é um vi.fn() interno
vi.mock("../service/storageAreaService", () => ({
    default: {
        createStorageArea: vi.fn(),
    },
}));

// Header (simplificado)
vi.mock("../components/StorageAreaCreateHeader", () => ({
    StorageAreaCreateHeader: ({ onBack }: { onBack: () => void }) => (
        <div>
            <h2>HEADER-MOCK</h2>
            <button onClick={onBack}>back-header</button>
        </div>
    ),
}));

// GeneralSection – só mexe no name
vi.mock("../components/StorageAreaGeneralSection", () => ({
    StorageAreaGeneralSection: ({
                                    form,
                                    setField,
                                }: {
        form: CreatingStorageArea;
        setField: (k: keyof CreatingStorageArea, v: any) => void;
    }) => (
        <div>
            <input
                placeholder="name-input"
                value={form.name}
                onChange={e => setField("name", e.target.value)}
            />
        </div>
    ),
}));

// ResourcesSection – apenas para adicionar uma dock distance
vi.mock("../components/StorageAreaResourcesSection", () => ({
    StorageAreaResourcesSection: (props: any) => (
        <div>
            <input
                placeholder="dock-code-input"
                value={props.newDock}
                onChange={e => props.setNewDock(e.target.value)}
            />
            <input
                placeholder="dock-dist-input"
                value={props.newDist === "" ? "" : String(props.newDist)}
                onChange={e =>
                    props.setNewDist(
                        e.target.value === "" ? "" : Number(e.target.value)
                    )
                }
            />
            <button type="button" onClick={props.addDock}>
                add-dock
            </button>
        </div>
    ),
}));

// ===== IMPORTS DEPOIS DOS MOCKS =====

import StorageAreaCreatePage from "../pages/StorageAreaCreatePage";
import { useNavigate } from "react-router-dom";
import storageAreaService from "../service/storageAreaService";

// obter os mocks a partir dos módulos já mockados
const navMock = useNavigate() as any;
const createStorageAreaMock = storageAreaService.createStorageArea as any;

describe("StorageAreaCreatePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        navMock.mockClear();
        createStorageAreaMock.mockClear();
    });

    it("clica em back do header e chama nav(-1)", () => {
        render(<StorageAreaCreatePage />);

        const backBtn = screen.getByText("back-header");
        fireEvent.click(backBtn);

        expect(navMock).toHaveBeenCalledWith(-1);
    });

    it("botão Cancel navega -1", () => {
        render(<StorageAreaCreatePage />);

        const cancelBtn = screen.getByText("storageAreas.create.btnCancel");
        fireEvent.click(cancelBtn);

        expect(navMock).toHaveBeenCalledWith(-1);
    });

    it("submit sem nome não chama createStorageArea", async () => {
        createStorageAreaMock.mockResolvedValue({ id: "X" });

        render(<StorageAreaCreatePage />);

        const createBtn = screen.getByText("storageAreas.create.btnCreate");
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(createStorageAreaMock).not.toHaveBeenCalled();
        });
    });

    it("submit sem distâncias não chama createStorageArea", async () => {
        createStorageAreaMock.mockResolvedValue({ id: "X" });

        render(<StorageAreaCreatePage />);

        // preencher o nome via GeneralSection mock
        const nameInput = screen.getByPlaceholderText(
            "name-input"
        ) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: "Yard A" } });

        const createBtn = screen.getByText("storageAreas.create.btnCreate");
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(createStorageAreaMock).not.toHaveBeenCalled();
        });
    });

    it("submit com dados válidos chama service e navega para /storage-areas", async () => {
        createStorageAreaMock.mockResolvedValue({ id: "A1" });

        render(<StorageAreaCreatePage />);

        // nome
        const nameInput = screen.getByPlaceholderText(
            "name-input"
        ) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: "Yard A" } });

        // adicionar distância a um dock
        const dockCodeInput = screen.getByPlaceholderText(
            "dock-code-input"
        ) as HTMLInputElement;
        const dockDistInput = screen.getByPlaceholderText(
            "dock-dist-input"
        ) as HTMLInputElement;

        fireEvent.change(dockCodeInput, { target: { value: "D1" } });
        fireEvent.change(dockDistInput, { target: { value: "100" } });

        const addDockBtn = screen.getByText("add-dock");
        fireEvent.click(addDockBtn);

        const createBtn = screen.getByText("storageAreas.create.btnCreate");
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(createStorageAreaMock).toHaveBeenCalledTimes(1);
            expect(navMock).toHaveBeenCalledWith("/storage-areas");
        });
    });
});
