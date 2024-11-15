import { RouteSectionProps, useNavigate } from "@solidjs/router";
import { UserCreateSchema } from 'common';
import { createResource, createSignal, Show, Suspense } from "solid-js";
import * as v from 'valibot';
import { MagicFields, MagicFormApi } from "~/components";
import { AppService, sleep } from "~/lib";

const UserFormSchema = UserCreateSchema;

type UserForm = v.InferInput<typeof UserFormSchema>;

export default function UserEdit(props: RouteSectionProps) {
  const navigate = useNavigate();

  if (!AppService.get().getCurrentUser()) {
    console.log('Not logged in');
    return navigate('/login');
  }

  const [user, { mutate }] = createResource(async () => {
    let user: UserForm = {
      email: '',
      name: '',
      password: '',
    };

    if (props.params.id !== 'new') {
      user = {
        ...user,
        ...await AppService.get().api.getUser(props.params.id),
      };
    }

    await sleep(1000);

    return user;
  });

  const [submittedCount, setSubmittedCount] = createSignal(0);

  let _api: MagicFormApi<UserForm>;

  const onChange = (data: UserForm) => {
    mutate({ ...user()!, ...data });
  };

  const onSave = async () => {
    setSubmittedCount(submittedCount() + 1);

    const res = v.parse(UserFormSchema, user())

    if (props.params.id === 'new') {
      await AppService.get().api.createUser(res);
    } else {
      await AppService.get().api.updateUser(props.params.id, res);
    }
  };

  return (
    <main>

      <div class="card">
        <div class="card-header bg-primary text-white">
          User
        </div>

        <div class="card-body">

          <form>

            <Suspense fallback='Loading...'>
              <Show when={user()}>
                <MagicFields
                  schema={UserFormSchema}
                  data={user()!}
                  validation={submittedCount() > 0}
                  api={api => _api = api}
                  onChange={onChange}
                />
              </Show>
            </Suspense>

          </form>

        </div>

        <div class="card-footer">
          <div class="d-grid gap-2 justify-content-md-end">

            <button class="btn btn-primary" type="button" on:click={onSave}>
              Save
            </button>

          </div>
        </div>
      </div>

    </main>
  );
}
