import mongoose from 'mongoose';
import { IOperationPlanDTO } from '../../dto/IOperationPlanDTO';

const OperationPlanSchema = new mongoose.Schema(
    {
        domainId: { type: String, unique: true },
        algorithm: { type: String, required: true },
        totalDelay: { type: Number, required: true },
        status: { type: String, required: true },
        planDate: { type: Date, required: true },
        author: { type: String, required: true },
        operations: [{ type: mongoose.Schema.Types.Mixed }],
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IOperationPlanDTO & mongoose.Document>('OperationPlan', OperationPlanSchema);