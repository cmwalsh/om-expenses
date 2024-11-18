import { RouteSectionProps, useNavigate } from "@solidjs/router";
import { UserCreateSchema, UserUpdate, UserUpdateSchema } from "common";
import { createResource, createSignal, Show, Suspense } from "solid-js";
import * as v from "valibot";
import { Button, Card, MagicFields } from "~/components";
import { getIdModeAndSchema } from "~/helper";
import { addToast, AppService } from "~/lib";

export default function UserEdit(props: RouteSectionProps) {
  const [id, mode, schema] = getIdModeAndSchema(props, UserCreateSchema, UserUpdateSchema);

  const navigate = useNavigate();

  if (!AppService.get().getCurrentUser()) {
    console.log("Not logged in");
    return navigate("/login");
  }

  const [user, { mutate }] = createResource(async () => {
    let user: UserUpdate = {};

    if (props.params.id !== "new") {
      user = await AppService.get().tRPC.User.One.query(props.params.id);
    }

    return user;
  });

  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onChange = (data: UserUpdate) => {
    mutate({ ...user(), ...data });
  };

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);

    if (mode === "create") {
      const res = v.parse(schema, user());

      await AppService.get().tRPC.User.Create.mutate(res);
    } else {
      const res = v.parse(schema, user());

      await AppService.get().tRPC.User.Update.mutate([id, res]);
    }

    addToast({ title: "Save", message: "Save successful", life: 5000 });
  };

  return (
    <main>
      <Card>
        <Card.Header text={mode === "create" ? "Create User" : "Update User"} />
        <Card.Body>
          <form>
            <Suspense fallback="Loading...">
              <Show when={user()}>
                {(user) => (
                  <MagicFields schema={schema} data={user()} validation={submittedCount() > 0} onChange={onChange} />
                )}
              </Show>
            </Suspense>
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
