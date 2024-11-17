export interface ToastInfo {
  id: number;
  title: string;
  time: number;
  life: number;
  message: string;
}

let Toasts: readonly ToastInfo[] = [];
let LastId = 0;

type Listener = (toasts: readonly ToastInfo[]) => void;
let Listener: Listener | undefined;

export function addToast(toast: Omit<ToastInfo, "id" | "time">) {
  Toasts = [...Toasts, { id: LastId++, time: Date.now(), ...toast }];
  if (Listener) Listener(Toasts);
}

export function setToastListener(listener: Listener) {
  Listener = listener;
}

setInterval(() => {
  const expired = Toasts.filter((t) => t.time + t.life < Date.now());
  if (expired.length > 0) {
    Toasts = Toasts.filter((t) => !expired.includes(t));
    if (Listener) Listener(Toasts);
  }
}, 1000);
