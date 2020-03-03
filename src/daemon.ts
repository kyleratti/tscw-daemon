import colors from "colors";
import fs from "fs";
import path from "path";
import socketIo from "socket.io-client";
import Logger from "./logger";
import { RelayRequest, RelayResponse } from "./structs";

export default class Daemon {
  relayServer = process.env.TSCW_RELAY_SERVER;
  watchFolder = process.env.TSCW_WATCH_FOLDER;
  validFileNames = process.env.TSCW_VALID_FILES?.replace(" ", "").split(",");

  private socket: SocketIOClient.Socket;

  private printValidFiles = () => {
    Logger.info(`Ready to serve the following files:`);

    const validFileNames = this.validFileNames;

    validFileNames.forEach(fileName => {
      const fullPath = path.resolve(this.watchFolder, fileName);
      const exists = fs.existsSync(fullPath)
        ? colors.green("found")
        : colors.red("not found");

      Logger.info(`\t- ${fullPath} (${exists})`);
    });
  };

  private respondSuccess = (data: RelayResponse) => {
    Logger.info(`Relaying "${data.fileName}"`);
    return this.socket.emit("relayResponse.success", data);
  };

  private respondFail = (err: string) => {
    Logger.error(`Unable to relay response: ${err}`);
    return this.socket.emit("relayResponse.fail", { error: err });
  };

  start() {
    this.printValidFiles();

    Logger.info(`Using relay server: ${this.relayServer}`);

    this.socket = socketIo(this.relayServer, { reconnectionDelay: 1000 * 5 });
    this.socket.on("relayRequest", (req: RelayRequest) => {
      const [requestId, fileName] = [req.requestId, req.fileName];
      let valid = false;

      for (let i = 0; i < this.validFileNames.length; i++) {
        const validName = this.validFileNames[i];
        if (validName === fileName) {
          valid = true;
          break;
        }
      }

      const fullPath = path.resolve(this.watchFolder, fileName);

      if (!valid || !fs.existsSync(fullPath))
        return this.respondFail(`File "${fileName}" not found`);

      const xmlData = fs.readFileSync(fullPath).toString();

      this.respondSuccess({
        requestId: requestId,
        fileName: fileName,
        data: xmlData
      });
    });

    this.socket.on("disconnect", () => {
      Logger.warn(`Lost connection to relay server`);
    });

    this.socket.on("connect", () => {
      Logger.info(`Connected to relay server!`);
    });

    this.socket.on("error", err => {
      Logger.error(err);
    });

    this.socket.on("connect_error", () => {
      Logger.error(
        `Connection failed (is the relay on?): Error establishing connection`
      );
    });

    this.socket.on("reconnect_attempt", () => {
      Logger.info(`Attempting to reconnect...`);
    });

    this.socket.on("connect_timeout", () => {
      Logger.warn(`Connection timed out (is the relay on?)`);
    });
  }
}
