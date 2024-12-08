import { removeToast, setToastListener, ToastInfo } from "@frontend/lib";
import { formatDistanceToNow } from "npm:date-fns";
import { createSignal, For } from "npm:solid-js";

interface Props {
  id: number;
  title: string;
  time: number;
  message: string;
  onClose: (id: number) => void;
}

export function Toast(props: Props) {
  const [show, setShow] = createSignal(false);

  const [time, setTime] = createSignal(formatDistanceToNow(new Date(props.time), { addSuffix: true }));

  requestAnimationFrame(() => setShow(true));

  setInterval(() => {
    setTime(formatDistanceToNow(new Date(props.time), { addSuffix: true }));
  }, 1000);

  const onClose = () => {
    props.onClose(props.id);
  };

  return (
    <div classList={{ toast: true, fade: true, show: show() }} role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">{props.title}</strong>
        <small>{time()}</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" on:click={onClose}></button>
      </div>
      <div class="toast-body">{props.message}</div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToast] = createSignal<ToastInfo[]>([]);

  setToastListener(setToast);

  const onClose = (id: number) => {
    removeToast(id);
  };

  return (
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <For each={toasts()}>
        {(toastInfo) => (
          <Toast
            id={toastInfo.id}
            title={toastInfo.title}
            time={toastInfo.time}
            message={toastInfo.message}
            onClose={onClose}
          />
        )}
      </For>
    </div>
  );
}
