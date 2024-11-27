import { RouteSectionProps } from "@solidjs/router";
import { TripCreate, TripCreateSchema } from "common";
import { createSignal } from "solid-js";
import * as v from "valibot";
import { Button, Card, MagicFields } from "~/components";
import { beginPage } from "~/helper";
import { addToast, AppService } from "~/lib";

export default function TripEdit(props: RouteSectionProps) {
  const { navigate } = beginPage("admin");

  const [trip, setTrip] = createSignal<Partial<TripCreate>>({});
  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onChange = (data: Partial<TripCreate>) => {
    setTrip({ ...trip(), ...data });
  };

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);
    const res = v.parse(TripCreateSchema, trip());

    const id = await AppService.get().tRPC.Trip.Create.mutate(res);

    addToast({ title: "Save", message: "Save successful", life: 5000 });
    navigate(`/trips/${id}`);
  };

  return (
    <main>
      <Card colour="primary">
        <Card.Header text="Create Trip" />
        <Card.Body>
          <form>
            <MagicFields
              schema={TripCreateSchema}
              data={trip()}
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
