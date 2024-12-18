/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertDialog, openDialog } from "@frontend/dialogs";
import { Colour, FetchParameters, QuerySort, normaliseError } from "@frontend/lib";
import { assertError, camelToPascal, includes, keys } from "@om-expenses/common";
import { format } from "npm:date-fns";
import { enGB } from "npm:date-fns/locale";
import { JSXElement, createEffect, createSignal, onCleanup, onMount } from "npm:solid-js";
import { assert } from "npm:ts-essentials";
import * as v from "npm:valibot";
import { DataTable, DataTableColumn } from "../DataTable/index.tsx";
import { Pagination } from "../Pagination/index.tsx";

interface Props<TSchema extends v.ObjectSchema<any, any>, TRow extends v.InferInput<TSchema>> {
  title?: string;
  refresh?: number;
  schema: TSchema;
  rowActions?: readonly RowAction<TRow>[];
  tableActions?: readonly TableAction[];
  initialData?: readonly TRow[];
  onFetch: (params: FetchParameters) => Promise<{ rows: readonly TRow[]; total: number }>;
}

interface RowAction<TRow> {
  name: string;
  colour: Colour;
  onClick: (row: TRow) => void | Promise<void>;
}

interface TableAction {
  name: string;
  onClick: () => void | Promise<void>;
}

type Overrides<TRow> = {
  [TProp in Extract<keyof TRow, string> as `render${Capitalize<TProp>}`]?: (row: TRow) => JSXElement;
};

const PageSize = 5;

interface MagicBrowserInstance {
  refresh(): void;
}

const Instances: MagicBrowserInstance[] = [];

export function refreshAllBrowsers() {
  Instances.forEach((i) => i.refresh());
}

export function MagicBrowser<TSchema extends v.ObjectSchema<any, any>, TRow extends v.InferInput<TSchema>>(
  props: Props<TSchema, TRow> & Overrides<TRow>
) {
  const instance: MagicBrowserInstance = {
    refresh: () => {
      fetch(page(), search(), sort(), props.refresh);
    },
  };

  onMount(() => {
    Instances.push(instance);
  });
  onCleanup(() => {
    Instances.splice(Instances.indexOf(instance), 1);
  });

  const propSchemas = Object.entries(props.schema.entries) as readonly (readonly [
    string,
    v.SchemaWithPipe<Array<any> & [any]>
  ])[];

  const [rows, setRows] = createSignal<{ rows: readonly TRow[]; total: number }>({
    rows: props.initialData ?? [],
    total: props.initialData?.length ?? 0,
  });
  const [search, setSearch] = createSignal("");
  const [page, setPage] = createSignal(1);
  const [sort, setSort] = createSignal<QuerySort | undefined>();

  const fetch = async (page: number, search: string, sort?: QuerySort, refresh?: number) => {
    try {
      const rows = await props.onFetch({
        skip: (page - 1) * PageSize,
        take: PageSize,
        search,
        orderBy: sort ? [[sort.sort, sort.dir]] : [],
      });

      setRows(rows);
    } catch (_err) {
      assertError(_err);
      const err = normaliseError(_err);

      await openDialog(AlertDialog, {
        title: `Fetch Error: ${err.name}`,
        message: err.message,
      });
    }
  };

  createEffect(() => {
    fetch(page(), search(), sort(), props.refresh);
  });

  const onSearch = (search: string) => {
    setSearch(search);
    setPage(1);
  };

  const onSort = (colName: string) => {
    if (colName === "actions") return;

    const _sort = sort();

    if (_sort?.sort === colName && _sort.dir === "asc") {
      setSort({ sort: colName, dir: "desc" });
    } else {
      setSort({ sort: colName, dir: "asc" });
    }
  };

  const getColumns = (): readonly DataTableColumn<TRow>[] => {
    return propSchemas.map(([propName, propSchema]) => {
      const title = propSchema.pipe.find((item): item is v.TitleAction<string, string> => item.type === "title")?.title;

      return {
        name: propName,
        label: title ?? "???",
        render: (row): JSXElement => {
          const overrideName = `render${camelToPascal(propName)}`;

          if (includes(overrideName, keys(props)) && typeof props[overrideName] === "function") {
            return props[overrideName](row);
          }

          assert(includes(propName, keys(row)), `Property "${propName}" not in row!`);

          return renderValue(row[propName], propName);
        },
      };
    });
  };

  const TableActions = () => {
    if (!props.tableActions || props.tableActions.length === 0) return null;

    return (
      <div class="btn-group">
        {props.tableActions?.map((action) => (
          <button class="btn" onClick={() => action.onClick()}>
            {action.name}
          </button>
        ))}
      </div>
    );
  };

  const TableHeader = () => (
    <>
      {props.title && <div>{props.title}</div>}
      <TableActions />
    </>
  );

  const TableSubHeader = () => (
    <>
      <div class="input-group">
        <span class="input-group-text">🔍</span>
        <input
          type="text"
          class="form-control"
          value={search()}
          placeholder="Quick Search..."
          on:keyup={(e) => onSearch(e.currentTarget.value)}
        />
      </div>
    </>
  );

  const TableFooter = () => <Pagination page={page()} pageSize={PageSize} count={rows().total} onPage={setPage} />;

  return (
    <div class="d-flex flex-column gap-3">
      <TableHeader />
      <TableSubHeader />
      <DataTable
        columns={getColumns()}
        rows={rows().rows}
        rowActions={props.rowActions}
        sort={sort()}
        onSort={onSort}
      />
      <TableFooter />
    </div>
  );
}

function renderValue(value: unknown, propName: string): JSXElement {
  if (value === undefined) {
    return "[undefined]";
  }

  if (value === null) {
    return "[null]";
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object" && value instanceof Date) {
    return <span class="badge text-bg-secondary">{format(value, "PPp", { locale: enGB })}</span>;
  }

  return "!! Cannot format !!";
}
