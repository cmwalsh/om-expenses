/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityType, FieldMetadata, humanise } from "common";
import { For } from "solid-js";
import * as v from "valibot";
import { FormFields } from "../FormFields";
import { LookupInput } from "../LookupInput";
import { Select, SelectOption } from "../Select";
import { TextInput } from "../TextInput";

interface Props<TSchema extends v.ObjectSchema<any, any>, TData extends v.InferInput<TSchema>> {
  schema: TSchema;
  data: TData;
  validation: boolean;

  onChange: (data: TData) => void;
}

export function MagicFields<
  TSchema extends v.ObjectSchema<any, any>,
  TData extends v.InferInput<v.SchemaWithPartial<TSchema, undefined>>,
>(props: Props<TSchema, TData>) {
  const _schema = props.schema;

  const fieldsNames = Object.keys(_schema.entries) as unknown as readonly Extract<keyof TData, string>[];

  const getValidationMessages = (fieldName: keyof TData) => {
    if (!props.validation) return [];

    const validation = v.safeParse(_schema, props.data);
    const issues = validation.issues?.filter((i): i is v.BaseIssue<any> => "path" in i && "message" in i);

    return issues?.filter((i) => i.path?.length === 1 && i.path[0].key === fieldName).map((i) => i.message) ?? [];
  };

  const onFieldChange = (fieldName: Extract<keyof TData, string>, value: string | undefined | null) => {
    props.onChange({
      ...props.data,
      [fieldName]: value,
    });
  };

  return (
    <FormFields>
      <For each={fieldsNames}>
        {(fieldName) => {
          const { metadata, title, inputType, options, description, entityType } = getFieldInfo(_schema, fieldName);

          const value = () => props.data[fieldName];

          return (
            <FormFields.Field
              id={fieldName}
              title={title}
              description={description}
              icon={metadata?.icon}
              messages={getValidationMessages(fieldName)}
            >
              {inputType === "text" || inputType === "email" || inputType === "password" ? (
                <TextInput
                  type={inputType}
                  id={fieldName}
                  isInvalid={getValidationMessages(fieldName).length > 0}
                  placeholder={title}
                  value={typeof value() === "string" ? value() : undefined}
                  onChange={(v) => onFieldChange(fieldName, v)}
                />
              ) : inputType === "select" ? (
                <Select
                  id={fieldName}
                  isInvalid={getValidationMessages(fieldName).length > 0}
                  placeholder={title}
                  value={value()}
                  options={options}
                  allowNull={true}
                  onChange={(v) => onFieldChange(fieldName, v)}
                />
              ) : inputType === "lookup" ? (
                <LookupInput
                  id={fieldName}
                  isInvalid={getValidationMessages(fieldName).length > 0}
                  placeholder={title}
                  entityType={entityType!}
                  value={typeof value() === "string" ? value() : undefined}
                  onChange={(v) => onFieldChange(fieldName, v)}
                />
              ) : (
                inputType
              )}
            </FormFields.Field>
          );
        }}
      </For>
    </FormFields>
  );
}

function getFieldInfo(formSchema: v.ObjectSchema<any, any>, fieldName: string) {
  const maybePropSchema = formSchema.entries[fieldName] as
    | v.NullableSchema<any, any>
    | v.SchemaWithPipe<Array<any> & [any]>;

  const propSchema =
    "wrapped" in maybePropSchema ? (maybePropSchema.wrapped as v.SchemaWithPipe<Array<any> & [any]>) : maybePropSchema;

  const vSchema = propSchema.pipe.find((item): item is v.BaseSchema<any, any, any> => item.kind === "schema");

  const type = vSchema?.type;

  const validationType = propSchema.pipe.find(
    (item): item is v.BaseValidation<any, any, any> => item.kind === "validation",
  )?.type;

  const title =
    propSchema.pipe.find((item): item is v.TitleAction<string, string> => item.type === "title")?.title ?? "???";

  const description = propSchema.pipe.find(
    (item): item is v.DescriptionAction<string, string> => item.type === "description",
  )?.description;

  const metadata = propSchema.pipe.find(
    (item): item is v.MetadataAction<string, FieldMetadata> => item.type === "metadata",
  )?.metadata;

  let inputType: "text" | "select" | "email" | "password" | "lookup" = "text";

  let options: SelectOption[] = [];

  let entityType: EntityType | undefined;

  if (metadata?.lookup) {
    inputType = "lookup";
    entityType = metadata.lookup;
  } else if (type === "picklist") {
    inputType = "select";

    options = (vSchema as v.PicklistSchema<any, any>).options.map((o: string) => ({
      value: o,
      text: humanise(o),
    }));
  } else {
    if (validationType === "email") {
      inputType = "email";
    }
    if (title.toLowerCase().includes("password")) {
      inputType = "password";
    }
  }

  return { metadata, title, inputType, options, description, entityType };
}
