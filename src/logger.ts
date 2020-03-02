import moment from "moment";

export enum LogType {
  ERROR = "ERROR",
  INFO = "INFO",
  WARN = "WARN"
}

export default class Logger {
  public static log(logType: LogType, str) {
    const now = moment().format("YYYY-MM-DD HH:mm:ss A");
    console.log(`[${now}] ${str}`);
  }
}
