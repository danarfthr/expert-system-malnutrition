import { proxyJson } from "../proxy";

export async function GET() {
  return proxyJson("/symptoms");
}
