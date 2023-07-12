import { cosmiconfigSync } from 'cosmiconfig';
const DEFAULT_CONFIGURATION = { config: {}, filepath: '' };
export const Config = class Config {
    _moduleName;
    _configuration;
    constructor(moduleName) {
        this._moduleName = moduleName;
        this._configuration = DEFAULT_CONFIGURATION;
    }
    get getConfiguration() {
        return this._configuration;
    }
    init({ searchDir } = {}) {
        const configDir = searchDir || process.cwd();
        const options = {
            stopDir: configDir
        };
        const explorer = cosmiconfigSync(this._moduleName, options);
        const result = explorer.search(configDir);
        this._configuration = this._validateResult(result);
    }
    _validateResult(result) {
        return {
            config: result?.config || {},
            filepath: result?.filepath || '',
            isEmpty: result?.isEmpty
        };
    }
};
