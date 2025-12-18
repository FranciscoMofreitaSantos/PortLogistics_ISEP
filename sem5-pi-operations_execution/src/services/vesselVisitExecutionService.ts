import { Service, Inject } from "typedi";
import { Logger } from "winston";
import IVesselVisitExecutionService from "./IServices/IVesselVisitExecutionService";
import IVesselVisitExecutionRepo from "./IRepos/IVesselVisitExecutionRepo";
import { IVesselVisitExecutionDTO } from "../dto/IVesselVisitExecutionDTO";
import { Result } from "../core/logic/Result";
import { VesselVisitExecution } from "../domain/vesselVisitExecution/vesselVisitExecution";
import { VesselVisitExecutionCode } from "../domain/vesselVisitExecution/vesselVisitExecutionCode";

import { BusinessRuleValidationError } from "../core/logic/BusinessRuleValidationError";
import VvnService from "./ExternalData/vvnService";
import VesselVisitExecutionMap from "../mappers/VesselVisitExecutionMap";

@Service()
export default class VesselVisitExecutionService implements IVesselVisitExecutionService {

    constructor(
        @Inject("VesselVisitExecutionRepo")
        private repo: IVesselVisitExecutionRepo,

        @Inject(() => VvnService)
        private vvnService: VvnService,

        @Inject("logger")
        private logger: Logger,

        @Inject('VesselVisitExecutionMap')
        private vesselVisitExecutionMap: VesselVisitExecutionMap
    ) {}

    public async createAsync(dto: IVesselVisitExecutionDTO): Promise<Result<IVesselVisitExecutionDTO>> {
        this.logger.info("Creating Vessel Visit Execution (VVE)");

        const externalVvn = await this.vvnService.fetchById(dto.vvnId);
        if (!externalVvn) {
            throw new BusinessRuleValidationError("VVN not found in the System");
        }

        const existingVve = await this.repo.findByVvnId(dto.vvnId);
        if (existingVve) {
            throw new BusinessRuleValidationError("Já existe um registo de execução para esta visita.");
        }

        const code = await this.generateCodeAsync();

        const vve = VesselVisitExecution.create({
            code: code,
            vvnId: dto.vvnId,
            vesselImo: externalVvn.vesselImo,
            actualArrivalTime: new Date(dto.actualArrivalTime),
            creatorEmail: dto.creatorEmail,
            status: "In Progress",
        });

        const savedVve = await this.repo.save(vve);

        return Result.ok<IVesselVisitExecutionDTO>(this.vesselVisitExecutionMap.toDTO(savedVve));
    }
    public async getAllAsync(): Promise<Result<IVesselVisitExecutionDTO[]>> {
        this.logger.debug("A procurar todos os registos de Vessel Visit Execution (VVE)");

        try {
            const vves = await this.repo.findAll();
            const vvesDto = vves.map(vve => this.vesselVisitExecutionMap.toDTO(vve));

            return Result.ok<IVesselVisitExecutionDTO[]>(vvesDto);
        } catch (e) {
            this.logger.error("Erro ao listar VVEs: %o", e);
            // @ts-ignore
            return Result.fail<IVesselVisitExecutionDTO[]>(e.message);
        }
    }

    //METODOS AUXILIARES

    private async generateCodeAsync(): Promise<VesselVisitExecutionCode> {
        const sequence = await this.repo.getNextSequenceNumber();
        const formattedSequence = sequence.toString().padStart(6, '0');
        const year = new Date().getFullYear().toString();

        // (ex: VVE2025000001)
        const codeValue = `VVE${year}${formattedSequence}`;

        return VesselVisitExecutionCode.create(codeValue);
    }
}