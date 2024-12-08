import { Button, Card, MagicFields } from "@frontend/components";
import { beginPage } from "@frontend/helper";
import { addToast, AppService } from "@frontend/lib";
import { UserCreate, UserCreateSchema } from "@om-expenses/common";
import { RouteSectionProps } from "npm:@solidjs/router";
import { createSignal } from "npm:solid-js";
import * as v from "npm:valibot";

export function UserNew(props: RouteSectionProps) {
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
