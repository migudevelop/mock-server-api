export type LoggerConstructorArgs = {
    name: string;
    showType?: LoggerTypes;
};
export interface LoggerConstructor {
    new (args: LoggerConstructorArgs): LoggerInterface;
}
export interface LoggerInterface {
    get logs(): string[];
    set setName(name: string);
    set setShowType(showType: LoggerTypes);
    info: (message: string) => void;
    warning: (message: string) => void;
    error: (message: string) => void;
    success: (message: string) => void;
}
export declare enum LoggerTypes {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    SUCCESS = "success",
    SILLY = "silly"
}
export interface PrintLogger {
    type: Exclude<LoggerTypes, LoggerTypes.SILLY>;
    message: string;
}
