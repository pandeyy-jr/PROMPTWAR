import { NextResponse } from "next/server";

/**
 * Shallow liveness check for the container platform. It deliberately does not
 * query Supabase or expose configuration; a database readiness check belongs
 * in the deployment stage once a project is connected.
 */
export function GET() {
  return NextResponse.json(
    { status: "ok", service: "fairshift" },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
