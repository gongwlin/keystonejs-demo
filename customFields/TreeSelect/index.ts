import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  filters,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

// this field is based on the integer field
// but with validation to ensure the value is within an expected range
// and a different input in the Admin UI
// https://github.com/keystonejs/keystone/tree/main/packages/core/src/fields/types/integer

export type StarsFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique';
    maxStars?: number;
    queryPath?: string;
    createPath?: string;
  };

export const TreeSelect =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    queryPath,
    createPath,
    maxStars = 5,
    ...config
  }: StarsFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta =>
    fieldType({
      // this configures what data is stored in the database
      kind: 'scalar',
      mode: "required",
      scalar: 'String',
    })({
      ...config,
     
      hooks: {
        ...config.hooks,
      },
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].String.optional }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: graphql.arg({ type: graphql.String }),
          
          resolve(val, context) {
           return val || '';
          },
        },
        update: { arg: graphql.arg({ type: graphql.String }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      // this
      output: graphql.field({
        type: graphql.String,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        resolve({ value, item }, args, context, info) {
          return value;
        },
      }),
      views: require.resolve('./views.tsx'),
      getAdminMeta() {
        return { maxStars, queryPath, createPath };
      },
    });
