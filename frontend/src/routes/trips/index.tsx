import { Card, LinkButton, MagicBrowser, refreshAllBrowsers } from "@frontend/components";
import { openConfirm } from "@frontend/dialogs";
import { beginPage } from "@frontend/helper";
import { AppService, type FetchParameters, type TripSearchRecord } from "@frontend/lib";
import type { RouteSectionProps } from "npm:@solidjs/router";
import * as v from "npm:valibot";

const TripTableSchema = v.object({
  name: v.pipe(v.string(), v.title("Name")),
  location: v.pipe(v.string(), v.title("Location")),
  created: v.pipe(v.date(), v.title("Created")),
  updated: v.pipe(v.date(), v.title("Updated")),
});

export function Trips(props: RouteSectionProps) {
  const { navigate } = beginPage("admin");

  const onFetch = async (params: FetchParameters) => {
    return AppService.get().tRPC.Trip.Search.query(params);
  };

  const onDelete = async (row: TripSearchRecord) => {
    const res = await openConfirm("Delete user", `Are you sure you wish to delete "${row.name}"`);

    if (res === "yes") {
      await AppService.get().tRPC.Trip.Delete.mutate(row.id);
      refreshAllBrowsers();
    }
  };

  return (
    <main>
      <Card colour="primary">
        <Card.Header text="Trips" />
        <Card.Body>
          <MagicBrowser
            schema={TripTableSchema}
            rowActions={[
              { name: "Edit", colour: "info", onClick: (e) => navigate(`/trips/${e.id}`) },
              { name: "Delete", colour: "danger", onClick: onDelete },
            ]}
            onFetch={onFetch}
          />
        </Card.Body>
        <Card.Footer>
          <LinkButton colour="info" href="/trips/new">
            New
          </LinkButton>
        </Card.Footer>
      </Card>
    </main>
  );
}
