import { IVesselVisitExecutionPersistence } from '../../dataschema/IVesselVisitExecutionPersistence';
import mongoose from 'mongoose';

const VesselVisitExecutionSchema = new mongoose.Schema(
    {
        domainId: { type: String, unique: true },
        code: { type: String, unique: true },
        vvnId: { type: String, unique: true, index: true },
        vesselImo: { type: String, required: true },
        actualArrivalTime: { type: Date, required: true },
        creatorEmail: { type: String, required: true },
        status: { type: String, required: true },
    },
    {
        timestamps: false,
        versionKey: false,
    }
);

export default mongoose.model<IVesselVisitExecutionPersistence & mongoose.Document>(
    'VesselVisitExecution',
    VesselVisitExecutionSchema
);