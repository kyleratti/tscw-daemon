import express, { Request, Response } from "express";
import fs from "fs";
import * as HttpStatusCodes from "http-status-codes";
import path from "path";
import os from "os";
import moment from "moment";

enum LogType {
  ERROR = "ERROR",
  INFO = "INFO",
  WARN = "WARN"
}

export default class WebServer {
  watchFolder = process.env.TSCW_WATCH_FOLDER;
  validFileNames = process.env.TSCW_VALID_FILES?.replace(" ", "").split(",");

  app: express.Application;

  private log(logType: LogType, str) {
    const now = moment().format("YYYY-MM-DD HH:mm:ss A");
    console.log(`[${now}] ${str}`);
  }

  private notFound(req, res, fileName) {
    this.log(LogType.ERROR, `File '${fileName}' not found for ${req.ip}`);

    return res
      .status(HttpStatusCodes.NOT_FOUND)
      .send({ error: `File not found` });
  }

  private found(req: Request, res: Response, fullPath: string) {
    this.log(
      LogType.INFO,
      `Serving file '${path.basename(fullPath)}' to ${req.ip}`
    );

    return res.status(HttpStatusCodes.OK).sendFile(fullPath);
  }

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
        return this.notFound(req, res, fileName);

      return this.found(req, res, fullPath);
    });

    app.get("/*", (req, res) => {
      return this.notFound(req, res, req.path);
    });

    this.app = app;

    const port = Number(process.env.PORT);
    const fqdnUrl = `http://${os.hostname()}:${port}/`;

    this.app.listen(port, "0.0.0.0", () => {
      console.log(`OK: Listening for HTTP requests at ${fqdnUrl}`);

      const netInterfaces = os.networkInterfaces();

      for (const k in netInterfaces) {
        if (netInterfaces.hasOwnProperty(k)) {
          const iface = netInterfaces[k];

          iface.forEach(ifaceDetails => {
            if (
              ifaceDetails.family === "IPv4" &&
              ifaceDetails.address !== "127.0.0.1"
            )
              console.log(
                `\t- Also listening at: http://${ifaceDetails.address}:${port}`
              );
          });
        }
      }

      console.log(`OK: Ready to serve the following files:`);

      const validFileNames = this.validFileNames;

      validFileNames.forEach(fileName => {
        console.log(`\t- ${fqdnUrl}${fileName}`);
      });
    });
  }
}
