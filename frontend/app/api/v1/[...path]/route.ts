const defaultBackendUrl = "https://churnsense-f9l9.onrender.com";
const backendTimeoutMs = 90_000;

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: Request, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const backendUrl = (process.env.API_URL?.trim() || defaultBackendUrl).replace(/\/+$/, "");
  const targetUrl = new URL(
    `/api/v1/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`,
    backendUrl,
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), backendTimeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers.get("content-type")
        ? { "content-type": request.headers.get("content-type")! }
        : undefined,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
      signal: controller.signal,
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    const timedOut = controller.signal.aborted;
    console.error(
      `Backend proxy ${timedOut ? "timed out" : "failed"} for ${targetUrl.pathname}:`,
      error,
    );
    return Response.json(
      {
        detail: timedOut
          ? "The backend did not respond within 90 seconds."
          : "The backend could not be reached. Check the server-side API_URL and backend availability.",
      },
      { status: timedOut ? 504 : 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
