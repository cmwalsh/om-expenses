import { useNavigate, type RouteDefinition } from "@solidjs/router";
import { createResource, For } from 'solid-js';
import { AppService } from "~/lib";

export const route = {
  preload() { }
} satisfies RouteDefinition;

export default function Home() {
  const navigate = useNavigate();

  const user = AppService.get().getCurrentUser();
  if (!user) {
    console.log('Not logged in');
    return navigate('/login');
  }

  const [users] = createResource(async () => {
    const data = await AppService.get().api.getUsers();
    return data.data;
  });

  const onLogout = () => {
    AppService.get().logout();
    navigate('/login');
  };

  return (
    <main class="w-full p-4 space-y-2">
      <h2 class="font-bold text-3xl">Hello {user?.name}</h2>
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

      <form on:submit={e => e.preventDefault()}>
        <button name="logout" on:click={() => onLogout()}>
          Logout
        </button>
      </form>
    </main>
  );
}
