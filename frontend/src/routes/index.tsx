import { Card, Tile, TripSummary, UserTripSummary } from "@frontend/components";
import { beginPage } from "@frontend/helper";
import { AppService } from "@frontend/lib";
import { useNavigate } from "npm:@solidjs/router";
import { createResource, For, Match, Show, Switch } from "npm:solid-js";

export function Home() {
  const { user } = beginPage(["admin", "user"]);

  return (
    <main class="grid gap-3">
      <div class="g-col-12 g-col-xl-6">
        <Switch>
          <Match when={user()?.role === "admin"}>
            <AdminDashboard />
          </Match>
        </Switch>
      </div>

      <div class="g-col-12 g-col-xl-6">
        <UserDashboard />
      </div>
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
    <Card colour="warning">
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
                  class="g-col-6 g-col-md-3 g-col-xl-6"
                />
                <Tile
                  href="/trips"
                  number={stats().tripCount}
                  text="Trips listed"
                  colour="blue"
                  class="g-col-6 g-col-md-3 g-col-xl-6"
                />
                <Tile
                  href="/expenses?status=unapproved"
                  number={stats().expenseCount}
                  text="Expenses awaiting approval"
                  colour="red"
                  class="g-col-6 g-col-md-3 g-col-xl-6"
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
  const navigate = useNavigate();

  const [userTripSummaries] = createResource(() => AppService.get().tRPC.Stats.UserTripSummaries.query({}));

  const onClickTrip = (id: string) => {
    const user_id = AppService.get().mustGetCurrentUser()?.id;

    navigate(`/expenses?trip_id=${id}&user_id=${user_id}`);
  };

  return (
    <Card colour="primary">
      <Card.Header text="My Trips" />
      <Card.Body>
        <div class="d-flex gap-3 flex-column">
          <Show when={userTripSummaries()?.length ?? 0 > 0} fallback="You aren't on any trips yet">
            <For each={userTripSummaries()}>
              {(tripSummary) => (
                <UserTripSummary tripSummary={tripSummary} onClickTrip={() => onClickTrip(tripSummary.id)} />
              )}
            </For>
          </Show>
        </div>
      </Card.Body>
    </Card>
  );
}
