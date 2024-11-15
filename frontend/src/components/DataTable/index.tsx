import { For, JSXElement } from "solid-js";
import { QuerySort } from "~/lib";

interface Props<TRow> {
  columns: readonly DataTableColumn<TRow>[];
  rowActions?: readonly RowAction<TRow>[];
  rows: readonly TRow[];
  sort?: QuerySort;
  onSort?: (colName: string) => void;
  subHeader?: () => JSXElement;
}

export interface DataTableColumn<TRow> {
  name: string;
  label?: string;
  render: (row: TRow) => JSXElement;
}

interface RowAction<TRow> {
  name: string;
  onClick: (row: TRow) => void | Promise<void>;
}

export function DataTable<TRow>(props: Props<TRow>) {
  const columns = props.columns.slice(0);

  if (props.rowActions?.length ?? 0 > 0) {
    columns.push({
      name: "actions",
      label: "Actions",
      render: (row) => {
        return (
          <div>
            <For each={props.rowActions}>
              {(action) => (
                <button class="btn btn-default" onClick={(e) => action.onClick(row)}>
                  {action.name}
                </button>
              )}
            </For>
          </div>
        );
      },
    });
  }

  return (
    <div>
      {props.subHeader && (
        <div>
          {props.subHeader()}
        </div>
      )}
      <table class="table">
        <thead>
          <tr>
            <For each={columns}>
              {(column) => (
                <th
                  style={{ cursor: props.onSort ? "pointer" : undefined }}
                  onclick={() => props.onSort?.(column.name)}
                >
                  <div style={{ display: "flex" }}>
                    {column.label ?? column.name}
                    {props.sort?.sort === column.name &&
                      (props.sort?.dir === "asc" ? (
                        <span>&nbsp;↓</span>
                      ) : props.sort?.dir === "desc" ? (
                        <span>&nbsp;↑</span>
                      ) : undefined)}
                  </div>
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr>
              <For each={columns}>{(column) => <td>{column.render(row)}</td>}</For>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
