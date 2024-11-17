import { useNavigate, type RouteDefinition } from "@solidjs/router";
import { createResource, For } from "solid-js";
import { Button } from "~/components";
import { AppService } from "~/lib";

export const route = {
  preload() {},
} satisfies RouteDefinition;

export default function Home() {
  const navigate = useNavigate();

  const user = AppService.get().getCurrentUser();
  if (!user) {
    console.log("Not logged in");
    return navigate("/login");
  }

  const [users] = createResource(async () => {
    const data = await AppService.get().tRPC.User.Search.query({ take: 10, skip: 0, orderBy: [] });
    return data.rows;
  });

  const onLogout = () => {
    AppService.get().logout();
    navigate("/login");
  };

  return (
    <main>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <For each={users()} fallback={<div>Loading...</div>}>
            {(user) => (
              <tr>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.name}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>

      <form on:submit={(e) => e.preventDefault()}>
        <Button colour="secondary" on:click={() => onLogout()}>
          Logout
        </Button>
      </form>
    </main>
  );
}
