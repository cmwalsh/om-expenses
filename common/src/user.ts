import * as v from "valibot";

export const LoginDataSchema = v.object({
  email: v.pipe(v.string(), v.email("Not a valid email address"), v.description("Email Address")),
  password: v.pipe(v.string(), v.minLength(8), v.description("Password")),
});

export type LoginData = v.InferInput<typeof LoginDataSchema>;

export const UserCreateSchema = v.object({
  email: v.pipe(v.string(), v.email(), v.description("Email Address")),
  name: v.pipe(v.string(), v.minLength(2), v.description("Name")),
  password: v.pipe(v.string(), v.minLength(8), v.description("Password")),
});

export type UserCreate = v.InferInput<typeof UserCreateSchema>;

export const UserUpdateSchema = v.partial(UserCreateSchema);

export type UserUpdate = v.InferInput<typeof UserUpdateSchema>;
