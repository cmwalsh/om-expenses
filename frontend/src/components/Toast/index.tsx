import { formatDistanceToNow } from "date-fns";
import { createSignal, For } from "solid-js";
import { setToastListener, ToastInfo } from "~/lib";

interface Props {
  title: string;
  time: number;
  message: string;
}

export function Toast(props: Props) {
  const [show, setShow] = createSignal(false);

  const [time, setTime] = createSignal(formatDistanceToNow(new Date(props.time), { addSuffix: true }));

  requestAnimationFrame(() => setShow(true));

  setInterval(() => {
    setTime(formatDistanceToNow(new Date(props.time), { addSuffix: true }));
  }, 1000);

  return (
    <div classList={{ toast: true, fade: true, show: show() }} role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">{props.title}</strong>
        <small>{time()}</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">{props.message}</div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToast] = createSignal<ToastInfo[]>([]);

  setToastListener(setToast);

  return (
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <For each={toasts()}>
        {(toastInfo) => <Toast title={toastInfo.title} time={toastInfo.time} message={toastInfo.message} />}
      </For>
    </div>
  );
}
