import { RouteSectionProps } from "@solidjs/router";
import { UserUpdate, UserUpdateSchema } from "common";
import { createResource, createSignal, Show, Suspense } from "solid-js";
import * as v from "valibot";
import { Button, Card, DateInfo, MagicFields } from "~/components";
import { ensureLogin } from "~/helper";
import { addToast, AppService } from "~/lib";

export default function UserEdit(props: RouteSectionProps) {
  ensureLogin();
  const id = () => props.params.id;

  const [user, { mutate }] = createResource(() => AppService.get().tRPC.User.One.query(props.params.id));
  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onChange = (data: UserUpdate) => mutate({ ...user()!, ...data });

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);
    const res = v.parse(UserUpdateSchema, user());

    await AppService.get().tRPC.User.Update.mutate([id(), res]);

    addToast({ title: "Save", message: "Save successful", life: 5000 });
  };

  return (
    <main>
      <Card>
        <Card.Header text="Update User" />
        <Card.Body>
          <form>
            <Suspense fallback="Loading...">
              <Show when={user()}>
                {(user) => (
                  <div class="d-flex flex-column gap-3">
                    <MagicFields
                      schema={UserUpdateSchema}
                      data={user()}
                      validation={submittedCount() > 0}
                      onChange={onChange}
                    />
                    <DateInfo record={user()} />
                  </div>
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
