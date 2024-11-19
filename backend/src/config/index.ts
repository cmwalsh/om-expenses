import * as v from "valibot";

export const ConfigSchema = v.object({
  DATABASE_URL: v.pipe(v.string(), v.startsWith("postgresql://")),
  SECRET_KEY: v.pipe(v.string(), v.minLength(16)),
});

export const Config = v.parse(ConfigSchema, process.env);
