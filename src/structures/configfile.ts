export type ConfigFile = {
  /**
   * The full path to the watch directory
   * @example "C:\Users\Admin\statcrew\"
   */
  watchDir: string;
  /**
   * An array of files that can be proxied over the websocket connection
   * @example [
   *   "bsb.xml",
   *   "sb.xml"
   * ]
   */
  validFiles: string[];
  /**
   * The URL of the public-facing relay server, including websocket protocol
   * @example "ws://myserver.com"
   */
  relayServer: string;
};
