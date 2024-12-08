import { Button, Card, MagicFields } from "@frontend/components";
import { beginPage } from "@frontend/helper";
import { addToast, AppService } from "@frontend/lib";
import { TripCreate, TripCreateSchema } from "@om-expenses/common";
import { RouteSectionProps } from "npm:@solidjs/router";
import { createSignal } from "npm:solid-js";
import * as v from "npm:valibot";

export function TripNew(props: RouteSectionProps) {
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
