import { RouteSectionProps, useNavigate } from "@solidjs/router";
import { AppService } from "~/lib";

export function ensureLogin() {
  const navigate = useNavigate();

  if (!AppService.get().getCurrentUser()) {
    return navigate("/login");
  }
}

export function getIdModeAndSchema<TCreateSchema, TUpdateSchema>(
  props: RouteSectionProps,
  createSchema: TCreateSchema,
  updateSchema: TUpdateSchema,
) {
  return props.params.id === "new"
    ? ([undefined, "create", createSchema] as const)
    : ([props.params.id, "update", updateSchema] as const);
}

export function getLogoutReason() {
  const url = new URL(window.location.href);

  return url.searchParams.get("reason");
}
