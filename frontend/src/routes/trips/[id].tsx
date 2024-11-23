import { RouteSectionProps } from "@solidjs/router";
import { TripUpdate, TripUpdateSchema } from "common";
import { createResource, createSignal, Show, Suspense } from "solid-js";
import { assert } from "ts-essentials";
import * as v from "valibot";
import { Button, Card, DateInfo, MagicBrowser, MagicFields, refreshAllBrowsers } from "~/components";
import { openBrowser, openConfirm } from "~/dialogs";
import { ensureLogin } from "~/helper";
import { addToast, AppService, FetchParameters, UserSearchRecord } from "~/lib";

const UserPickSchema = v.object({
  email: v.pipe(v.string(), v.title("Email Address")),
  name: v.pipe(v.string(), v.title("Name")),
});

export default function TripEdit(props: RouteSectionProps) {
  ensureLogin("admin");

  const id = () => props.params.id;

  const [trip, { mutate }] = createResource(() => AppService.get().tRPC.Trip.One.query(props.params.id));
  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onChange = (data: TripUpdate) => mutate({ ...trip()!, ...data });

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);
    const res = v.parse(TripUpdateSchema, trip());

    await AppService.get().tRPC.Trip.Update.mutate([id(), res]);

    addToast({ title: "Save", message: "Save successful", life: 5000 });
  };

  const onFetchUsers = async (params: FetchParameters) => {
    return AppService.get().tRPC.User.Search.query({ ...params, trip_id: id() });
  };

  const onAddUser = async () => {
    assert(id, "Must save first");

    const row = await openBrowser("Add User", UserPickSchema, AppService.get().tRPC.User.Search.query);

    if (row) {
      await AppService.get().tRPC.Trip.AddUser.mutate({ trip_id: id(), user_id: row.id });
      refreshAllBrowsers();
    }
  };

  const onRemoveUser = async (row: UserSearchRecord) => {
    const res = await openConfirm("Remove user from trip", `Are you sure you wish to remove "${row.name}"`);

    if (res === "yes") {
      await AppService.get().tRPC.Trip.RemoveUser.mutate({ trip_id: id(), user_id: row.id });
      refreshAllBrowsers();
    }
  };

  return (
    <main class="d-flex flex-column gap-3">
      <Card colour="primary">
        <Card.Header text="Update Trip" />
        <Card.Body>
          <form>
            <Suspense fallback="Loading...">
              <Show when={trip()}>
                {(trip) => (
                  <div class="d-flex flex-column gap-3">
                    <MagicFields
                      schema={TripUpdateSchema}
                      data={trip()}
                      validation={submittedCount() > 0}
                      onChange={onChange}
                    />
                    <DateInfo record={trip()} />
                  </div>
                )}
              </Show>
            </Suspense>
          </form>
        </Card.Body>
        <Card.Footer>
          <Button colour="primary" type="button" on:click={onSave}>
            Save
          </Button>
        </Card.Footer>
      </Card>

      <Card colour="success">
        <Card.Header text="Users on this trip" />
        <Card.Body>
          <MagicBrowser
            schema={UserPickSchema}
            rowActions={[{ name: "Remove", colour: "danger", onClick: (row) => onRemoveUser(row) }]}
            onFetch={onFetchUsers}
          />
        </Card.Body>
        <Card.Footer>
          <Button colour="info" type="button" on:click={onAddUser}>
            Add User
          </Button>
        </Card.Footer>
      </Card>
    </main>
  );
}
