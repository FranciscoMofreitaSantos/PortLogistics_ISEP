import {IIncidentTypePersistence} from '../../dataschema/IIncidentTypePersistence'
import mongoose from 'mongoose';

const IncidentTypeSchema = new mongoose.Schema({
    domainId: {
        type: String,
        unique: true,
        index: true,
        required: true
    },

    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    name:{
        type: String,
        required: true
    },

    description:{
        type: String,
        required: true
    },

    severity: {
        type: String,
        required: true
    },

    parent: {
        type: String,
        required: false,
        index: true
    },

    createdAt: {
        type: Date,
        required: true
    },

    updatedAt: {
        type: Date,
        required: false
    }
},
    {
        timestamps: false,
        versionKey: false
    }
);


export default mongoose.model<IIncidentTypePersistence & mongoose.Document>('IncidentType', IncidentTypeSchema);