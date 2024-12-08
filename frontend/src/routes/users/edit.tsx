import { Button, Card, DateInfo, MagicFields } from "@frontend/components";
import { beginPage } from "@frontend/helper";
import { addToast, AppService } from "@frontend/lib";
import { UserUpdate, UserUpdateSchema } from "@om-expenses/common";
import { RouteSectionProps } from "npm:@solidjs/router";
import { createResource, createSignal, Show, Suspense } from "npm:solid-js";
import * as v from "npm:valibot";

export function UserEdit(props: RouteSectionProps) {
  beginPage("admin");

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
      <Card colour="success">
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
