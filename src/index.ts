import WebServer from "./webserver";
import Configurator from "./configurator";

const run = () => {
  Configurator.validate();

  const server = new WebServer();
  server.start();
};

run();
