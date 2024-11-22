import { RouteSectionProps, useNavigate } from "@solidjs/router";
import { ExpenseCreate, ExpenseCreateSchema } from "common";
import { createResource, createSignal } from "solid-js";
import * as v from "valibot";
import { Button, Card, FormFields, MagicFields, Select } from "~/components";
import { ensureLogin } from "~/helper";
import { addToast, AppService } from "~/lib";

export default function ExpenseEdit(props: RouteSectionProps) {
  ensureLogin();
  const navigate = useNavigate();

  const [expense, setExpense] = createSignal<Partial<ExpenseCreate>>({});
  const [submittedCount, setSubmittedCount] = createSignal(0);

  const [tripOptions] = createResource(async () => {
    const { rows: trips } = await AppService.get().tRPC.Trip.Search.query({ skip: 0, take: 1000, orderBy: [] });
    return trips.map((t) => ({ value: t.id, text: t.name }));
  });

  const onChange = (data: Partial<ExpenseCreate>) => {
    setExpense({ ...expense(), ...data });
  };

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);
    const res = v.parse(ExpenseCreateSchema, expense());

    const id = await AppService.get().tRPC.Expense.Create.mutate(res);

    addToast({ title: "Save", message: "Save successful", life: 5000 });
    navigate(`/expenses/${id}`);
  };

  return (
    <main>
      <Card>
        <Card.Header text="Create Expense" />
        <Card.Body>
          <form class="d-flex flex-column gap-3">
            <FormFields>
              <FormFields.Field
                id="trip_id"
                title="Trip"
                messages={[]}
                description="Which trip is this expense for?"
                icon="✈"
              >
                <Select
                  id="trip_id"
                  isInvalid={submittedCount() > 0 && expense().trip_id === undefined}
                  placeholder="Trip"
                  value={expense().trip_id}
                  options={tripOptions() ?? []}
                  onChange={(trip_id) => setExpense({ trip_id })}
                />
              </FormFields.Field>
            </FormFields>

            <MagicFields
              schema={v.omit(ExpenseCreateSchema, ["trip_id"])}
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
