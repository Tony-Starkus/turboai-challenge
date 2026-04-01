import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { BACKEND_API_BASE_URL } from "@/lib/api-types";

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

export async function proxyToBackend(request: NextRequest, backendPath: string) {
  try {
    const requestBody = BODYLESS_METHODS.has(request.method)
      ? undefined
      : await request.text();

    const response = await fetch(
      `${BACKEND_API_BASE_URL}${backendPath}${request.nextUrl.search}`,
      {
        method: request.method,
        headers: buildBackendHeaders(request, Boolean(requestBody)),
        body: requestBody,
        cache: "no-store",
      },
    );

    const responseBody = await response.text();
    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        detail: "Unable to reach backend service.",
      },
      {
        status: 502,
      },
    );
  }
}

export function buildBackendPath(basePath: string, segments: string[] = []) {
  const normalizedBasePath = basePath.endsWith("/")
    ? basePath.slice(0, -1)
    : basePath;
  const normalizedSegments = segments.map((segment) => encodeURIComponent(segment));

  return `${normalizedBasePath}${
    normalizedSegments.length > 0 ? `/${normalizedSegments.join("/")}` : ""
  }/`;
}

function buildBackendHeaders(request: NextRequest, hasBody: boolean) {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const contentType = request.headers.get("content-type");

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (hasBody) {
    headers.set("content-type", contentType ?? "application/json");
  }

  return headers;
}
