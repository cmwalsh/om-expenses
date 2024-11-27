import { useSearchParams, type RouteSectionProps } from "@solidjs/router";
import { ExpenseStatus, ExpenseType, FieldMetadata, humanise } from "common";
import * as v from "valibot";
import { Button, Card, MagicBrowser, MagicFields, refreshAllBrowsers } from "~/components";
import { openConfirm } from "~/dialogs";
import { beginPage } from "~/helper";
import { AppService, ExpenseSearchRecord, FetchParameters } from "~/lib";

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
    user_id: v.pipe(v.string(), v.uuid(), v.title("User"), v.metadata(FieldMetadata({ icon: "👤", lookup: "User" }))),
    trip_id: v.pipe(v.string(), v.uuid(), v.title("Trip"), v.metadata(FieldMetadata({ icon: "✈", lookup: "Trip" }))),
    type: v.pipe(v.picklist(ExpenseType), v.title("Type"), v.metadata(FieldMetadata({ icon: "❓" }))),
    status: v.pipe(v.picklist(ExpenseStatus), v.title("Status"), v.metadata(FieldMetadata({ icon: "⏼" }))),
  }),
);

type ExpenseFilter = v.InferInput<typeof ExpenseFilterSchema>;

// Needed to clear search params (useSearchParams)
const ClearFilter: ExpenseFilter = { user_id: undefined, trip_id: undefined, type: undefined, status: undefined };

export default function Expenses(props: RouteSectionProps) {
  const { user, navigate } = beginPage(["admin", "user"]);

  const schema = user()?.role === "admin" ? ExpenseFilterSchema : v.omit(ExpenseFilterSchema, ["user_id"]);

  const [filter, setFilter] = useSearchParams();

  // const [filter, setFilter] = createSignal<ExpenseFilter>(v.parse(ExpenseFilterSchema, searchParams));

  const onFetch = async (params: FetchParameters) => {
    return AppService.get().tRPC.Expense.Search.query({ ...params, ...filter });
  };

  const onDelete = async (row: ExpenseSearchRecord) => {
    const res = await openConfirm(
      "Delete user",
      `Are you sure you wish to delete expense for "${row.merchant}" of value "${parseFloat(row.amount).toFixed(2)}"`,
    );

    if (res === "yes") {
      await AppService.get().tRPC.Trip.Delete.mutate(row.id);
      refreshAllBrowsers();
    }
  };

  const onNewExpense = () => {
    const searchParams = new URLSearchParams();

    if (filter.trip_id) {
      searchParams.set("trip_id", String(filter.trip_id));
    }

    navigate(`/expenses/new?${searchParams}`);
  };

  return (
    <main class="d-flex flex-column gap-3">
      <Card>
        <Card.Header text="Filter Expenses" />
        <Card.Body>
          <MagicFields schema={schema} validation={true} data={filter} onChange={setFilter} />
        </Card.Body>
        <Card.Footer>
          <Button colour="secondary" on:click={() => setFilter(ClearFilter)}>
            Clear Filter
          </Button>
        </Card.Footer>
      </Card>

      <Card colour="danger">
        <Card.Header text="Results" />
        <Card.Body>
          <MagicBrowser
            schema={ExpenseTableSchema}
            rowActions={[
              { name: "Edit", colour: "info", onClick: (e) => navigate(`/expenses/${e.id}`) },
              { name: "Delete", colour: "danger", onClick: onDelete },
            ]}
            onFetch={onFetch}
            renderStatus={(row) => humanise(row.status)}
            renderAmount={(row) => parseFloat(row.amount).toFixed(2)}
          />
        </Card.Body>
        <Card.Footer>
          <Button colour="info" on:click={onNewExpense}>
            New
          </Button>
        </Card.Footer>
      </Card>
    </main>
  );
}
