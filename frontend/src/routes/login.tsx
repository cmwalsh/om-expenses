import { createForm, SubmitHandler, valiForm } from "@modular-forms/solid";
import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import * as v from 'valibot';
import { AppService } from "~/lib";

const LoginFormSchema = v.object({
  email: v.pipe(v.string(), v.email("Not a valid email address")),
  password: v.pipe(v.string(), v.minLength(8)),
});

type LoginForm = v.InferInput<typeof LoginFormSchema>;

export default function Login(props: RouteSectionProps) {
  const navigate = useNavigate();

  const [loginForm, { Form, Field }] = createForm<LoginForm>({
    validate: valiForm(LoginFormSchema),
  });

  const handleSubmit: SubmitHandler<LoginForm> = async (login, event) => {
    try {

      const user = await AppService.get().login(login.email, login.password);

      if (user) {
        navigate('/');
      } else {
        alert("User not found");
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  }

  return (
    <main>

      <div class="d-flex justify-content-center align-items-center">
        <div class="col-12 col-md-6 col-lg-4">

          <Form onSubmit={handleSubmit} class="card login-form mt-3">
            <div class="card-body">
              <fieldset>
                <legend class="text-center mb-3">Login</legend>

                <Field name="email">
                  {(field, props) => (
                    <div class="form-group">
                      <label for="inputEmail">Email address</label>
                      <input
                        type="email"
                        id="inputEmail"
                        classList={{ 'form-control': true, 'is-invalid': !!field.error }}
                        placeholder="Email address"
                        required
                        {...props}
                      />
                    </div>
                  )}
                </Field>

                <Field name="password">
                  {(field, props) => (
                    <div class="form-group">
                      <label for="inputPassword">Password</label>
                      <input
                        type="password"
                        id="inputPassword"
                        classList={{ 'form-control': true, 'is-invalid': !!field.error }}
                        placeholder="Password"
                        required
                        {...props}
                      />
                      {field.error && <div class="invalid-feedback">{field.error}</div>}
                    </div>
                  )}
                </Field>

                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button class="btn btn-primary" type="submit">
                    Login
                  </button>
                </div>

              </fieldset>
            </div>
          </Form>

        </div>
      </div>

    </main>
  );
}
