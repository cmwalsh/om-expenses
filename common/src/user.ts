import * as v from "valibot";
import { EmailAddress, FieldMetadata, Password } from "./common";

export const LoginDataSchema = v.object({
  email: EmailAddress,
  password: Password("Password"),
});

export type LoginData = v.InferInput<typeof LoginDataSchema>;

export const UserCreateSchema = v.object({
  role: v.pipe(v.picklist(["admin", "user"]), v.title("Role"), v.metadata(FieldMetadata({ icon: "Role" }))),
  email: EmailAddress,
  name: v.pipe(v.string(), v.minLength(2), v.title("Name"), v.metadata(FieldMetadata({ icon: "🧑" }))),
  new_password: Password("New Password", "Leave blank to keep existing password"),
  confirm_password: Password("Confirm Password"),
});

export type UserCreate = v.InferInput<typeof UserCreateSchema>;

export const UserUpdateSchema = v.partial(UserCreateSchema);

export type UserUpdate = v.InferInput<typeof UserUpdateSchema>;
