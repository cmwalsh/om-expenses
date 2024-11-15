import * as v from 'valibot';

export function hello() {
  return 'Hello!';
}

export const UserCreateSchema = v.object({
  email: v.pipe(v.string(), v.email(), v.description('Email Address')),
  name: v.pipe(v.string(), v.minLength(2), v.description('Name')),
  password: v.pipe(v.string(), v.minLength(8), v.description('Password')),
});

export type UserCreate = v.InferInput<typeof UserCreateSchema>;
