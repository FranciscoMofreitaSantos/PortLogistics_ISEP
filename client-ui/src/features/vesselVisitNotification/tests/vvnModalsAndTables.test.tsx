import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { EntriesTable } from "../components/EntriesTable";
import { VvnCrewModal } from "../components/modals/VvnCrewModal";
import { VvnCargoManifestModal } from "../components/modals/VvnCargoManifestModal";
import { VvnTasksModal } from "../components/modals/VvnTasksModal";
import { VvnRejectModal } from "../components/modals/VvnRejectModal";

import type {
    CargoManifestEntryDto,
    CrewManifestDto,
    CargoManifestDto,
    TaskDto,
} from "../dto/vvnTypesDtos";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

/* ===================== EntriesTable ===================== */

describe("EntriesTable", () => {
    it("mostra mensagem vazia quando entries é null/undefined", () => {
        render(<EntriesTable entries={null} />);
        expect(
            screen.getByText("vvn.modals.loading.empty"),
        ).toBeInTheDocument();
    });

    it("renderiza linhas com dados dos containers", () => {
        const entries: CargoManifestEntryDto[] = [
            {
                id: "e1",
                bay: 1,
                row: 2,
                tier: 3,
                storageAreaName: "A1",
                container: {
                    id: "c1",
                    isoCode: "MSCU1234567",
                    description: "Sample",
                    type: "General",
                    status: "Full",
                    weightKg: 1000,
                },
            },
            {
                id: "e2",
                bay: 5,
                row: 1,
                tier: 1,
                storageAreaName: "B2",
                container: {
                    id: "c2",
                    isoCode: "TGHU7654321",
                    description: "Another",
                    type: "Reefer",
                    status: "Empty",
                    weightKg: 2000,
                },
            },
        ];

        render(<EntriesTable entries={entries} />);

        expect(screen.getByText("A1")).toBeInTheDocument();
        expect(screen.getByText("B2")).toBeInTheDocument();
        expect(screen.getByText("MSCU1234567")).toBeInTheDocument();
        expect(screen.getByText("TGHU7654321")).toBeInTheDocument();
        expect(screen.getByText("General")).toBeInTheDocument();
        expect(screen.getByText("Reefer")).toBeInTheDocument();
    });
});

/* ===================== VvnCrewModal ===================== */

const sampleCrew: CrewManifestDto = {
    id: "cm1",
    totalCrew: 3,
    captainName: "John Doe",
    crewMembers: [
        {
            id: "m1",
            name: "Alice",
            role: "ChiefOfficer",
            nationality: "PT",
            citizenId: "123",
        },
        {
            id: "m2",
            name: "Bob",
            role: "Cook",
            nationality: "ES",
            citizenId: "456",
        },
    ],
};

describe("VvnCrewModal", () => {
    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VvnCrewModal open={false} onClose={() => {}} crewManifest={sampleCrew} />,
        );
        expect(container.firstChild).toBeNull();
    });

    it("mostra mensagem vazia quando não há crewManifest", () => {
        render(<VvnCrewModal open={true} onClose={() => {}} crewManifest={null} />);
        expect(
            screen.getByText("vvn.modals.crew.empty"),
        ).toBeInTheDocument();
    });

    it("renderiza dados do captain e da tripulação", () => {
        render(
            <VvnCrewModal open={true} onClose={() => {}} crewManifest={sampleCrew} />,
        );

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.getByText("ChiefOfficer")).toBeInTheDocument();
        expect(screen.getByText("Cook")).toBeInTheDocument();
    });
});

/* ===================== VvnCargoManifestModal ===================== */

const sampleManifest: CargoManifestDto = {
    id: "m1",
    code: "CM-001",
    type: "Loading",
    createdAt: "2025-01-01T10:00:00",
    createdBy: "System",
    entries: [],
};

describe("VvnCargoManifestModal", () => {
    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VvnCargoManifestModal
                open={false}
                onClose={() => {}}
                manifest={sampleManifest}
                mode="loading"
            />,
        );
        expect(container.firstChild).toBeNull();
    });

    it("mostra mensagem vazia quando manifest = null", () => {
        render(
            <VvnCargoManifestModal
                open={true}
                onClose={() => {}}
                manifest={null}
                mode="unloading"
            />,
        );
        expect(
            screen.getByText("vvn.modals.unloading.empty"),
        ).toBeInTheDocument();
    });

    it("renderiza campos principais do manifest no modo loading", () => {
        render(
            <VvnCargoManifestModal
                open={true}
                onClose={() => {}}
                manifest={sampleManifest}
                mode="loading"
            />,
        );

        expect(screen.getByText("CM-001")).toBeInTheDocument();
        expect(screen.getByText("Loading")).toBeInTheDocument();
        expect(screen.getByText("System")).toBeInTheDocument();
    });
});

/* ===================== VvnTasksModal ===================== */

const tasks: TaskDto[] = [
    { id: "t1", title: "Check docs", description: "Verify PDFs", status: "Open" },
    { id: "t2", title: "Call agent", description: "Phone call", status: "Done" },
];

describe("VvnTasksModal", () => {
    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VvnTasksModal open={false} onClose={() => {}} tasks={tasks} />,
        );
        expect(container.firstChild).toBeNull();
    });

    it("mostra mensagem vazia quando não há tasks", () => {
        render(<VvnTasksModal open={true} onClose={() => {}} tasks={[]} />);
        expect(
            screen.getByText("vvn.modals.tasks.empty"),
        ).toBeInTheDocument();
    });

    it("lista tasks quando existem", () => {
        render(<VvnTasksModal open={true} onClose={() => {}} tasks={tasks} />);

        expect(screen.getByText("Check docs")).toBeInTheDocument();
        expect(screen.getByText("Call agent")).toBeInTheDocument();
        // texto real é " · Open" / " · Done"
        expect(screen.getByText(/Open/)).toBeInTheDocument();
        expect(screen.getByText(/Done/)).toBeInTheDocument();
    });
});

/* ===================== VvnRejectModal ===================== */

describe("VvnRejectModal", () => {
    let onClose: () => void;
    let onConfirm: () => void;
    let setMessage: (msg: string) => void;

    beforeEach(() => {
        onClose = vi.fn();
        onConfirm = vi.fn();
        setMessage = vi.fn();
    });

    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VvnRejectModal
                open={false}
                onClose={onClose}
                message=""
                setMessage={setMessage}
                onConfirm={onConfirm}
            />,
        );
        expect(container.firstChild).toBeNull();
    });

    it("permite escrever mensagem e chamar onConfirm", () => {
        render(
            <VvnRejectModal
                open={true}
                onClose={onClose}
                message="Initial"
                setMessage={setMessage}
                onConfirm={onConfirm}
            />,
        );

        const textarea = screen.getByPlaceholderText(
            "vvn.modals.reject.placeholder",
        ) as HTMLTextAreaElement;

        fireEvent.change(textarea, { target: { value: "New reject reason" } });
        expect(setMessage).toHaveBeenCalledWith("New reject reason");

        const confirmBtn = screen.getByText("common.confirm");
        fireEvent.click(confirmBtn);

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("botão cancel chama onClose", () => {
        render(
            <VvnRejectModal
                open={true}
                onClose={onClose}
                message=""
                setMessage={setMessage}
                onConfirm={onConfirm}
            />,
        );

        const cancelBtn = screen.getByText("common.cancel");
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
