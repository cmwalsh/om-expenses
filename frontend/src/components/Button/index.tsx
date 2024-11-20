import { assertError } from "common";
import { createSignal, JSX } from "solid-js";
import * as v from "valibot";
import { z } from "zod";
import { AlertDialog, openDialog } from "~/dialogs";
import { Colour, normaliseError } from "~/lib";

type LinkOrActionProps = { "on:click": Exclude<JSX.HTMLElementTags["button"]["on:click"], undefined> };

type Props = JSX.HTMLElementTags["button"] &
  LinkOrActionProps & {
    colour: Colour;
  };

export function Button({ classList, colour, ...props }: Props) {
  // const navigate = useNavigate();
  const [working, setWorking] = createSignal(false);

  const onClick = async (e: MouseEvent) => {
    try {
      setWorking(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (props["on:click"] as any)(e);
    } catch (_err) {
      assertError(_err);

      console.log("Error", _err.constructor.name);
      console.error(_err);

      const err = normaliseError(_err);

      let message = err.message;

      if (err instanceof z.ZodError) {
        message = err.issues.map((i, idx) => `[${idx}] ${i.message}`).join("\n");
      }

      if (err instanceof v.ValiError) {
        message = err.issues.map((i, idx) => `[${idx}] ${i.message}`).join("\n");
      }

      await openDialog(AlertDialog, {
        title: "An error occurred",
        message: "<p>" + message.replaceAll("\n", "</p><p>") + "</p>",
      });

      // alert(message);
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
