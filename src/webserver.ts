import express from "express";
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
    this.log(LogType.ERROR, `File ${fileName} not found`);

    return res
      .status(HttpStatusCodes.NOT_FOUND)
      .send({ error: `File not found` });
  }

  private found(req, res, fullPath) {
    this.log(LogType.INFO, `Serving file ${path.basename(fullPath)}`);

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

    this.app = app;

    const port = Number(process.env.PORT);

    this.app.listen(port, () => {
      console.log(
        `OK: Listening for HTTP requests on http://${os.hostname()}:${port}/`
      );
    });
  }
}
