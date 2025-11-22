import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { VvnCrewModal } from "../components/modals/VvnCrewModal";
import type { CrewManifestDto } from "../dto/vvnTypesDtos";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

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
        expect(screen.getByText("vvn.modals.crew.empty")).toBeInTheDocument();
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
