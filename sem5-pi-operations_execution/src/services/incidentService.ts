import { Inject, Service } from "typedi";
import IIncidentService from "./IServices/IIncidentService";
import IIncidentRepo from "./IRepos/IIncidentRepo";
import IncidentMap from "../mappers/IncidentMap";
import { Logger } from "winston";
import { IIncidentDTO } from "../dto/IIncidentDTO";
import { Result } from "../core/logic/Result";
import { BusinessRuleValidationError } from "../core/logic/BusinessRuleValidationError";
import { IncidentTypeError } from "../domain/incidentTypes/errors/incidentTypeErrors";
import { IncidentError } from "../domain/incident/errors/incidentErrors";
import { Incident } from "../domain/incident/incident";
import IIncidentTypeRepository from "./IRepos/IIncidentTypeRepository";
import { Severity, SeverityFactory } from "../domain/incidentTypes/severity";
import { ImpactMode, ImpactModeFactory } from "../domain/incident/impactMode";
import IVesselVisitExecutionRepo from "./IRepos/IVesselVisitExecutionRepo";
import { VesselVisitExecutionCode } from "../domain/vesselVisitExecution/vesselVisitExecutionCode";

@Service()
export default class IncidentService implements IIncidentService {
    constructor(
        @Inject("incidentRepo")
        private repo: IIncidentRepo,

        @Inject("IncidentTypeRepo")
        private repoType: IIncidentTypeRepository,

        @Inject("VesselVisitExecutionRepo")
        private repoVVE: IVesselVisitExecutionRepo,

        @Inject("IncidentMap")
        private incidentMap: IncidentMap,

        @Inject("logger")
        private logger: Logger
    ) {}

    async updatedListsOfVVEsAsync(incidentCode: string): Promise<Result<IIncidentDTO>> {
        this.logger.info("Updating Incident Types (ALLONGOING/UPCOMING) lists", { code: incidentCode });

        try{
            const exist = await this.repo.findByCode(incidentCode);
            if (!exist) {
                throw new BusinessRuleValidationError(
                    IncidentError.AlreadyExists,
                    "Incident with code ${incidentCode} does not exists",
                    `Incident with code ${incidentCode} does not exists`
                );
            }

            if (exist.impactMode == ImpactMode.AllOnGoing) {
                const listAllVVEs = await this.repoVVE.findAll();
                exist.changeVVEList(listAllVVEs.map(vve => vve.code.value));
            }else if(exist.impactMode == ImpactMode.Upcoming && exist.upcomingWindowStartTime && exist.upcomingWindowEndTime) {
                const listVVEWindow = await this.repoVVE.getAllInDateRange(exist.upcomingWindowStartTime,exist.upcomingWindowEndTime);
                exist.changeVVEList(listVVEWindow.map(vve => vve.code.value));
            }

            const saved = await this.repo.save(exist);
            if (!saved) {
                throw new BusinessRuleValidationError(
                    IncidentTypeError.PersistError,
                    "Error saving Incident"
                );
            }

            return Result.ok(this.incidentMap.toDTO(saved));

        }catch(e){
            const msg = e instanceof Error ? e.message : "Unknown error";
            return Result.fail<IIncidentDTO>(msg);
        }
    }

    public async createAsync(dto: IIncidentDTO): Promise<Result<IIncidentDTO>> {
        this.logger.info("Creating Incident", { code: dto.code });

        try {
            const exist = await this.repo.findByCode(dto.code);
            if (exist) {
                throw new BusinessRuleValidationError(
                    IncidentError.AlreadyExists,
                    "Incident already exists",
                    `Code ${dto.code} already exists`
                );
            }

            const existType = await this.repoType.findByCode(dto.incidentTypeCode);
            if (!existType) {
                throw new BusinessRuleValidationError(
                    IncidentTypeError.AlreadyExists,
                    "Incident Type does not exist",
                    `Code ${dto.incidentTypeCode} for incident type was not found in DB.`
                );
            }

            const severity = SeverityFactory.fromString(String(dto.severity));
            const impactMode = ImpactModeFactory.fromString(String(dto.impactMode));

            // vveList final é SEMPRE calculada de forma consistente com o impactMode
            const listFinalVVE = await this.buildVveListForMode(
                impactMode,
                dto.vveList,
                dto.upcomingWindowStartTime,
                dto.upcomingWindowEndTime
            );

            const incident = Incident.create({
                code: dto.code,
                incidentTypeCode: dto.incidentTypeCode,
                vveList: listFinalVVE,
                startTime: dto.startTime,
                endTime: dto.endTime ?? null,
                duration: null, // domínio calcula se endTime existir
                severity,
                impactMode,
                description: dto.description,
                createdByUser: dto.createdByUser,
                upcomingWindowStartTime: dto.upcomingWindowStartTime ?? null,
                upcomingWindowEndTime: dto.upcomingWindowEndTime ?? null,
                createdAt: new Date(),
                updatedAt: null,
            });

            const saved = await this.repo.save(incident);
            if (!saved) {
                throw new BusinessRuleValidationError(
                    IncidentTypeError.PersistError,
                    "Error saving Incident"
                );
            }

            return Result.ok(this.incidentMap.toDTO(saved));
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return Result.fail<IIncidentDTO>(msg);
        }
    }

    public async updateAsync(incidentCode: string, dto: IIncidentDTO): Promise<Result<IIncidentDTO>> {
        this.logger.info("Updating Incident", { incidentCode });

        try {
            const incident = await this.repo.findByCode(incidentCode);
            if (!incident) {
                throw new BusinessRuleValidationError(
                    IncidentError.UpdateError,
                    "Error updating Incident",
                    `Incident with code ${incidentCode} was not found in DB`
                );
            }

            const incidentType = await this.repoType.findByCode(dto.incidentTypeCode);
            if (!incidentType) {
                throw new BusinessRuleValidationError(
                    IncidentError.UpdateError,
                    "Error updating Incident",
                    `Incident type with code ${dto.incidentTypeCode} was not found in DB`
                );
            }

            const parsedSeverity = SeverityFactory.fromString(String(dto.severity));
            const parsedImpactMode = ImpactModeFactory.fromString(String(dto.impactMode));

            const listFinalVVE = await this.buildVveListForMode(
                parsedImpactMode,
                dto.vveList,
                dto.upcomingWindowStartTime,
                dto.upcomingWindowEndTime
            );

            // Updates (ordem pensada para não quebrar invariantes)
            incident.changeIncidentTypeCode(dto.incidentTypeCode);
            incident.changeStartTime(dto.startTime);
            incident.changeSeverity(parsedSeverity);
            incident.changeDescription(dto.description);

            // Primeiro atualiza a lista (importante se for mudar para Specific)
            incident.changeVVEList(listFinalVVE);

            // Depois muda o modo (pode limpar janelas se sair de Upcoming)
            incident.changeImpactMode(parsedImpactMode);

            // Se for Upcoming, define/atualiza a janela após ter impactMode correto
            if (parsedImpactMode === ImpactMode.Upcoming) {
                if (!dto.upcomingWindowStartTime || !dto.upcomingWindowEndTime) {
                    throw new BusinessRuleValidationError(
                        IncidentError.UpdateError,
                        "Error updating Incident",
                        "Cannot set impact mode 'Upcoming' without upcomingWindowStartTime and upcomingWindowEndTime."
                    );
                }
                incident.changeUpComingWindowTimes(dto.upcomingWindowStartTime, dto.upcomingWindowEndTime);
            }

            // Se vocês querem que endTime só seja alterado via /resolve, então não mexas aqui.
            // Se quiseres permitir update do endTime, tens de expor método no domínio.

            const saved = await this.repo.save(incident);
            if (!saved) {
                throw new BusinessRuleValidationError(
                    IncidentError.UpdateError,
                    "Error saving Incident"
                );
            }

            return Result.ok(this.incidentMap.toDTO(saved));
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return Result.fail<IIncidentDTO>(msg);
        }
    }

    public async deleteAsync(incidentCode: string): Promise<Result<void>> {
        this.logger.info("Deleting Incident", { incidentCode });

        try {
            const incident = await this.repo.findByCode(incidentCode);
            if (!incident) {
                return Result.fail<void>(`Incident with code ${incidentCode} not found`);
            }

            await this.repo.deleteIncident(incidentCode);
            return Result.ok<void>();
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
            this.logger.error("Error deleting incident", { error: errorMessage });
            return Result.fail<void>(errorMessage);
        }
    }

    public async getByCodeAsync(incidentCode: string): Promise<Result<IIncidentDTO>> {
        try {
            const incident = await this.repo.findByCode(incidentCode);

            if (!incident) {
                return Result.fail<IIncidentDTO>(`No Incident found with code ${incidentCode}`);
            }

            return Result.ok(this.incidentMap.toDTO(incident));
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
            return Result.fail<IIncidentDTO>(errorMessage);
        }
    }

    public async getByDataRangeAsync(startDateRange: Date, endDateRange: Date): Promise<Result<IIncidentDTO[]>> {
        try {
            if (startDateRange > endDateRange) {
                return Result.fail<IIncidentDTO[]>("Start date must be before or equal to End date.");
            }

            const incidents = await this.repo.getByDataRange(startDateRange, endDateRange);
            const dtos = incidents.map((i) => this.incidentMap.toDTO(i));

            return Result.ok<IIncidentDTO[]>(dtos);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
            return Result.fail<IIncidentDTO[]>(errorMessage);
        }
    }

    public async getBySeverityAsync(severity: Severity): Promise<Result<IIncidentDTO[]>> {
        try {
            const incidents = await this.repo.getBySeverity(severity);
            const dtos = incidents.map((i) => this.incidentMap.toDTO(i));

            return Result.ok<IIncidentDTO[]>(dtos);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
            return Result.fail<IIncidentDTO[]>(errorMessage);
        }
    }

    public async getActiveIncidentsAsync(): Promise<Result<IIncidentDTO[]>> {
        try {
            const incidents = await this.repo.getActiveIncidents();
            const dtos = incidents.map((i) => this.incidentMap.toDTO(i));
            return Result.ok<IIncidentDTO[]>(dtos);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
            return Result.fail<IIncidentDTO[]>(errorMessage);
        }
    }

    public async getResolvedIncidentsAsync(): Promise<Result<IIncidentDTO[]>> {
        try {
            const incidents = await this.repo.getResolvedIncidents();
            const dtos = incidents.map((i) => this.incidentMap.toDTO(i));
            return Result.ok<IIncidentDTO[]>(dtos);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
            return Result.fail<IIncidentDTO[]>(errorMessage);
        }
    }

    public async getByVVEAsync(vveCode: string): Promise<Result<IIncidentDTO[]>> {
        try {
            // valida que a VVE existe
            await this.checkIfVVEsExist(vveCode);

            const list = await this.repo.findByVVE(vveCode);
            const dtos = list.map((i) => this.incidentMap.toDTO(i));
            return Result.ok<IIncidentDTO[]>(dtos);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
            return Result.fail<IIncidentDTO[]>(errorMessage);
        }
    }

    public async getAllIncidentAsync(): Promise<Result<IIncidentDTO[]>> {
        try {
            const allIncidents = await this.repo.findAll();
            const dtos = allIncidents.map((i) => this.incidentMap.toDTO(i));
            return Result.ok<IIncidentDTO[]>(dtos);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
            return Result.fail<IIncidentDTO[]>(errorMessage);
        }
    }

    public async markAsResolvedAsync(incidentCode: string): Promise<Result<IIncidentDTO>> {
        try {
            const incident = await this.repo.findByCode(incidentCode);
            if (!incident) {
                throw new BusinessRuleValidationError(
                    IncidentError.NotFound,
                    "Incident not found",
                    `No Incident found with code ${incidentCode}`
                );
            }

            incident.markAsResolved();

            const saved = await this.repo.save(incident);
            if (!saved) {
                throw new BusinessRuleValidationError(
                    IncidentError.UpdateError,
                    "Error saving Incident"
                );
            }

            return Result.ok(this.incidentMap.toDTO(saved));
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return Result.fail<IIncidentDTO>(msg);
        }
    }

    public async addVVEToIncidentAsync(incidentCode: string, vveCode: string): Promise<Result<IIncidentDTO>> {
        try {
            const incident = await this.repo.findByCode(incidentCode);
            if (!incident) {
                throw new BusinessRuleValidationError(
                    IncidentError.NotFound,
                    "Incident not found",
                    `No Incident found with code ${incidentCode}`
                );
            }

            await this.checkIfVVEsExist(vveCode);

            incident.addAffectedVve(vveCode);

            const saved = await this.repo.save(incident);
            if (!saved) {
                throw new BusinessRuleValidationError(
                    IncidentError.UpdateError,
                    "Error saving Incident"
                );
            }

            return Result.ok(this.incidentMap.toDTO(saved));
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return Result.fail<IIncidentDTO>(msg);
        }
    }

    public async removeVVEAsync(incidentCode: string, vveCode: string): Promise<Result<IIncidentDTO>> {
        try {
            const incident = await this.repo.findByCode(incidentCode);
            if (!incident) {
                throw new BusinessRuleValidationError(
                    IncidentError.NotFound,
                    "Incident not found",
                    `No Incident found with code ${incidentCode}`
                );
            }

            incident.removeAffectedVve(vveCode);

            const saved = await this.repo.save(incident);
            if (!saved) {
                throw new BusinessRuleValidationError(
                    IncidentError.UpdateError,
                    "Error saving Incident"
                );
            }

            return Result.ok(this.incidentMap.toDTO(saved));
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return Result.fail<IIncidentDTO>(msg);
        }
    }

    /**
     * Constrói a lista de VVEs (por VVE Code) de forma consistente com o impactMode.
     * - Specific: usa dtoVveList (>= 1) e valida existência
     * - AllOnGoing: obtém VVEs ongoing (ou fallback findAll) e devolve code.value
     * - Upcoming: exige janela e devolve VVEs dentro do range
     */
    private async buildVveListForMode(
        impactMode: ImpactMode,
        dtoVveList: string[],
        upcomingStart: Date | null | undefined,
        upcomingEnd: Date | null | undefined
    ): Promise<string[]> {
        if (impactMode === ImpactMode.Specific) {
            if (!dtoVveList || dtoVveList.length < 1) {
                throw new BusinessRuleValidationError(
                    IncidentError.InvalidInput,
                    "Invalid number of VVE",
                    "VVE list must have at least 1 VVE when impactMode is 'Specific'."
                );
            }
            await this.checkIfVVEsExist(dtoVveList);
            return dtoVveList;
        }

        if (impactMode === ImpactMode.AllOnGoing) {
            const repoAny = this.repoVVE as unknown as {
                findAllOngoing?: () => Promise<any[]>;
                findAll: () => Promise<any[]>;
            };

            const vves = repoAny.findAllOngoing ? await repoAny.findAllOngoing() : await repoAny.findAll();
            return vves.map((v: any) => v.code.value);
        }

        if (impactMode === ImpactMode.Upcoming) {
            if (!upcomingStart || !upcomingEnd) {
                throw new BusinessRuleValidationError(
                    IncidentError.InvalidInput,
                    "Invalid parameters for incident.",
                    "When impactMode is 'Upcoming', upcomingWindowStartTime and upcomingWindowEndTime cannot be null."
                );
            }

            const vves = await this.repoVVE.getAllInDateRange(upcomingStart, upcomingEnd);
            return vves.map((v: any) => v.code.value);
        }

        throw new BusinessRuleValidationError(
            IncidentError.InvalidImpactMode,
            "Invalid ImpactMode",
            `Impact Mode ${impactMode} is not supported`
        );
    }

    /**
     * Valida se VVE(s) existem no repositório, assumindo que o identificador guardado é VVE CODE.
     */
    public async checkIfVVEsExist(vveList: string[] | string): Promise<void> {
        if (Array.isArray(vveList)) {
            for (const vve of vveList) {
                const vveCode = VesselVisitExecutionCode.create(vve);
                const exist = await this.repoVVE.findByCode(vveCode);

                if (!exist) {
                    throw new BusinessRuleValidationError(
                        IncidentError.NotFound,
                        "Error finding VVE in the DB.",
                        `VVE code ${vveCode} was not found in the DataBase.`
                    );
                }
            }
            return;
        }

        const vveCode = VesselVisitExecutionCode.create(vveList);
        const exist = await this.repoVVE.findByCode(vveCode);

        if (!exist) {
            throw new BusinessRuleValidationError(
                IncidentError.NotFound,
                "Error finding VVE in the DB.",
                `VVE code ${vveCode} was not found in the DataBase.`
            );
        }
    }
}
