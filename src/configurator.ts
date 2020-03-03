import fs from "fs";
import Logger from "./logger";

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
    friendlyName: "Valid Files",
    envName: "TSCW_VALID_FILES",
    isValid: str => {
      return [!str || str.length > 4, `Must include valid file names`];
    }
  },
  {
    friendlyName: "Watch Folder",
    envName: "TSCW_WATCH_FOLDER",
    isValid: path => {
      if (!path) return [false, `Must be set`];

      if (!fs.existsSync(path)) return [false, `Path not found`];
      if (!fs.lstatSync(path).isDirectory())
        return [false, `Path is not a directory`];

      return [true];
    }
  },
  {
    friendlyName: "Relay Server Address",
    envName: "TSCW_RELAY_SERVER",
    isValid: str => {
      if (!str) return [false, `Must be set`];

      if (str.substring(0, 5) !== "ws://")
        return [false, `Address must begin with ws://`];

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
          `${configVar.friendlyName} (${configVar.envName}) failed validation: ${err}`
        );
        hadError = true;
      }
    });

    if (hadError)
      for (let i = 0; i < 5; i++) {
        Logger.warn(
          `THERE WERE CONFIGURATION ERRORS ON STARTUP!!! THIS MAY NOT WORK CORRECTLY!!!`
        );
      }
  }
}
