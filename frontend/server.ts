import { serveDir } from "jsr:@std/http/file-server";

export default {
  async fetch(req: Request) {
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

    // if (url.pathname === "/css/bootstrap.css") {
    //   return new Response(Deno.readFileSync("../node_modules/bootstrap/dist/css/bootstrap.css"), {
    //     headers: { "content-type": "text/css" },
    //   });
    // }
    // if (url.pathname === "/css/bootstrap-grid.css") {
    //   return new Response(Deno.readFileSync("../node_modules/bootstrap/dist/css/bootstrap-grid.css"), {
    //     headers: { "content-type": "text/css" },
    //   });
    // }

    return serveDir(req, {
      fsRoot: "web",
      urlRoot: "",
    });

    // if (request.url.startsWith("/json")) {
    //   return Response.json({ hello: "world" });
    // }

    // return new Response("Hello world!");
  },
};
