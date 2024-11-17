import { children, createMemo, JSX } from "solid-js";
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

  const evalComponents = createMemo(() => {
    let conds = components();
    if (!Array.isArray(conds)) conds = [conds];

    let hp: HeaderProps | undefined;
    let bp: BodyProps | undefined;
    let fp: FooterProps | undefined;

    for (let i = 0; i < conds.length; i++) {
      const c = conds[i];
      if (c.type === "header") hp = c;
      if (c.type === "body") bp = c;
      if (c.type === "footer") fp = c;
    }

    assert(hp && bp && fp);

    return [hp, bp, fp] as const;
  });

  return (
    <div class="card">
      <div class="card-header bg-primary text-white">{evalComponents()[0].text}</div>
      <div class="card-body">{evalComponents()[1].children}</div>
      <div class="card-footer">
        <div class="d-grid gap-2 justify-content-md-end">{evalComponents()[2].children}</div>
      </div>
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
