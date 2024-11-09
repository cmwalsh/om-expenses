import {
  useSubmission,
  type RouteSectionProps
} from "@solidjs/router";
import { GraphQLClient } from 'graphql-request';
import { createSignal } from "solid-js";
import { loginOrRegister } from "~/lib";
import { getSdk } from "~/lib/gql";

async function getUser(email: string) {
  const client = new GraphQLClient('http://localhost:3000/api/graphql');

  const sdk = getSdk(client);

  const data = await sdk.GetUsers({});
  if (!data.data.users) return null;

  const user = data.data.users.find(u => u.email === email);
  if (!user) return null;

  return user;
}

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);

  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');

  async function doLogin() {
    const user = await getUser(email());

    if (user) {
      alert(`Hello ${user.name}`);
    } else {
      alert("Not found");
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <form action={loginOrRegister} method="post">
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
