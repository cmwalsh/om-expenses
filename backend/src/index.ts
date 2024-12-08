import { createHTTPServer } from "npm:@trpc/server@11.0.0-rc.648/adapters/standalone";
import cors from "npm:cors";
import { Config } from "./config/index.ts";
import { AppRouter, tRPC } from "./routers/index.ts";

const Port = Config.OM_BACKEND_PORT;

export type AppRouter = typeof AppRouter;

const server = createHTTPServer({
  router: AppRouter,
  middleware: cors(),
  createContext: tRPC.createContext,
});

console.log("API server listening on port:", Port);
server.listen(Port);
