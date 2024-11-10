import { GraphQLClient } from 'graphql-request';
import { SessionUser } from './common';
import { getSdk } from "./gql";

export class ApiService {
  private client;
  private sdk;

  constructor(sessionToken?: string) {
    const headers: Record<string, string> = {}

    if (sessionToken) {
      headers.Authorization = `Bearer ${sessionToken}`
    }

    this.client = new GraphQLClient('http://localhost:3000/api/graphql', { headers });
    this.sdk = getSdk(this.client);
  }

  public async login(email: string, password: string): Promise<SessionUser> {
    const sdk = getSdk(this.client);

    const { data: { authenticateUserWithPassword } } = await sdk.AuthenticateUserWithPassword({ email, password });

    if (authenticateUserWithPassword) {
      if ('sessionToken' in authenticateUserWithPassword) {
        const { item, sessionToken } = authenticateUserWithPassword;

        return {
          id: item.id,
          name: item.name,
          email: item.email,
          sessionToken: sessionToken
        };
      } else {
        throw new Error(authenticateUserWithPassword.message);
      }
    } else {
      throw new Error('Unknown Error');
    }
  }

  public getUsers() {
    return this.sdk.GetUsers({});
  }
}
