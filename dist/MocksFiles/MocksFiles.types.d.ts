import type { LoggerInterface } from '../Logger/index.js';
import type { MocksPath } from './../MockServer/index.js';
export type RouteResponse = string | JSON;
export interface Route {
    route?: string;
    response?: RouteResponse;
    responseCode?: number;
    beforeMiddleware?: () => void;
    responseHandler?: () => void;
    afterMiddleware?: () => void;
}
export type RoutesObject = Record<string, Route[]>;
export type Routes = Array<RoutesObject>;
export interface MocksFilesConstrunctorArgs {
    mocksPath: MocksPath;
    logger: LoggerInterface;
}
export interface MocksFilesInterface {
    get routes(): Routes;
    read: () => void;
}
export interface MocksFilesConstrunctor {
    new (args: MocksFilesConstrunctorArgs): MocksFilesInterface;
}
