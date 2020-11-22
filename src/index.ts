import { Config } from "./config";
import Daemon from "./daemon";

export const config = new Config();
config.load();

const run = () => {
  const server = new Daemon();
  server.start();
};

run();
