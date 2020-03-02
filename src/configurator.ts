import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Logger, { LogType } from "./logger";

dotenv.config({
  path: path.resolve(process.cwd(), `tscw_config.txt`)
});

interface ConfigurationVariable {
  /** The friendly name displayed to users */
  friendlyName: string;
  /** The variable name used when retriving from process.env */
  envName: string;
  /** The validator function to check if the set environment variable is valid */
  isValid(str: string): [boolean, string?];
}

const variables: ConfigurationVariable[] = [
  {
    friendlyName: "HTTP Server Port",
    envName: "PORT",
    isValid: port => {
      return [Number(port) > 1024, `Port must be a number and > 1024`];
    }
  },
  {
    friendlyName: "Valid Files",
    envName: "TSCW_VALID_FILES",
    isValid: str => {
      return [str.length > 4, `Must include valid file names`];
    }
  },
  {
    friendlyName: "Watch Folder",
    envName: "TSCW_WATCH_FOLDER",
    isValid: path => {
      if (!fs.existsSync(path)) return [false, `Path not found`];
      if (!fs.lstatSync(path).isDirectory())
        return [false, `Path is not a directory`];

      return [true];
    }
  }
];

export default class Configurator {
  static validate() {
    let hadError = false;

    variables.forEach(configVar => {
      const envVar = process.env[configVar.envName];
      const [isValid, err] = configVar.isValid(envVar);

      Logger.info(
        `READ OK: ${configVar.friendlyName} (${configVar.envName}) = ${envVar}`
      );

      if (!isValid) {
        Logger.warn(
          `WARN: ${configVar.friendlyName} (${configVar.envName}) failed validation: ${err}`
        );
        hadError = true;
      }
    });

    if (hadError)
      Logger.warn(
        `THERE WERE CONFIGURATION ERRORS ON STARTUP!!! THIS MAY NOT WORK CORRECTLY!!!`
      );
  }
}
