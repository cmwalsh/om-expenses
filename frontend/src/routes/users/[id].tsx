import { RouteSectionProps, useNavigate } from "@solidjs/router";
import { UserCreateSchema } from "common";
import { createResource, createSignal, Show, Suspense } from "solid-js";
import * as v from "valibot";
import { Button, Card, MagicFields } from "~/components";
import { AppService } from "~/lib";

const UserFormSchema = UserCreateSchema;

type UserForm = v.InferInput<typeof UserFormSchema>;

export default function UserEdit(props: RouteSectionProps) {
  const navigate = useNavigate();

  if (!AppService.get().getCurrentUser()) {
    console.log("Not logged in");
    return navigate("/login");
  }

  const [user, { mutate }] = createResource(async () => {
    let user: UserForm = {
      email: "",
      name: "",
      password: "",
    };

    if (props.params.id !== "new") {
      const existingUser = await AppService.get().tRPC.User.One.query(props.params.id);

      user = { ...user, ...existingUser };
    }

    return user;
  });

  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onChange = (data: UserForm) => {
    mutate({ ...user()!, ...data });
  };

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);

    const res = v.parse(UserFormSchema, user());

    if (props.params.id === "new") {
      await AppService.get().tRPC.User.Create.mutate(res);
    } else {
      await AppService.get().tRPC.User.Update.mutate([props.params.id, res]);
    }
  };

  return (
    <main>
      <Card>
        <Card.Header text="User" />
        <Card.Body>
          <form>
            <Suspense fallback="Loading...">
              <Show when={user()}>
                <MagicFields
                  schema={UserFormSchema}
                  data={user()!}
                  validation={submittedCount() > 0}
                  onChange={onChange}
                />
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
