import { ensureLogin } from "~/helper";

export default function Home() {
  ensureLogin();

  return <main>TODO Dashboard</main>;
}
