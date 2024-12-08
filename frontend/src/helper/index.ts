import { AppService } from "@frontend/lib";
import { includes } from "@om-expenses/common";
import type { AppRouter } from "backend";
import { useNavigate, useSearchParams } from "npm:@solidjs/router";
import { assert } from "npm:ts-essentials";

export type Role = (ReturnType<AppRouter["User"]["One"]> extends PromiseLike<infer T> ? T : never)["role"];

export function beginPage(_role: Role | Role[]) {
  const role = _role instanceof Array ? _role : [_role];
  assert(role.length > 0, "beginPage: Must have at least one role!");

  const navigate = useNavigate();

  const user = AppService.get().getCurrentUser();

  if (!user) {
    navigate("/login");

    return { user: () => null, navigate };
  }
  if (!role.includes(user.role)) {
    navigate("/login?reason=permissions");

    return { user: () => null, navigate };
  }

  return { user: () => user, navigate };
}

export function getLogoutReason() {
  const [searchParams] = useSearchParams();

  const reason = searchParams.reason;
  assert(includes(reason, ["expired", "permissions", undefined] as const), `Invalid reason "${reason}"`);
  return reason;
}
