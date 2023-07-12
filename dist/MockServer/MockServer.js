import { Router } from 'express';
import { Config } from '../Config/index.js';
import { Logger } from '../Logger/index.js';
import { MocksFiles } from '../MocksFiles/index.js';
import { Server } from '../Server/index.js';
const DEFAULT_LOGGER_NAME = 'mock-server';
export const MockServer = class MockServer {
    _configuration;
    _server;
    _logger;
    _mockFiles;
    _initialized = false;
    constructor(moduleName) {
        this._init(moduleName);
    }
    async run() {
        await this._readDb();
        await this._addRoutesInServer();
        await this._server.listen();
    }
    async _init(moduleName) {
        if (!this._initialized) {
            this._logger = new Logger({
                name: moduleName
            });
            this._logger.info(`Init MockServer...`);
            this._logger.info(`Searching config file with modulename ${moduleName}...`);
            this._configuration = new Config(moduleName);
            this._configuration.init();
            const config = this._configuration?.getConfiguration
                ?.config;
            this._checkLoggerConfig(config, moduleName);
            this._server = new Server({
                config,
                logger: this._logger
            });
            this._initialized = true;
        }
    }
    _checkLoggerConfig({ loggerName, loggerType }, moduleName) {
        const newLoggerName = loggerName || `${moduleName}-${DEFAULT_LOGGER_NAME}`;
        this._logger.info(`Change logger name to ${newLoggerName} type...`);
        this._logger.setName = newLoggerName;
        if (loggerType != null && loggerType?.length !== 0) {
            this._logger.info(`Change logger type to ${loggerType} type...`);
            this._logger.setShowType = loggerType;
        }
    }
    async _readDb() {
        const { mocksPath } = this._configuration.getConfiguration
            ?.config;
        this._mockFiles = new MocksFiles({ mocksPath, logger: this._logger });
        await this._mockFiles.read();
    }
    async _addRoutesInServer() {
        const jsonRoutes = this._mockFiles.routes;
        this._logger.info(`The following routes will be added: ${JSON.stringify(jsonRoutes, null, 2)}`);
        this._logger.info('Creating Router...');
        const router = Router();
        this._mockFiles.routes.map((routesType) => {
            for (const routeType in routesType) {
                const routes = routesType[routeType];
                this._logger.info(`Adding ${routeType} routes...`);
                routes.forEach((route) => {
                    this._createRequest(router, route, routeType);
                });
            }
        });
        await this._server.addRoutesGroup(router);
    }
    _createRequest(router, requestRoute, requestType) {
        const { route, response } = requestRoute;
        this._logger.success(`Adding ${route} with response: ${JSON.stringify(response)}`);
        this._logger.success(`Route ${route} was added with response: ${JSON.stringify(response)}`);
        switch (requestType) {
            case 'get':
                return router.get(route, (_req, res) => this._responseCallback(_req, res, requestRoute));
            case 'post':
                return router.post(route, (_req, res) => this._responseCallback(_req, res, requestRoute));
            case 'delete':
                return router.delete(route, (_req, res) => this._responseCallback(_req, res, requestRoute));
            case 'put':
                return router.put(route, (_req, res) => this._responseCallback(_req, res, requestRoute));
        }
    }
    _responseCallback({ baseUrl, hostname, method, url }, res, { responseCode, response }) {
        this._logger.success(JSON.stringify({ hostname, baseUrl, url, method, response }, null, 2));
        res.status(responseCode || 200).send(response);
    }
};
