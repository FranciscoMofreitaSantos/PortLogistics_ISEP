import IDockReassignmentLogRepo from "../services/IRepos/IDockReassignmentLogRepo";
import {Inject, Service} from "typedi";
import {IDockReassignmentLogPersistence} from "../dataschema/IDockReassignmentLogPersistence";
import {Document, Model} from "mongoose";
import DockReassignmentLogMap from "../mappers/DockReassignmentLogMap";
import {DockReassignmentLog} from "../domain/dockReassignmentLog/dockReassignmentLog";

@Service()
export default class DockReassignmentLogRepo implements IDockReassignmentLogRepo {

    constructor(
        @Inject("dockReassignmentLogSchema")
        private dockReassignmentLogSchema: Model<IDockReassignmentLogPersistence & Document>,
        @Inject("DockReassignmentLogMap")
        private dockReassignmentMap: DockReassignmentLogMap,
        @Inject("logger")
        private logger: any
    ) {
    }

    public async exists(t: DockReassignmentLog): Promise<boolean> {
        const record = await this.dockReassignmentLogSchema.findOne({
            domainId: t.id.toString()
        });
        return !!record;
    }

    public async findAll(): Promise<DockReassignmentLog[]> {
        const records = await this.dockReassignmentLogSchema.find();

        return records
            .map(r => this.dockReassignmentMap.toDomain(r))
            .filter(Boolean) as DockReassignmentLog[];
    }

    public async save(t: DockReassignmentLog): Promise<DockReassignmentLog | null> {
        const raw = this.dockReassignmentMap.toPersistence(t);

        try {
            const existing = await this.dockReassignmentLogSchema.findOne({
                domainId: raw.domainId
            });

            if (existing) {
                existing.set(raw);
                await existing.save();
                return this.dockReassignmentMap.toDomain(existing);
            }

            const created = await this.dockReassignmentLogSchema.create(raw);
            return this.dockReassignmentMap.toDomain(created);

        } catch (e) {
            this.logger.error("Error saving DockReassignmentLog", {e});
            return null;
        }
    }

}