import { basename, extname, resolve } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';
const ENCODING_UTF8 = 'utf8';
export const MocksFiles = class MocksFiles {
    _mocksPath;
    _logger;
    _initialized = false;
    _routes = [];
    constructor({ mocksPath, logger }) {
        this._logger = logger;
        if (!this._isValidMocksPath(mocksPath)) {
            const errorMessage = `Mocks path can't be empty`;
            this._logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        this._mocksPath = resolve(process.cwd(), mocksPath);
    }
    get routes() {
        return this._routes;
    }
    async read() {
        await this._init();
        await this._readFiles();
    }
    _init() {
        if (!this._initialized) {
            this._logger.info(`Reading files in the path ${this._mocksPath}...`);
            this._initialized = true;
        }
    }
    _isValidMocksPath(mocksPath) {
        return typeof mocksPath === 'string' && mocksPath.length !== 0;
    }
    _readFiles() {
        const files = readdirSync(this._mocksPath, {
            recursive: true,
            withFileTypes: true
        });
        for (const file of files) {
            if (!file.isDirectory()) {
                this._logger.info(`Found ${file.name} file`);
                this._extractData(file.name);
            }
        }
    }
    async _extractData(fileName) {
        this._logger.info(`Reading ${fileName} file...`);
        const jsonData = (await this._readFile(resolve(this._mocksPath, fileName)));
        const requestType = basename(fileName, extname(fileName)).toLocaleLowerCase();
        this._logger.info(`Adding ${requestType} request type...`);
        this._routes.push({ [requestType]: jsonData });
        this._logger.success(`${requestType} request type added`);
    }
    async _readFile(path) {
        const fileContent = await readFileSync(path, ENCODING_UTF8);
        const jsonData = JSON.parse(fileContent);
        const tranformedJsonData = this._transformJsonData(jsonData);
        this._logger.info(`Json data in ${basename(path)} file: ${JSON.stringify(tranformedJsonData, null, 2)}`);
        return tranformedJsonData;
    }
    _transformJsonData(jsonData) {
        return jsonData.map((data) => ({
            ...data,
            response: this._obtainedResponse(data.response)
        }));
    }
    _obtainedResponse(response) {
        if (typeof response === 'string') {
            const fileContent = readFileSync(resolve(this._mocksPath, response), ENCODING_UTF8);
            return JSON.parse(fileContent);
        }
        return response;
    }
};
