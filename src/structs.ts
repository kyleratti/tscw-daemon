export type RelayRequest = {
  requestId: string;
  fileName: string;
};

export type RelayResponse = {
  requestId: string;
  fileName: string;
  data: string;
};
