import express from 'express';
import { Logger } from '../Logger/index.js';
const DEFAULT_API_URL_NAME = '/api';
const DEFAULT_PORT = '3005';
const DEFAULT_LOGGER_NAME = 'server-logger';
export const Server = class Server {
    _apiUrlName;
    _port;
    _app;
    _logger;
    constructor({ config, logger }) {
        const { loggerName, port, apiUrlName } = config;
        this._logger =
            logger || new Logger({ name: loggerName || DEFAULT_LOGGER_NAME });
        this._apiUrlName = apiUrlName || DEFAULT_API_URL_NAME;
        this._port = port ?? DEFAULT_PORT;
        this._app = express();
        this._initApp();
        this._logger.info(`apiUrlName: ${this._apiUrlName}`);
        this._logger.info(`port: ${this._port}`);
    }
    get getServerApp() {
        return this._app;
    }
    async addRoutesGroup(router) {
        const routes = router.stack.map(({ route }) => {
            const methods = Object.keys(route.methods || {})
                .map((key) => key.toLocaleUpperCase())
                .join(',');
            return `${methods}: ${this._apiUrlName}${route.path}`;
        });
        if (this._isEmptyRoutes(routes)) {
            const error = "Routes can't be empty";
            this._logger.error(error);
            throw new Error(error);
        }
        this._logger.info(`New routes are added: ${JSON.stringify(routes, null, 2)}`);
        return this._app.use(this._apiUrlName, router);
    }
    async listen() {
        this._logger.info(`Server connecting by the port ${this._port}...`);
        return await this._app.listen(this._port, () => this._logger.success(`Conected in port: ${this._port}`));
    }
    _isEmptyRoutes(routes) {
        return routes === null || routes === undefined || routes.length === 0;
    }
    _initApp() {
        this._app.use(express.urlencoded({ extended: false }));
        this._app.use(express.json());
        // Configure headers and CORS
        this._app.use((_req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
            next();
        });
    }
};
