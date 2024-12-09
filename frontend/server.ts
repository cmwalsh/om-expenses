import { serveDir } from "jsr:@std/http/file-server";

const portStr = Deno.env.get("OM_FRONTEND_PORT");
if (!portStr) throw new Error("No port specified!");

const port = parseInt(portStr, 10);

Deno.serve({ port }, (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname !== "/" && !url.pathname.includes(".")) {
    req = new Request(`${url.protocol}//${url.host}/`, req);
  }

  if (url.pathname.startsWith("/js")) {
    return serveDir(req, {
      fsRoot: "dist",
      urlRoot: "js",
    });
  }

  return serveDir(req, {
    fsRoot: "web",
    urlRoot: "",
  });
});
