import { For } from "solid-js";
import { ElementOf } from "ts-essentials";

interface Props<TOptions extends readonly SelectOption[]> {
  id: string;
  isInvalid: boolean;
  placeholder: string;
  value: ElementOf<TOptions>["value"] | undefined;
  options: TOptions;

  onChange: (value: string) => void;
}

export interface SelectOption {
  value: string;
  text: string;
}

export function Select<TOptions extends readonly SelectOption[]>(props: Props<TOptions>) {
  return (
    <select
      value={props.value}
      classList={{
        "form-control": true,
        "is-invalid": props.isInvalid,
        "value-undefined": props.value === undefined,
      }}
      title={props.placeholder}
      on:change={(e) => props.onChange(e.currentTarget.value)}
    >
      <option value="">(Select {props.placeholder})</option>
      <For each={props.options}>{(o) => <option value={o.value}>{o.text}</option>}</For>
    </select>
  );
}
