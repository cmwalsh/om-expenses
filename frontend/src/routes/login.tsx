import { Button, Card, MagicFields } from "@frontend/components";
import { AlertDialog, openDialog } from "@frontend/dialogs";
import { getLogoutReason } from "@frontend/helper";
import { AppService } from "@frontend/lib";
import { assertUnreachable, LoginDataSchema, type LoginData } from "@om-expenses/common";
import { useNavigate, type RouteSectionProps } from "npm:@solidjs/router";
import { createSignal, onMount } from "npm:solid-js";

export function Login(props: RouteSectionProps) {
  const navigate = useNavigate();
  const { toastService } = AppService.get();

  onMount(() => {
    const reason = getLogoutReason();

    if (reason === "expired") {
      toastService.addToast({
        life: 3_600_000,
        title: "Logged out",
        message: "You have been logged out because your session has expired.",
      });
    } else if (reason === "permissions") {
      toastService.addToast({
        life: 10_000,
        title: "Invalid permissions",
        message: "You do not have access to this area.",
      });
    } else if (reason === undefined) {
      // Do nothing
    } else {
      assertUnreachable(reason);
    }
  });

  const [login, setLogin] = createSignal<LoginData>({ email: "", password: "" });

  const [submittedCount, setSubmittedCount] = createSignal(0);

  const onLogin = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      setSubmittedCount(submittedCount() + 1);

      await AppService.get().login(login().email, login().password);

      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        await openDialog(AlertDialog, {
          title: "An error occurred",
          message: err.message,
        });
      }
    }
  };

  return (
    <main>
      <div class="grid">
        <form on:submit={onLogin} class="g-col-12 g-col-md-6 g-start-md-4">
          <Card colour="primary">
            <Card.Header text="Login" />
            <Card.Body>
              <MagicFields
                schema={LoginDataSchema}
                data={login()}
                validation={submittedCount() > 0}
                onChange={setLogin}
              />
            </Card.Body>
            <Card.Footer>
              <Button colour="info" on:click={() => setLogin({ email: "admin@example.com", password: "password" })}>
                Admin Demo
              </Button>
              <Button colour="info" on:click={() => setLogin({ email: "user@example.com", password: "password" })}>
                User Demo
              </Button>
              <button class="btn btn-primary" type="submit">
                Login
              </button>
            </Card.Footer>
          </Card>
        </form>
      </div>
    </main>
  );
}
