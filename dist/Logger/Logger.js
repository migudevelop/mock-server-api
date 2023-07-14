import chalk from 'chalk';
import { LoggerTypes } from './Logger.types.js';
const TYPE_COLORS = {
    [LoggerTypes.INFO]: chalk.blueBright,
    [LoggerTypes.WARNING]: chalk.yellow,
    [LoggerTypes.SUCCESS]: chalk.greenBright,
    [LoggerTypes.ERROR]: chalk.redBright
};
export const Logger = class Logger {
    _name;
    _showType;
    _logs;
    constructor({ name, showType }) {
        this._name = name;
        this._showType = showType || LoggerTypes.SILLY;
        this._logs = [];
    }
    get logs() {
        return this._logs;
    }
    set setName(name) {
        this._name = name;
    }
    set setShowType(showType) {
        this._showType = showType;
    }
    info(message) {
        if (this._haveShowLog(LoggerTypes.INFO)) {
            console.info(this._printLogger({ type: LoggerTypes.INFO, message }));
        }
    }
    warning(message) {
        if (this._haveShowLog(LoggerTypes.WARNING)) {
            console.warn(this._printLogger({ type: LoggerTypes.WARNING, message }));
        }
    }
    error(message) {
        if (this._haveShowLog(LoggerTypes.ERROR)) {
            console.error(this._printLogger({ type: LoggerTypes.ERROR, message }));
        }
    }
    success(message) {
        if (this._haveShowLog(LoggerTypes.SUCCESS)) {
            console.log(this._printLogger({ type: LoggerTypes.SUCCESS, message }));
        }
    }
    _printLogger({ type, message }) {
        const date = new Date().toDateString();
        const time = new Date().toLocaleTimeString();
        const messageToPrint = `[${chalk.cyan(`${date} ${time}`)}][${chalk.bold.italic.cyan(this._name)}][${TYPE_COLORS[type]?.(type)}${chalk.reset(`] ${message}`)}`;
        this._logs.push(messageToPrint);
        return messageToPrint;
    }
    _haveShowLog(type) {
        return this._showType === LoggerTypes.SILLY || type === this._showType;
    }
};
