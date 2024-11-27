import { type RouteSectionProps } from "@solidjs/router";
import { humanise } from "common";
import * as v from "valibot";
import { Card, LinkButton, MagicBrowser, refreshAllBrowsers } from "~/components";
import { openConfirm } from "~/dialogs";
import { beginPage } from "~/helper";
import { AppService, FetchParameters, UserSearchRecord } from "~/lib";

const UserTableSchema = v.object({
  role: v.pipe(v.string(), v.title("Role")),
  email: v.pipe(v.string(), v.title("Email Address")),
  name: v.pipe(v.string(), v.title("Name")),
  created: v.pipe(v.date(), v.title("Created")),
  updated: v.pipe(v.date(), v.title("Updated")),
});

export default function Users(props: RouteSectionProps) {
  const { navigate } = beginPage("admin");

  const onFetch = async (params: FetchParameters) => {
    return AppService.get().tRPC.User.Search.query(params);
  };

  const onDelete = async (row: UserSearchRecord) => {
    const res = await openConfirm("Delete user", `Are you sure you wish to delete "${row.name}"`);

    if (res === "yes") {
      await AppService.get().tRPC.User.Delete.mutate(row.id);
      refreshAllBrowsers();
    }
  };

  return (
    <main>
      <Card colour="success">
        <Card.Header text="Users" />
        <Card.Body>
          <MagicBrowser
            schema={UserTableSchema}
            rowActions={[
              { name: "Edit", colour: "info", onClick: (row) => navigate(`/users/${row.id}`) },
              { name: "Delete", colour: "danger", onClick: onDelete },
            ]}
            onFetch={onFetch}
            renderRole={(row) => humanise(row.role)}
          />
        </Card.Body>
        <Card.Footer>
          <LinkButton colour="info" href="/users/new">
            New
          </LinkButton>
        </Card.Footer>
      </Card>
    </main>
  );
}
