import { RouteSectionProps } from "@solidjs/router";
import { ExpenseUpdate, ExpenseUpdateSchema } from "common";
import { createResource, createSignal, Show, Suspense } from "solid-js";
import * as v from "valibot";
import { Button, Card, DateInfo, MagicFields } from "~/components";
import { beginPage } from "~/helper";
import { addToast, AppService } from "~/lib";

export default function ExpenseEdit(props: RouteSectionProps) {
  beginPage(["admin", "user"]);

  const id = () => props.params.id;

  const [expense, { mutate }] = createResource(() => AppService.get().tRPC.Expense.One.query(props.params.id));
  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onChange = (data: ExpenseUpdate) => mutate({ ...expense()!, ...data });

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);
    const res = v.parse(ExpenseUpdateSchema, expense());

    await AppService.get().tRPC.Expense.Update.mutate([id(), res]);

    addToast({ title: "Save", message: "Save successful", life: 5000 });
  };

  const onApprove = async () => {
    await AppService.get().tRPC.Expense.Approve.mutate(id());

    addToast({ title: "Approved", message: "Approved successfully", life: 5000 });
  };

  return (
    <main class="d-flex flex-column gap-3">
      <Card colour="danger">
        <Card.Header text="Update Expense" />
        <Card.Body>
          <form>
            <Suspense fallback="Loading...">
              <Show when={expense()}>
                {(expense) => (
                  <div class="d-flex flex-column gap-3">
                    <MagicFields
                      schema={ExpenseUpdateSchema}
                      data={expense()}
                      validation={submittedCount() > 0}
                      onChange={onChange}
                    />
                    <DateInfo record={expense()} />
                  </div>
                )}
              </Show>
            </Suspense>
          </form>
        </Card.Body>
        <Card.Footer>
          <Button colour="warning" type="button" on:click={onApprove}>
            Approve
          </Button>
          <Button colour="primary" type="button" on:click={onSave}>
            Save
          </Button>
        </Card.Footer>
      </Card>
    </main>
  );
}
