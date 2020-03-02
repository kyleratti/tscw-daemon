import express, { Request, Response } from "express";
import fs from "fs";
import * as HttpStatusCodes from "http-status-codes";
import os from "os";
import path from "path";
import Logger from "./logger";

export default class WebServer {
  port = Number(process.env.PORT);
  watchFolder = process.env.TSCW_WATCH_FOLDER;
  validFileNames = process.env.TSCW_VALID_FILES?.replace(" ", "").split(",");
  fqdnUrl = `http://${os.hostname()}:${this.port}/`;

  app: express.Application;

  private fileNotFound(req: Request, res: Response, fileName: string) {
    Logger.error(`File '${fileName}' not found for ${req.ip}`);

    return res
      .status(HttpStatusCodes.NOT_FOUND)
      .send({ error: `File not found` });
  }

  private fileFound(req: Request, res: Response, fullPath: string) {
    Logger.info(`Serving file '${path.basename(fullPath)}' to ${req.ip}`);

    return res.status(HttpStatusCodes.OK).sendFile(fullPath);
  }

  private printNetInterfaces = () => {
    const netInterfaces = os.networkInterfaces();

    for (const k in netInterfaces) {
      if (netInterfaces.hasOwnProperty(k)) {
        const iface = netInterfaces[k];

        iface.forEach(ifaceDetails => {
          if (
            ifaceDetails.family === "IPv4" &&
            ifaceDetails.address !== "127.0.0.1"
          )
            Logger.info(
              `\t- Also listening at: http://${ifaceDetails.address}:${this.port}`
            );
        });
      }
    }
  };

  private printValidFiles = () => {
    Logger.info(`OK: Ready to serve the following files:`);

    const validFileNames = this.validFileNames;

    validFileNames.forEach(fileName => {
      Logger.info(`\t- ${this.fqdnUrl}${fileName}`);
    });
  };

  start() {
    let app = express();

    app.get("/:fileName.xml", (req, res) => {
      const fileName = req.params.fileName + ".xml";
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
        return this.fileNotFound(req, res, fileName);

      return this.fileFound(req, res, fullPath);
    });

    app.get("/*", (req, res) => {
      return this.fileNotFound(req, res, req.path);
    });

    app.listen(this.port, "0.0.0.0", () => {
      Logger.info(`OK: Listening for HTTP requests at ${this.fqdnUrl}`);

      this.printNetInterfaces();
      this.printValidFiles();
    });

    this.app = app;
  }
}
