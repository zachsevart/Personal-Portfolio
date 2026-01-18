import { WorkerEntrypoint } from "cloudflare:workers";

type Env = {
  R2: R2Bucket;
  AUTH_TOKEN?: string;
};

export default class extends WorkerEntrypoint<Env> {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!this.isAuthorized(request)) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" },
      });
    }

    switch (request.method) {
      case "PUT": {
        await this.env.R2.put(key, request.body, {
          onlyIf: request.headers,
          httpMetadata: request.headers,
        });
        return new Response(`Put ${key} successfully!`);
      }
      case "GET": {
        const object = await this.env.R2.get(key, {
          onlyIf: request.headers,
          range: request.headers,
        });

        if (object === null) {
          return new Response("Object Not Found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);

        // When no body is present, preconditions have failed
        return new Response("body" in object ? object.body : undefined, {
          status: "body" in object ? 200 : 412,
          headers,
        });
      }
      case "DELETE": {
        await this.env.R2.delete(key);
        return new Response("Deleted!");
      }
      default:
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            Allow: "PUT, GET, DELETE",
          },
        });
    }
  }

  private isAuthorized(request: Request) {
    if (!this.env.AUTH_TOKEN) return true;
    const header = request.headers.get("authorization");
    if (!header) return false;
    const [scheme, token] = header.split(" ");
    return scheme === "Bearer" && token === this.env.AUTH_TOKEN;
  }
};