// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.scss";

export default function App() {
  return (
    <Router root={props => (
      <div class="container">
        <header>
          <h1>OM Expenses</h1>
        </header>

        <nav class="navbar navbar-expand-lg">
          <div class="container-fluid">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" href="/">Index</a>
              </li>

              <li class="nav-item">
                <a class="nav-link active" href="/users">Users</a>
              </li>

              <li class="nav-item">
                <a class="nav-link active" href="/about">About</a>
              </li>
            </ul>
          </div>
        </nav>

        <Suspense>{props.children}</Suspense>
      </div>
    )}
    >
      <FileRoutes />
    </Router>
  );
}
