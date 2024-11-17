interface Props {
  title: string;
  message: string;
  onClose: () => void;
}

export function AlertDialog(props: Props) {
  return (
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">{props.title}</h1>
          <button type="button" class="btn-close" aria-label="Close" on:click={props.onClose}></button>
        </div>
        <div class="modal-body">{props.message}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-default" on:click={props.onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}