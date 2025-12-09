import { Container } from 'typedi';
import Logger from './logger';
import userSchema from '../persistence/schemas/userSchema';

export default () => {
    Container.set('logger', Logger);
    Container.set('userSchema', userSchema);
};