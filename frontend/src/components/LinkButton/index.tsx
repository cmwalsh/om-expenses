import { assertError } from "common";
import { createSignal, JSX } from "solid-js";
import { MarkRequired } from "ts-essentials";
import * as v from "valibot";
import { z } from "zod";
import { Colour, normaliseError } from "~/lib";

type Props = MarkRequired<JSX.HTMLElementTags["button"], "on:click"> & { colour: Colour };

export function Button({ classList, colour, ...props }: Props) {
  const [working, setWorking] = createSignal(false);

  const onClick = async (e: MouseEvent) => {
    if (!props["on:click"]) return;

    try {
      setWorking(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (props["on:click"] as any)(e);
    } catch (_err) {
      assertError(_err);
      const err = normaliseError(_err);

      console.log("Error", err.constructor.name);

      let message = err.message;

      if (err instanceof z.ZodError) {
        message = err.issues.map((i, idx) => `[${idx}] ${i.message}`).join("\n");
      }

      if (err instanceof v.ValiError) {
        message = err.issues.map((i, idx) => `[${idx}] ${i.message}`).join("\n");
      }

      // await UI.openDialog(AlertDialog, {
      //   title: "An error occurred",
      //   message,
      // });

      alert(message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <button
      {...props}
      classList={{ ...classList, btn: true, ["btn-" + colour]: true }}
      disabled={props.disabled || working()}
      on:click={onClick}
    />
  );
}
