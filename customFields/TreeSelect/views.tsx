import React from 'react';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';

import {
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types';
import { TreeSelect } from './tree-select';

// this is the component shown in the create modal and item page
export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer as="fieldset">
    <FieldLabel as="legend">{field.label}</FieldLabel>
    <TreeSelect maxStars={field.maxStars} onChange={onChange} value={value} autoFocus={autoFocus} queryPath={field.queryPath} field={field} />
  </FieldContainer>
);

export const controller = (
  // the type parameter here needs to align with what is returned from `getAdminMeta`
  // in the server-side portion of the field type
  config: FieldControllerConfig<{ maxStars: number, queryPath: string }>
): FieldController<number | null, string> & { maxStars: number, queryPath: string } => {

  return {
    createPath: config.fieldMeta.createPath,
    queryPath: config.fieldMeta.queryPath,
    maxStars: config.fieldMeta.maxStars,
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: data => {
      const value = data[config.path];
      return typeof value === 'string' ? value : null;
    },
    serialize: value => ({ [config.path]: value }),
    filter: {
      Filter(props) {
        return (
          <TextInput
            type="text"
            onChange={event => {
              props.onChange(event.target.value);
            }}
            value={props.value}
            autoFocus={props.autoFocus}
          />
        );
      },

      graphql: ({ type, value }) => {
        const key = type === 'is' ? config.path : `${config.path}_${type}`;
        const valueWithoutWhitespace = value.replace(/\s/g, '');
        return {
          [key]: ['in', 'not_in'].includes(type)
            ? valueWithoutWhitespace.split(',').map(i => parseInt(i))
            : parseInt(valueWithoutWhitespace),
        };
      },
      Label({ label, value, type }) {
        let renderedValue = value;
        if (['in', 'not_in'].includes(type)) {
          renderedValue = value
            .split(',')
            .map(value => value.trim())
            .join(', ');
        }
        return `${label.toLowerCase()}: ${renderedValue}`;
      },
    },
  };
};
