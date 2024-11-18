/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertError, camelToPascal } from "common";
import { JSXElement, createEffect, createSignal } from "solid-js";
import * as v from "valibot";
import { Colour, FetchParameters, QuerySort, normaliseError } from "~/lib";
import { DataTable, DataTableColumn } from "../DataTable";
import { Pagination } from "../Pagination";

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

const PageSize = 10;

export function MagicBrowser<TSchema extends v.ObjectSchema<any, any>, TRow extends v.InferInput<TSchema>>(
  props: Props<TSchema, TRow> & Overrides<TRow>,
) {
  const propSchemas = Object.entries(props.schema.entries) as readonly (readonly [
    string,
    v.SchemaWithPipe<Array<any> & [any]>,
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

      // await UI.openDialog(AlertDialog, {
      //   title: `Fetch Error: ${err.name}`,
      //   message: err.message,
      // });
    }
  };

  createEffect(() => {
    void fetch(page(), search(), sort(), props.refresh);
  });

  const onSearch = (search: string) => {
    setSearch(search);
    setPage(1);
  };

  const onSort = (colName: string) => {
    const _sort = sort();

    if (_sort?.sort === colName && _sort.dir === "asc") {
      setSort({ sort: colName, dir: "desc" });
    } else {
      setSort({ sort: colName, dir: "asc" });
    }
  };

  const getColumns = (): readonly DataTableColumn<TRow>[] => {
    return propSchemas.map(([propName, propSchema]) => {
      const description = propSchema.pipe.find(
        (item): item is v.DescriptionAction<string, string> => item.type === "description",
      )?.description;

      return {
        name: propName,
        label: description ?? "???",
        render: (row) => {
          const overrideName = `render${camelToPascal(propName)}`;

          if (overrideName in props) {
            return (props as any)[overrideName](row);
          }

          return (row as any)[propName];
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
      <div>{props.title}</div>
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
    <div>
      <TableHeader />
      <DataTable
        subHeader={TableSubHeader}
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
