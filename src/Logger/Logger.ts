import chalk from 'chalk'
import {
  LoggerConstructor,
  LoggerConstructorArgs,
  LoggerTypes,
  PrintLogger
} from './Logger.types.js'

const TYPE_COLORS = {
  [LoggerTypes.INFO]: chalk.blueBright,
  [LoggerTypes.WARNING]: chalk.yellow,
  [LoggerTypes.SUCCESS]: chalk.greenBright,
  [LoggerTypes.ERROR]: chalk.redBright
}

export const Logger: LoggerConstructor = class Logger {
  private _name: string
  private _showType: string
  private _logs: string[]

  constructor({ name, showType }: LoggerConstructorArgs) {
    this._name = name
    this._showType = showType || LoggerTypes.SILLY
    this._logs = []
  }

  get logs() {
    return this._logs
  }

  set setName(name: string) {
    this._name = name
  }

  set setShowType(showType: LoggerTypes) {
    this._showType = showType
  }

  public info(message: string) {
    if (this._haveShowLog(LoggerTypes.INFO)) {
      console.info(this._printLogger({ type: LoggerTypes.INFO, message }))
    }
  }

  public warning(message: string) {
    if (this._haveShowLog(LoggerTypes.WARNING)) {
      console.warn(this._printLogger({ type: LoggerTypes.WARNING, message }))
    }
  }

  public error(message: string) {
    if (this._haveShowLog(LoggerTypes.ERROR)) {
      console.error(this._printLogger({ type: LoggerTypes.ERROR, message }))
    }
  }

  public success(message: string) {
    if (this._haveShowLog(LoggerTypes.SUCCESS)) {
      console.log(this._printLogger({ type: LoggerTypes.SUCCESS, message }))
    }
  }

  private _printLogger({ type, message }: PrintLogger): string {
    const date = new Date().toDateString()
    const time = new Date().toLocaleTimeString()
    const messageToPrint = `[${chalk.cyan(
      `${date} ${time}`
    )}][${chalk.bold.italic.cyan(this._name)}][${TYPE_COLORS[type]?.(
      type
    )}${chalk.reset(`] ${message}`)}`
    this._logs.push(messageToPrint)
    return messageToPrint
  }

  private _haveShowLog(type: string): boolean {
    return this._showType === LoggerTypes.SILLY || type === this._showType
  }
}
