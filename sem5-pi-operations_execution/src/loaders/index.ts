import express from 'express';
import expressLoader from './express';
import mongooseLoader from './mongoose';
import Logger from './logger';
import dependencyInjectorLoader from './dependencyInjector';

export default async ({ expressApp }: { expressApp: express.Application }) => {
    const mongoConnection = await mongooseLoader();
    Logger.info('✌️ DB loaded and connected!');

    dependencyInjectorLoader();
    Logger.info('✌️ DI container loaded');

    await expressLoader({ app: expressApp });
    Logger.info('✌️ Express loaded');
};