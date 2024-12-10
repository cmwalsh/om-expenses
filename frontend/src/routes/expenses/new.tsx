import { Button, Card, MagicFields } from "@frontend/components";
import { beginPage } from "@frontend/helper";
import { AppService } from "@frontend/lib";
import { type ExpenseCreate, ExpenseCreateSchema } from "@om-expenses/common";
import { type RouteSectionProps, useSearchParams } from "npm:@solidjs/router";
import { createSignal } from "npm:solid-js";
import * as v from "npm:valibot";

export function ExpenseNew(props: RouteSectionProps) {
  const { navigate, toastService } = beginPage(["admin", "user"]);

  const [searchParams] = useSearchParams();

  const [expense, setExpense] = createSignal<Partial<ExpenseCreate>>({
    trip_id: typeof searchParams.trip_id === "string" ? searchParams.trip_id : undefined,
  });

  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onChange = (data: Partial<ExpenseCreate>) => {
    setExpense({ ...expense(), ...data });
  };

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);
    const res = v.parse(ExpenseCreateSchema, expense());

    const id = await AppService.get().tRPC.Expense.Create.mutate(res);

    toastService.addToast({ title: "Save", message: "Save successful", life: 5000 });
    navigate(`/expenses/${id}`);
  };

  return (
    <main>
      <Card colour="danger">
        <Card.Header text="Create Expense" />
        <Card.Body>
          <form class="d-flex flex-column gap-3">
            <MagicFields
              schema={ExpenseCreateSchema}
              data={expense()}
              validation={submittedCount() > 0}
              onChange={onChange}
            />
          </form>
        </Card.Body>
        <Card.Footer>
          <Button colour="primary" type="button" on:click={onSave}>
            Save
          </Button>
        </Card.Footer>
      </Card>
    </main>
  );
}
