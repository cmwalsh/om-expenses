import { createAsync, type RouteDefinition } from "@solidjs/router";
import { createResource, For } from 'solid-js';
import { getUser, logout } from "~/lib";
import { getSdk } from "~/lib/gql";
import { GraphQLClient } from 'graphql-request';

export const route = {
  preload() { getUser() }
} satisfies RouteDefinition;

const client = new GraphQLClient('http://localhost:3000/api/graphql');

const sdk = getSdk(client);

export default function Home() {
  const user = createAsync(() => getUser(), { deferStream: true });

  const [users] = createResource(async () => {
    const data = await sdk.GetUsers({});
    return data.data;
  });

  return (
    <main class="w-full p-4 space-y-2">
      {/* <h2 class="font-bold text-3xl">Hello {user()?.username}</h2> */}
      <h3 class="font-bold text-xl">Message board</h3>

      <pre>{JSON.stringify(users(), null, 2)}</pre>

      <table>
        <thead>
          <tr><th>ID</th><th>Email</th><th>Name</th></tr>
        </thead>
        <tbody>
          <For each={users()?.users} fallback={<div>Loading...</div>}>
            {(user) => <tr><td>{user.id}</td><td>{user.email}</td><td>{user.name}</td></tr>}
          </For>
        </tbody>
      </table>

      <form action={logout} method="post">
        <button name="logout" type="submit">
          Logout
        </button>
      </form>
    </main>
  );
}
