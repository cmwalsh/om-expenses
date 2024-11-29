import { pickPrefix } from "common";
import { parse } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import * as v from "valibot";

export const ConfigSchema = v.object({
  OM_DATABASE_URL: v.pipe(v.string(), v.startsWith("postgresql://")),
  OM_SECRET_KEY: v.pipe(v.string(), v.minLength(16)),
  OM_BACKEND_PORT: v.pipe(
    v.string(),
    v.decimal(),
    v.transform((s) => parseInt(s, 10)),
  ),
});

let env = pickPrefix(process.env, "OM_");

// This hack is only needed to make `drizzle-kit push` work as it doesn't inherit the environment...
const devEnvLocation = path.resolve("..", ".env");
if (fs.existsSync(devEnvLocation)) {
  console.log("==== Reading env from:", devEnvLocation);
  env = parse(fs.readFileSync(devEnvLocation));
}

export const Config = v.parse(ConfigSchema, env);
