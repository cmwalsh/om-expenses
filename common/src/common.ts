import * as v from "valibot";

export const EmailAddress = v.pipe(
  v.string(),
  v.email("Not a valid email address"),
  v.title("Email Address"),
  v.metadata({ icon: "@" }),
);

export const Password = (title: string, desc = "") =>
  v.pipe(v.string(), v.minLength(8), v.title(title), v.metadata({ icon: "⋯" }), v.description(desc));
