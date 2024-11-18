/* eslint-disable @typescript-eslint/no-explicit-any */
import { For } from "solid-js";
import * as v from "valibot";

interface Props<TSchema extends v.ObjectSchema<any, any>, TData extends v.InferInput<TSchema>> {
  schema: TSchema;
  data: TData;
  validation: boolean;

  onChange: (data: TData) => void;
}

export function MagicFields<TSchema extends v.ObjectSchema<any, any>, TData extends v.InferInput<TSchema>>(
  props: Props<TSchema, TData>,
) {
  const _schema = props.schema;

  const fieldsNames = Object.keys(_schema.entries) as unknown as readonly Extract<keyof TData, string>[];

  const getValidationMessages = (fieldName: keyof TData) => {
    if (!props.validation) return;

    const validation = v.safeParse(_schema, props.data);
    const issues = validation.issues?.filter((i): i is v.BaseIssue<any> => "path" in i && "message" in i);

    return issues
      ?.filter((i) => i.path?.length === 1 && i.path[0].key === fieldName)
      .map((i) => i.message)
      .join(" | ");
  };

  const onFieldChange = (fieldName: Extract<keyof TData, string>, value: string) => {
    props.onChange({
      ...props.data,
      [fieldName]: value,
    });
  };

  return (
    <For each={fieldsNames}>
      {(fieldName) => {
        const maybePropSchema = _schema.entries[fieldName];

        const propSchema =
          "wrapped" in maybePropSchema
            ? (maybePropSchema.wrapped as v.SchemaWithPipe<Array<any> & [any]>)
            : (maybePropSchema as v.SchemaWithPipe<Array<any> & [any]>);

        const type = propSchema.pipe.find((item): item is v.BaseSchema<any, any, any> => item.kind === "schema")?.type;

        const validationType = propSchema.pipe.find(
          (item): item is v.BaseValidation<any, any, any> => item.kind === "validation",
        )?.type;

        const title =
          propSchema.pipe.find((item): item is v.TitleAction<string, string> => item.type === "title")?.title ?? "???";

        const description =
          propSchema.pipe.find((item): item is v.DescriptionAction<string, string> => item.type === "description")
            ?.description ?? title;

        let inputType = "text";

        if (validationType === "email") {
          inputType = "email";
        }
        if (title.toLowerCase().includes("password")) {
          inputType = "password";
        }

        const value = props.data[fieldName];
        console.log(title, value);

        return (
          <div class="form-group">
            <label for={fieldName}>{title}</label>
            <input
              type={inputType}
              id={fieldName}
              classList={{ "form-control": true, "is-invalid": !!getValidationMessages(fieldName) }}
              placeholder={description}
              required
              value={typeof value === "string" ? value : ""}
              autocomplete={inputType === "password" ? "new-password" : "off"}
              on:change={(e) => onFieldChange(fieldName, e.currentTarget.value)}
            />
            <div class="invalid-feedback">{getValidationMessages(fieldName)}</div>
          </div>
        );
      }}
    </For>
  );
}
