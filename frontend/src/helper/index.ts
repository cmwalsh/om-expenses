import { useNavigate } from "@solidjs/router";
import type { AppRouter } from "backend";
import { includes } from "common";
import { assert } from "ts-essentials";
import { AppService } from "~/lib";

export type Role = (ReturnType<AppRouter["User"]["One"]> extends PromiseLike<infer T> ? T : never)["role"];

export function ensureLogin(_role?: Role | Role[]) {
  const role = _role instanceof Array ? _role : _role === undefined ? [] : [_role];
  const navigate = useNavigate();

  const user = AppService.get().getCurrentUser();

  if (!user) {
    return navigate("/login");
  }
  if (role.length > 0 && !role.includes(user.role)) {
    return navigate("/login?reason=permissions");
  }

  return () => user;
}

export function getLogoutReason() {
  const url = new URL(window.location.href);
  const reason = url.searchParams.get("reason");
  assert(includes(reason, ["expired", "permissions", null] as const), `Invalid reason "${reason}"`);
  return reason;
}
