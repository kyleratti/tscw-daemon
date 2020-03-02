import moment from "moment";

export enum LogType {
  ERROR = "ERROR",
  INFO = "INFO",
  WARN = "WARN"
}

export default class Logger {
  public static log(logType: LogType, str) {
    const now = moment().format("YYYY-MM-DD HH:mm:ss A");
    const message = `[${now}] ${logType}: ${str}`;

    if (logType === LogType.INFO) console.log(message);
    else if (logType === LogType.WARN) console.warn(message);
    else if (logType === LogType.ERROR) console.error(message);
  }
}
