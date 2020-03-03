import colors from "colors";
import moment from "moment";

export enum LogType {
  ERROR = "ERROR",
  INFO = "INFO",
  WARN = "WARN"
}

export default class Logger {
  public static log(logType: LogType, str) {
    const now = moment().format("YYYY-MM-DD HH:mm:ss A");
    const message = `${now} : ${str}`;

    if (logType === LogType.INFO) console.log(colors.cyan("INFO  ") + message);
    else if (logType === LogType.WARN)
      console.log(colors.yellow("WARN  ") + message);
    else if (logType === LogType.ERROR)
      console.log(colors.red("ERROR ") + message);
  }

  public static info = (str: string) => {
    Logger.log(LogType.INFO, str);
  };

  public static warn = (str: string) => {
    Logger.log(LogType.WARN, str);
  };

  public static error = (str: string) => {
    Logger.log(LogType.ERROR, str);
  };
}
