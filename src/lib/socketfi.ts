import { SocketFi } from "@socketfi/react";
import { getSocketFiConfig } from "./socketfi-config";

let client: SocketFi | null = null;

export function getSocketFiClient(): SocketFi {
  if (!client) {
    client = new SocketFi(getSocketFiConfig());
  }
  return client;
}
