import { UserCreate } from 'common';
import { GraphQLClient } from 'graphql-request';
import { assert } from 'ts-essentials';
import { FetchParameters, SessionUser } from './common';
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
    const { data: { authenticateUserWithPassword } } = await this.sdk.AuthenticateUserWithPassword({ email, password });

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

  public async searchUsers(params: FetchParameters) {
    const result = await this.sdk.SearchUsers(params);
    assert(result.data.users && result.data.usersFilteredCount, 'searchUsers returned invalid result');

    return [result.data.users, result.data.usersFilteredCount] as const;
  }

  public async getUser(id: string) {
    const result = await this.sdk.GetUser({ id });
    assert(result.data.user, 'getUser returned invalid result');

    return result.data.user;
  }

  public async createUser(data: UserCreate) {
    const result = await this.sdk.CreateUser({ data });
    assert(result.data.createUser?.id, 'createUser returned invalid result');

    return result.data.createUser?.id;
  }

  public async updateUser(id: string, data: UserCreate) {
    const result = await this.sdk.UpdateUser({ data, where: { id } });
    assert(result.data.updateUser?.name, 'updateUser returned invalid result');
  }

  public getUsers() {
    return this.sdk.GetUsers({});
  }
}
