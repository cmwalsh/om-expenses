import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import { Config } from "./config/index.js";
import { AppRouter, tRPC } from "./routers/index.js";

const Port = Config.OM_BACKEND_PORT;

export type AppRouter = typeof AppRouter;

const server = createHTTPServer({
  router: AppRouter,
  middleware: cors(),
  createContext: tRPC.createContext,
});

console.log("API server listening on port:", Port);
server.listen(Port);
