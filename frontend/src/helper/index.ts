import { AppService, type InferReturn } from "@frontend/lib";
import type { AppRouter } from "@om-expenses/backend";
import { includes } from "@om-expenses/common";
import { useNavigate, useSearchParams } from "npm:@solidjs/router";
import { assert } from "npm:ts-essentials";

export type Role = InferReturn<AppRouter["User"]["One"]>["role"];

export function beginPage(_role: Role | Role[]) {
  const role = _role instanceof Array ? _role : [_role];
  assert(role.length > 0, "beginPage: Must have at least one role!");

  const navigate = useNavigate();
  const user = AppService.get().getCurrentUser();
  const { tRPC, toastService } = AppService.get();

  const helpers = { navigate, tRPC, toastService };

  if (!user) {
    navigate("/login");

    return { user: () => null, ...helpers };
  }
  if (!role.includes(user.role)) {
    navigate("/login?reason=permissions");

    return { user: () => null, ...helpers };
  }

  return { user: () => user, ...helpers };
}

export function beginPageNoRole() {
  const user = AppService.get().getCurrentUser();
  const { tRPC, toastService } = AppService.get();

  const helpers = { tRPC, toastService };

  return { user: () => user, ...helpers };
}

export function getLogoutReason() {
  const [searchParams] = useSearchParams();

  const reason = searchParams.reason;
  assert(includes(reason, ["expired", "permissions", undefined] as const), `Invalid reason "${reason}"`);
  return reason;
}
