import { useNavigate } from "@solidjs/router";
import { createResource, For, Match, Show, Switch } from "solid-js";
import { Card, Tile, TripSummary } from "~/components";
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
  const navigate = useNavigate();

  const [stats] = createResource(() => AppService.get().tRPC.Stats.Stats.query({}));

  const [tripSummaries] = createResource(() => AppService.get().tRPC.Stats.TripSummaries.query({}));

  const onClickTrip = (id: string) => {
    navigate(`/expenses?trip_id=${id}`);
  };

  return (
    <Card colour="secondary">
      <Card.Header text="Admin Dashboard" />
      <Card.Body>
        <div class="d-flex gap-3 flex-column">
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
                  href="/expenses?status=unapproved"
                  number={stats().expenseCount}
                  text="Expenses awaiting approval"
                  colour="red"
                  class="g-col-6 g-col-md-3"
                />
              </div>
            )}
          </Show>

          <div class="d-flex gap-3 flex-column">
            <For each={tripSummaries()}>
              {(tripSummary) => (
                <TripSummary tripSummary={tripSummary} onClickTrip={() => onClickTrip(tripSummary.id)} />
              )}
            </For>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

function UserDashboard() {
  return (
    <Card colour="secondary">
      <Card.Header text="User Dashboard" />
      <Card.Body>Welcome...</Card.Body>
    </Card>
  );
}
