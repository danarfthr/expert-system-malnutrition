import { proxyJson } from "../proxy";

export async function POST(request: Request) {
  const body = await request.json();

  return proxyJson("/diagnose", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
