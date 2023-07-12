import type { Express, Router } from 'express';
import type { LoggerInterface, LoggerTypes } from '../Logger/index.js';
export type Port = string | number;
export type ApiUrlName = string;
export interface ServerConfiguration {
    readonly loggerName?: string;
    readonly loggerType?: LoggerTypes;
    readonly port?: Port;
    readonly apiUrlName?: ApiUrlName;
}
export interface ServerConstructorArgs {
    config: ServerConfiguration;
    logger?: LoggerInterface;
}
export interface ServerConstructor {
    new (args: ServerConstructorArgs): ServerInterface;
}
export interface ServerInterface {
    get getServerApp(): Express;
    addRoutesGroup: (router: Router) => void;
    listen: () => void;
}
