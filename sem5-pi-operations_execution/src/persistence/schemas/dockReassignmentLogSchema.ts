import { IDockReassignmentLogPersistence } from '../../dataschema/IDockReassignmentLogPersistence';
import mongoose from 'mongoose';

const DockReassignmentLogSchema = new mongoose.Schema(
    {
        domainId: { type: String, unique: true },
        vvnId: { type: String, required: true },
        vesselName: { type: String, required: true },
        originalDock: { type: String, required: true },
        updatedDock: { type: String, required: true },
        officerId: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export default mongoose.model<IDockReassignmentLogPersistence & mongoose.Document>('DockReassignmentLog', DockReassignmentLogSchema);