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
      <h1>Login</h1>
      <form on:submit={(e) => e.preventDefault()}>
        <input type="hidden" name="redirectTo" value={props.params.redirectTo ?? "/"} />
        <fieldset>
          <legend>Login or Register?</legend>
          <label>
            <input type="radio" name="loginType" value="login" checked={true} /> Login
          </label>
          <label>
            <input type="radio" name="loginType" value="register" /> Register
          </label>
        </fieldset>
        <div>
          <label for="username-input">Username</label>
          <input name="username" placeholder="username" value={email()} on:change={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label for="password-input">Password</label>
          <input name="password" type="password" placeholder="password" value={password()} on:change={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" on:click={doLogin}>Login</button>
        {/* <Show when={loggingIn.result}>
          <p style={{ color: "red" }} role="alert" id="error-message">
            {loggingIn.result!.message}
          </p>
        </Show> */}
      </form>
    </main>
  );
}
