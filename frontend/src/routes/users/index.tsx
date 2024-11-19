import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import * as v from "valibot";
import { Button, Card, MagicBrowser } from "~/components";
import { AppService, FetchParameters } from "~/lib";

const UserTableSchema = v.object({
  role: v.pipe(v.string(), v.title("Role")),
  email: v.pipe(v.string(), v.title("Email Address")),
  name: v.pipe(v.string(), v.title("Name")),
});

export default function Users(props: RouteSectionProps) {
  const navigate = useNavigate();

  if (!AppService.get().getCurrentUser()) {
    console.log("Not logged in");
    return navigate("/login");
  }

  const onFetch = async (params: FetchParameters) => {
    return AppService.get().tRPC.User.Search.query(params);
  };

  return (
    <main>
      <Card>
        <Card.Header text="Users" />
        <Card.Body>
          <MagicBrowser
            schema={UserTableSchema}
            rowActions={[{ name: "Edit", colour: "info", onClick: (e) => navigate(`/users/${e.id}`) }]}
            onFetch={onFetch}
          />
        </Card.Body>
        <Card.Footer>
          <Button colour="info" href="/users/new">
            New
          </Button>
        </Card.Footer>
      </Card>
    </main>
  );
}
