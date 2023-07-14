import type { CosmiconfigResult } from 'cosmiconfig/dist/types.js';
export type ModuleName = string;
export type InitArgs = {
    searchDir?: string;
};
export interface ConfigConstrunctor {
    new (moduleName: ModuleName): ConfigurationInterface;
}
export interface ConfigurationInterface {
    get getConfiguration(): CosmiconfigResult;
    init: (args?: InitArgs) => void;
}
