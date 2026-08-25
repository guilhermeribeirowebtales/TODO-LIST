const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const { defaultFieldResolver } = require('graphql');
const { format, parseISO } = require('date-fns');

function dateDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const dateDirective = getDirective(schema, fieldConfig, 'date')?.[0];

      if (dateDirective) {
        const { format: dateFormat } = dateDirective;
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = async (source, args, context, info) => {
          const result = await resolve(source, args, context, info);

          if (!result) return null;

          const date = result instanceof Date ? result : parseISO(result);

          return format(date, dateFormat);
        };

        return fieldConfig;
      }
    },
  });
}

module.exports = dateDirectiveTransformer;
