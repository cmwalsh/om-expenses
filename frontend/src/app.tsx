import { NavBar, ToastContainer } from "@frontend/components";
import { beginPageNoRole } from "@frontend/helper";
import { Route, Router, type RouteSectionProps } from "npm:@solidjs/router";
import { type Component, Suspense } from "npm:solid-js";
import { render } from "npm:solid-js/web";
import { ExpenseEdit } from "./routes/expenses/edit.tsx";
import { Expenses } from "./routes/expenses/index.tsx";
import { ExpenseNew } from "./routes/expenses/new.tsx";
import { Home } from "./routes/index.tsx";
import { Login } from "./routes/login.tsx";
import { TripEdit } from "./routes/trips/edit.tsx";
import { Trips } from "./routes/trips/index.tsx";
import { TripNew } from "./routes/trips/new.tsx";
import { UserEdit } from "./routes/users/edit.tsx";
import { Users } from "./routes/users/index.tsx";
import { UserNew } from "./routes/users/new.tsx";

function App() {
  const { toastService } = beginPageNoRole();

  const root: Component<RouteSectionProps> = (props) => (
    <div class="container">
      <NavBar />
      <Suspense>{props.children}</Suspense>
      <ToastContainer onListen={toastService.setToastListener} onRemoveToast={toastService.removeToast} />
    </div>
  );

  return (
    <Router root={root}>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />

      <Route path="/users/" component={Users} />
      <Route path="/users/new" component={UserNew} />
      <Route path="/users/:id" component={UserEdit} />

      <Route path="/trips/" component={Trips} />
      <Route path="/trips/new" component={TripNew} />
      <Route path="/trips/:id" component={TripEdit} />

      <Route path="/expenses/" component={Expenses} />
      <Route path="/expenses/new" component={ExpenseNew} />
      <Route path="/expenses/:id" component={ExpenseEdit} />
    </Router>
  );
}

render(App, document.getElementById("app")!);
