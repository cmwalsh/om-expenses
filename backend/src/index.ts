import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import "dotenv/config";
import { AppRouter, tRPC } from "./routers";

const Port = 3000;

export type AppRouter = typeof AppRouter;

const server = createHTTPServer({
  router: AppRouter,
  middleware: cors(),
  createContext: tRPC.createContext,
});

console.log("API server listening on port:", Port);
server.listen(Port);
