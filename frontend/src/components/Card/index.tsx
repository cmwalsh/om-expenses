import { children, createMemo, JSX, Show } from "solid-js";
import { assert } from "ts-essentials";

interface Props {
  children: JSX.Element;
}

export function Card(props: Props) {
  const components = children(() => props.children) as unknown as () => (
    | (HeaderProps & { type: "header" })
    | (BodyProps & { type: "body" })
    | (FooterProps & { type: "footer" })
  )[];

  const evalParts = createMemo(() => {
    let parts = components();
    if (!Array.isArray(parts)) parts = [parts];

    let hp: HeaderProps | undefined;
    let bp: BodyProps | undefined;
    let fp: FooterProps | undefined;

    for (let i = 0; i < parts.length; i++) {
      const c = parts[i];
      if (c.type === "header") hp = c;
      if (c.type === "body") bp = c;
      if (c.type === "footer") fp = c;
    }

    assert(hp && bp);

    return [hp, bp, fp] as const;
  });

  return (
    <div class="card">
      <div class="card-header bg-primary text-white">{evalParts()[0].text}</div>

      <div class="card-body">{evalParts()[1].children}</div>

      <Show when={evalParts()[2]}>
        {(footer) => (
          <div class="card-footer">
            <div class="d-flex gap-2 justify-content-md-end">{footer().children}</div>
          </div>
        )}
      </Show>
    </div>
  );
}

interface HeaderProps {
  text: string;
}

Card.Header = (props: HeaderProps) => {
  return <>{{ type: "header", ...props }}</>;
};

interface BodyProps {
  children: JSX.Element;
}

Card.Body = (props: BodyProps) => {
  return <>{{ type: "body", ...props }}</>;
};

interface FooterProps {
  children: JSX.Element;
}

Card.Footer = (props: FooterProps) => {
  return <>{{ type: "footer", ...props }}</>;
};
