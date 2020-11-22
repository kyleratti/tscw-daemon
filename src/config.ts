import fs from "fs";
import path from "path";
import { ConfigFile } from "./structures";

export class Config {
  private m_watchDir: string;
  private m_validFiles: string[];
  private m_relayServer: string;

  constructor() {
    if (!fs.existsSync("./config.json")) throw "config.json not found";
  }

  public get watchDir() {
    return this.m_watchDir;
  }

  public get validFiles() {
    return this.m_validFiles;
  }

  public get relayServer() {
    return this.m_relayServer;
  }

  public load = () => {
    const data: ConfigFile = JSON.parse(
      fs.readFileSync("./config.json").toString()
    );

    if (!data.watchDir || !fs.existsSync(data.watchDir))
      throw `watchDir does not exist or cannot be accessed: ${data.watchDir}`;

    if (!data.validFiles || data.validFiles.length <= 0)
      throw `validFiles must contain at least one file`;

    if (!data.relayServer) throw `relayServer must be set`;
    if (data.relayServer.substring(0, 5).toLowerCase() !== "ws://")
      throw `Address must begin with 'ws://'`;

    this.m_watchDir = path.resolve(data.watchDir);
    this.m_validFiles = data.validFiles;
    this.m_relayServer = data.relayServer;
  };
}
