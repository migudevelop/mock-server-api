import type { ModuleName } from '../Config/index.js';
import type { ServerConfiguration } from '../Server/index.js';
export type RequestType = 'post' | 'get' | 'put' | 'delete';
export type MocksPath = string;
export interface MockServerConstrunctor {
    new (moduleName: ModuleName): MockServerInterface;
}
export interface MockServerInterface {
    run: () => void;
}
export interface MockServerConfiguration extends ServerConfiguration {
    readonly mocksPath: MocksPath;
}
