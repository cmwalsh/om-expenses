// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.scss";
import { NavBar, ToastContainer } from "./components";

export default function App() {
  return (
    <Router
      root={(props) => (
        <div class="container">
          <NavBar />

          <Suspense>{props.children}</Suspense>

          <ToastContainer />
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
