import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import { humanise } from "common";
import * as v from "valibot";
import { Card, LinkButton, MagicBrowser } from "~/components";
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

export default function Expenses(props: RouteSectionProps) {
  ensureLogin("admin");

  const navigate = useNavigate();

  const onFetch = async (params: FetchParameters) => {
    return AppService.get().tRPC.Expense.Search.query(params);
  };

  return (
    <main>
      <Card>
        <Card.Header text="Expenses" />
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
