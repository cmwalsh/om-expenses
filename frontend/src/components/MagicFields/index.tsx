import { createEffect, For } from 'solid-js';
import * as v from 'valibot';

interface Props<TSchema extends v.ObjectSchema<any, any>, TData extends v.InferInput<TSchema>> {
  schema: TSchema;
  data: TData;
  validation: boolean;

  api: (api: MagicFormApi<TData>) => void;
  onChange: (data: TData) => void;
}

export interface MagicFormApi<TData> {
  submit: () => Promise<TData | undefined>;
}

export function MagicFields<TSchema extends v.ObjectSchema<any, any>, TData extends v.InferInput<TSchema>>(props: Props<TSchema, TData>) {
  const fieldsNames = Object.keys(props.schema.entries) as unknown as readonly (Extract<keyof TData, string>)[]

  createEffect(() => {
    props.api({
      submit: async () => {
        return undefined;
      },
    });
  });

  const getValidationMessages = (fieldName: keyof TData) => {
    if (!props.validation) return;

    const validation = v.safeParse(props.schema, props.data);
    const issues = validation.issues?.filter((i): i is v.BaseIssue<any> => 'path' in i && 'message' in i);

    return issues?.filter(i => i.path?.length === 1 && i.path[0].key === fieldName).map(i => i.message).join(' | ');
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
        const propSchema = props.schema.entries[fieldName] as v.SchemaWithPipe<Array<any> & [any]>;

        const type = propSchema.pipe.find(
          (item): item is v.BaseSchema<any, any, any> =>
            item.kind === 'schema',
        )?.type;

        const validationType = propSchema.pipe.find(
          (item): item is v.BaseValidation<any, any, any> =>
            item.kind === 'validation',
        )?.type;

        const description = propSchema.pipe.find(
          (item): item is v.DescriptionAction<string, string> =>
            item.type === 'description',
        )?.description ?? '???';

        console.log('Field', type, validationType, description);

        let inputType = 'text';

        if (validationType === 'email') {
          inputType = 'email';
        }
        if (description.toLowerCase().includes('password')) {
          inputType = 'password';
        }

        return (
          <div class="form-group">
            <label for={fieldName}>{description}</label>
            <input
              type={inputType}
              id={fieldName}
              classList={{ 'form-control': true, 'is-invalid': !!getValidationMessages(fieldName) }}
              placeholder={description}
              required
              value={props.data[fieldName]}
              on:change={e => onFieldChange(fieldName, e.currentTarget.value)}
            />
            <div class="invalid-feedback">{getValidationMessages(fieldName)}</div>
          </div>
        );
      }}
    </For>
  );
}
