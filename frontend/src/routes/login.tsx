import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import { createSignal } from "solid-js";
import { AppService } from "~/lib";

export default function Login(props: RouteSectionProps) {
  const navigate = useNavigate();

  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');

  async function doLogin() {
    try {
      const user = await AppService.get().login(email(), password());

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

          <form class="card login-form mt-3" on:submit={(e) => e.preventDefault()}>
            <div class="card-body">
              <fieldset>
                <legend class="text-center mb-3">Login</legend>

                <div class="form-group">
                  <label for="inputEmail">Email address</label>
                  <input
                    type="email"
                    id="inputEmail"
                    class="form-control"
                    placeholder="Email address"
                    required
                    autofocus
                    value={email()}
                    on:change={e => setEmail(e.target.value)}
                  />
                </div>

                <div class="form-group">
                  <label for="inputPassword">Password</label>
                  <input
                    type="password"
                    id="inputPassword"
                    class="form-control"
                    placeholder="Password"
                    required
                    value={password()}
                    on:change={e => setPassword(e.target.value)}
                  />
                </div>

                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    class="btn btn-primary"
                    type="submit"
                    on:click={doLogin}
                  >
                    Login
                  </button>
                </div>

              </fieldset>
            </div>
          </form>

        </div>
      </div>

    </main >
  );
}
