import { Button } from "../Button";

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
    <div class="d-md-flex gap-2 justify-content-md-end align-items-center text-nowrap">
      <div>
        Records {first()} to {last()}
      </div>

      <Button colour="secondary" disabled={props.page <= 1} on:click={() => props.onPage(props.page - 1)}>
        &lt; Back
      </Button>

      <div>
        Page {props.page} of {pageCount()}
      </div>

      <Button colour="secondary" disabled={props.page >= pageCount()} on:click={() => props.onPage(props.page + 1)}>
        Next &gt;
      </Button>
    </div>
  );
}
