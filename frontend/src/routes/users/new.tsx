import { RouteSectionProps } from "@solidjs/router";
import { UserCreate, UserCreateSchema } from "common";
import { createSignal } from "solid-js";
import * as v from "valibot";
import { Button, Card, MagicFields } from "~/components";
import { beginPage } from "~/helper";
import { addToast, AppService } from "~/lib";

export default function UserEdit(props: RouteSectionProps) {
  const { navigate } = beginPage("admin");

  const [user, setUser] = createSignal<Partial<UserCreate>>({});
  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onChange = (data: Partial<UserCreate>) => {
    setUser({ ...user(), ...data });
  };

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);
    const res = v.parse(UserCreateSchema, user());

    const id = await AppService.get().tRPC.User.Create.mutate(res);

    addToast({ title: "Save", message: "Save successful", life: 5000 });
    navigate(`/users/${id}`);
  };

  return (
    <main>
      <Card colour="success">
        <Card.Header text="Create User" />
        <Card.Body>
          <form>
            <MagicFields
              schema={UserCreateSchema}
              data={user()}
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
