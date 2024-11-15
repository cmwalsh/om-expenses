export interface Session {
  id: string;
  name: string;
  email: string;
}

export const IsNotNull = {
  read: true,
  update: true,
  create: true,
};

// TODO: MustBeUser, MustBeAdmin etc.
export const MustBeLoggedIn = (args: { session?: Session }) => !!args.session;
