import { NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://localhost:8000";

export function getBackendUrl(): string {
  return process.env.BACKEND_URL ?? DEFAULT_BACKEND_URL;
}

export async function proxyJson(path: string, init?: RequestInit): Promise<NextResponse> {
  try {
    const response = await fetch(`${getBackendUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        detail:
          "Tidak dapat terhubung ke backend. Pastikan server FastAPI berjalan.",
      },
      { status: 502 },
    );
  }
}
