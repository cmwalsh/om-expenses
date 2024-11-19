import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import { LoginData, LoginDataSchema } from "common";
import { createEffect, createSignal } from "solid-js";
import { Card, MagicFields } from "~/components";
import { AlertDialog, openDialog } from "~/dialogs";
import { getLogoutReason } from "~/helper";
import { addToast, AppService } from "~/lib";

export default function Login(props: RouteSectionProps) {
  const navigate = useNavigate();

  createEffect(() => {
    if (getLogoutReason() === "expired") {
      addToast({
        life: 3600000,
        title: "Logged out",
        message: "You have been logged out because your session has expired.",
      });
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
      <div class="d-flex justify-content-center align-items-center">
        <div class="col-12 col-md-6 col-lg-4">
          <form on:submit={onLogin}>
            <Card>
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
                <button class="btn btn-primary" type="submit">
                  Login
                </button>
              </Card.Footer>
            </Card>
          </form>
        </div>
      </div>
    </main>
  );
}
