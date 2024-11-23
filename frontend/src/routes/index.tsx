import { createResource, Match, Show, Switch } from "solid-js";
import { Card, Tile } from "~/components";
import { ensureLogin } from "~/helper";
import { AppService } from "~/lib";

export default function Home() {
  const user = ensureLogin();
  if (!user) return;

  return (
    <main>
      <Switch>
        <Match when={user().role === "admin"}>
          <AdminDashboard />
        </Match>
        <Match when={user().role === "user"}>
          <UserDashboard />
        </Match>
      </Switch>
    </main>
  );
}

function AdminDashboard() {
  const [stats] = createResource(() => AppService.get().tRPC.Stats.Stats.query({}));

  return (
    <Card colour="secondary">
      <Card.Header text="Admin Dashboard" />
      <Card.Body>
        <Show when={stats()}>
          {(stats) => (
            <div class="grid">
              <Tile
                href="/users"
                number={stats().userCount}
                text="Users registered"
                colour="green"
                class="g-col-6 g-col-md-3"
              />
              <Tile
                href="/trips"
                number={stats().tripCount}
                text="Trips listed"
                colour="blue"
                class="g-col-6 g-col-md-3"
              />
              <Tile
                href="/expenses"
                number={stats().expenseCount}
                text="Expenses awaiting approval"
                colour="red"
                class="g-col-6 g-col-md-3"
              />
            </div>
          )}
        </Show>
      </Card.Body>
    </Card>
  );
}

function UserDashboard() {
  return (
    <Card colour="secondary">
      <Card.Header text="Admin Dashboard" />
      <Card.Body>====</Card.Body>
    </Card>
  );
}
