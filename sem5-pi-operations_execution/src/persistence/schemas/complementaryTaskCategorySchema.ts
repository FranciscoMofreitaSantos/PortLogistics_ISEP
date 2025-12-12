import { IComplementaryTaskCategoryPersistance } from '../../dataschema/IComplementaryTaskCategoryPersistance';
import mongoose from 'mongoose';

const ComplementaryTaskCategory = new mongoose.Schema(
    {
        domainId: {
            type: String,
            unique: true
        },

        code: {
            type: String,
            required: [true, 'Please enter name'],
            unique: true,
            index: true,
        },

        category: {
            type: String,
            lowercase: true,
            unique: true,
            index: true,
        },

        duration: {
            type: Number,
            required: false,
        },

    },
    {
        timestamps: false,
        versionKey: false,
    }
);

export default mongoose.model<IComplementaryTaskCategoryPersistance & mongoose.Document>('ComplementaryTaskCategory', ComplementaryTaskCategory);