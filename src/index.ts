import dotenv from "dotenv";
import path from "path";
import Configurator from "./configurator";
import Daemon from "./daemon";

dotenv.config({
  path: path.resolve(process.cwd(), `tscw_config.txt`)
});

const run = () => {
  Configurator.validate();

  const server = new Daemon();
  server.start();
};

run();
