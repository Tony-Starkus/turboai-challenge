import type { NextRequest } from "next/server";

import { buildBackendPath, proxyToBackend } from "@/lib/backend-proxy";

type NotesRouteContext = {
  params: Promise<{
    slug?: string[];
  }>;
};

async function handleNotesProxy(request: NextRequest, context: NotesRouteContext) {
  const { slug = [] } = await context.params;

  return proxyToBackend(request, buildBackendPath("/api/notes", slug));
}

export async function GET(request: NextRequest, context: NotesRouteContext) {
  return handleNotesProxy(request, context);
}

export async function POST(request: NextRequest, context: NotesRouteContext) {
  return handleNotesProxy(request, context);
}

export async function PUT(request: NextRequest, context: NotesRouteContext) {
  return handleNotesProxy(request, context);
}

export async function PATCH(request: NextRequest, context: NotesRouteContext) {
  return handleNotesProxy(request, context);
}

export async function DELETE(request: NextRequest, context: NotesRouteContext) {
  return handleNotesProxy(request, context);
}
