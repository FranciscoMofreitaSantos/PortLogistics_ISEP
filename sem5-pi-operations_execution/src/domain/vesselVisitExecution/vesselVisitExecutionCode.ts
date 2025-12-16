import { ValueObject } from "../../core/domain/ValueObject";

interface VesselVisitExecutionCodeProps {
    value: string;
}

export class VesselVisitExecutionCode extends ValueObject<VesselVisitExecutionCodeProps> {

    get value(): string {
        return this.props.value;
    }

    private constructor(props: VesselVisitExecutionCodeProps) {
        super(props);
    }

    public static create(value: string): VesselVisitExecutionCode {
        return new VesselVisitExecutionCode({ value });
    }
}

//TODO MANU IMPLEMENTA ESTA MERDA SÓ FIZ ISTO ASSIM SIMPLES PARA PODER USAR NA MINHA