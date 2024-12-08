import { AppService } from "@frontend/lib";
import { useNavigate } from "npm:@solidjs/router";
import { createSignal, Show } from "npm:solid-js";
import { Button } from "../Button/index.tsx";

export function NavBar() {
  const user = () => AppService.get().getCurrentUser();

  const navigate = useNavigate();

  const [expanded, setExpanded] = createSignal(false);

  const onToggle = () => {
    setExpanded(!expanded());
  };

  const onLogout = () => {
    AppService.get().logout();
    navigate("/login");
  };

  return (
    <nav class="navbar navbar-expand-lg mb-3">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          OM Expenses1
        </a>

        <button class="navbar-toggler" type="button" aria-label="Toggle navigation" on:click={onToggle}>
          <span class="navbar-toggler-icon"></span>
        </button>

        <div classList={{ collapse: true, "navbar-collapse": true, show: expanded() }}>
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link active" href="/">
                Home
              </a>
            </li>

            <Show when={user()?.role === "admin"}>
              <li class="nav-item">
                <a class="nav-link active" href="/users">
                  Users
                </a>
              </li>

              <li class="nav-item">
                <a class="nav-link active" href="/trips">
                  Trips
                </a>
              </li>
            </Show>

            <li class="nav-item">
              <a class="nav-link active" href="/expenses">
                Expenses
              </a>
            </li>
          </ul>

          <Show when={user()}>
            {(user) => (
              <div class="d-flex gap-1 align-items-center">
                <Show when={user().role === "admin"}>
                  <div class="badge text-bg-warning">{user().role}</div>
                </Show>

                <div>Welcome {user().name}!</div>

                <Button colour="secondary" on:click={onLogout}>
                  Logout
                </Button>
              </div>
            )}
          </Show>
        </div>
      </div>
    </nav>
  );
}
