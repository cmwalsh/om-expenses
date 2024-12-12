import { Button, Card, DateInfo, MagicFields } from "@frontend/components";
import { beginPage } from "@frontend/helper";
import { canApprove, type ExpenseUpdate, ExpenseUpdateSchema } from "@om-expenses/common";
import type { RouteSectionProps } from "npm:@solidjs/router";
import * as v from "npm:valibot";
import { createResource, createSignal, Show, Suspense } from "solid-js";

export function ExpenseEdit(props: RouteSectionProps) {
  const { user, tRPC, toastService } = beginPage(["admin", "user"]);

  const id = () => props.params.id;

  const [expense, { mutate }] = createResource(() => tRPC.Expense.One.query(props.params.id));
  const [submittedCount, setSubmittedCount] = createSignal(0);

  const approveButtonVisible = () => {
    const u = user();
    const e = expense();
    return u && e && canApprove(u, e).success;
  };

  const onChange = (data: ExpenseUpdate) => mutate({ ...expense()!, ...data });

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);
    const res = v.parse(ExpenseUpdateSchema, expense());

    await tRPC.Expense.Update.mutate([id(), res]);

    toastService.addToast({ title: "Save", message: "Save successful", life: 5000 });
  };

  const onApprove = async () => {
    await tRPC.Expense.Approve.mutate(id());

    toastService.addToast({ title: "Approved", message: "Approved successfully", life: 5000 });
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
          <Show when={approveButtonVisible()}>
            <Button colour="warning" type="button" on:click={onApprove}>
              Approve
            </Button>
          </Show>
          <Button colour="primary" type="button" on:click={onSave}>
            Save
          </Button>
        </Card.Footer>
      </Card>
    </main>
  );
}
