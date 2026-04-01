import type { NextRequest } from "next/server";

import { buildBackendPath, proxyToBackend } from "@/lib/backend-proxy";

type AuthRouteContext = {
  params: Promise<{
    slug: string[];
  }>;
};

async function handleAuthProxy(request: NextRequest, context: AuthRouteContext) {
  const { slug } = await context.params;

  return proxyToBackend(request, buildBackendPath("/api/auth", slug));
}

export async function GET(request: NextRequest, context: AuthRouteContext) {
  return handleAuthProxy(request, context);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  return handleAuthProxy(request, context);
}
