import { RouteSectionProps } from "@solidjs/router";

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
