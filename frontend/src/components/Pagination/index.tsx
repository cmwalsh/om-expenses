interface Props {
  class?: string;
  page: number;
  pageSize: number;
  count: number;

  onPage: (page: number) => void;
}

export function Pagination(props: Props) {
  const first = () => (props.page - 1) * props.pageSize + 1;
  const last = () => Math.min(props.page * props.pageSize, props.count);

  const pageCount = () => Math.ceil(props.count / props.pageSize);

  return (
    <div style={{ display: 'flex' }}>
      <div>
        Showing {first()} to {last()}
      </div>

      <button color="info" disabled={props.page <= 1} onClick={() => props.onPage(props.page - 1)}>
        &lt; Back
      </button>

      <div>
        Page {props.page} of {pageCount()}
      </div>

      <button
        color="info"
        disabled={props.page >= pageCount()}
        onClick={() => props.onPage(props.page + 1)}
      >
        Next &gt;
      </button>
    </div>
  );
}
