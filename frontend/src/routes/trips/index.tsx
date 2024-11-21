import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import * as v from "valibot";
import { Card, LinkButton, MagicBrowser } from "~/components";
import { ensureLogin } from "~/helper";
import { AppService, FetchParameters } from "~/lib";

const TripTableSchema = v.object({
  name: v.pipe(v.string(), v.title("Name")),
  created: v.pipe(v.date(), v.title("Created")),
  updated: v.pipe(v.date(), v.title("Updated")),
});

export default function Trips(props: RouteSectionProps) {
  ensureLogin("admin");

  const navigate = useNavigate();

  const onFetch = async (params: FetchParameters) => {
    return AppService.get().tRPC.Trip.Search.query(params);
  };

  return (
    <main>
      <Card>
        <Card.Header text="Trips" />
        <Card.Body>
          <MagicBrowser
            schema={TripTableSchema}
            rowActions={[{ name: "Edit", colour: "info", onClick: (e) => navigate(`/trips/${e.id}`) }]}
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
