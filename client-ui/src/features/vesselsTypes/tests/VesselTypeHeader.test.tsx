import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import VesselTypeHeader from "../components/VesselTypeHeader";

describe("VesselTypeHeader", () => {
    it("renderiza o título correto", () => {
        render(<VesselTypeHeader total={5} onCreateClick={() => {}} />);

        // como estamos a mockar i18n → aparece a *key* do título
        expect(screen.getByText("vesselTypes.title")).toBeInTheDocument();
    });

    it("renderiza o count", () => {
        render(<VesselTypeHeader total={7} onCreateClick={() => {}} />);

        // neste mock devolve: "vesselTypes.count (7)"
        expect(screen.getByText("vesselTypes.count (7)")).toBeInTheDocument();
    });

    it("renderiza o botão de adicionar", () => {
        render(<VesselTypeHeader total={0} onCreateClick={() => {}} />);

        // testamos via role para ser estável
        const button = screen.getByRole("button");

        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("+");
    });

    it("chama onCreateClick quando se clica no botão +", () => {
        const onCreate = vi.fn();

        render(<VesselTypeHeader total={3} onCreateClick={onCreate} />);

        const button = screen.getByRole("button");

        fireEvent.click(button);

        expect(onCreate).toHaveBeenCalledTimes(1);
    });

    it("não quebra se total = 0", () => {
        render(<VesselTypeHeader total={0} onCreateClick={() => {}} />);

        expect(screen.getByText("vesselTypes.count (0)")).toBeInTheDocument();
    });

    it("snapshot – garante que estrutura não muda sem querer", () => {
        const { container } = render(
            <VesselTypeHeader total={10} onCreateClick={() => {}} />
        );

        expect(container).toMatchSnapshot();
    });
});
