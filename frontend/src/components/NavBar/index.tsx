import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { AppService } from "~/lib";
import { Button } from "../Button";

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
        <button class="navbar-toggler" type="button" aria-label="Toggle navigation" on:click={onToggle}>
          <span class="navbar-toggler-icon"></span>
        </button>

        <div classList={{ collapse: true, "navbar-collapse": true, show: expanded() }}>
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link active" href="/">
                Index
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link active" href="/users">
                Users
              </a>
            </li>

            <li class="nav-item">
              <a class="nav-link active" href="/about">
                About
              </a>
            </li>
          </ul>

          <Show when={user()}>
            {(user) => (
              <div class="d-flex gap-1 align-items-center">
                <div class="badge text-bg-info">{user().role}</div>
                <div>Welcome {user().name}!</div>
                <Button colour="warning" on:click={onLogout}>
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
