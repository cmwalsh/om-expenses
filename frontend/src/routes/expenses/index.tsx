import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import { ExpenseStatus, ExpenseType, FieldMetadata, humanise } from "common";
import { createSignal } from "solid-js";
import * as v from "valibot";
import { Card, LinkButton, MagicBrowser, MagicFields } from "~/components";
import { ensureLogin } from "~/helper";
import { AppService, FetchParameters } from "~/lib";

const ExpenseTableSchema = v.object({
  trip_name: v.pipe(v.string(), v.title("Trip")),
  user_name: v.pipe(v.string(), v.title("User")),
  status: v.pipe(v.string(), v.title("Status")),
  merchant: v.pipe(v.string(), v.title("Merchant")),
  amount: v.pipe(v.string(), v.title("Amount")),
  created: v.pipe(v.date(), v.title("Created")),
  updated: v.pipe(v.date(), v.title("Updated")),
});

const ExpenseFilterSchema = v.partial(
  v.object({
    user_id: v.pipe(v.string(), v.uuid(), v.title("User"), v.metadata(FieldMetadata({ icon: "🧑", lookup: "User" }))),
    trip_id: v.pipe(v.string(), v.uuid(), v.title("Trip"), v.metadata(FieldMetadata({ icon: "✈", lookup: "Trip" }))),
    type: v.pipe(v.picklist(ExpenseType), v.title("Type"), v.metadata(FieldMetadata({ icon: "❓" }))),
    status: v.pipe(v.picklist(ExpenseStatus), v.title("Status"), v.metadata(FieldMetadata({ icon: "⏼" }))),
  }),
);

type ExpenseFilter = v.InferInput<typeof ExpenseFilterSchema>;

export default function Expenses(props: RouteSectionProps) {
  ensureLogin("admin");

  const navigate = useNavigate();

  const [filter, setFilter] = createSignal<ExpenseFilter>({
    status: "unapproved",
  });

  const onFetch = async (params: FetchParameters) => {
    return AppService.get().tRPC.Expense.Search.query({ ...params, ...filter() });
  };

  return (
    <main class="d-flex flex-column gap-3">
      <Card>
        <Card.Header text="Filter Expenses" />
        <Card.Body>
          <MagicFields schema={ExpenseFilterSchema} validation={true} data={filter()} onChange={setFilter} />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header text="Results" />
        <Card.Body>
          <MagicBrowser
            schema={ExpenseTableSchema}
            rowActions={[{ name: "Edit", colour: "info", onClick: (e) => navigate(`/expenses/${e.id}`) }]}
            onFetch={onFetch}
            renderStatus={(row) => humanise(row.status)}
            renderAmount={(row) => parseFloat(row.amount).toFixed(2)}
          />
        </Card.Body>
        <Card.Footer>
          <LinkButton colour="info" href="/expenses/new">
            New
          </LinkButton>
        </Card.Footer>
      </Card>
    </main>
  );
}
