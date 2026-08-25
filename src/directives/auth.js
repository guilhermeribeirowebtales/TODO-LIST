const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const { defaultFieldResolver, GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

function authDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];

      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = async (source, args, context, info) => {
          const token = context.token;

          if (!token) {
            throw new GraphQLError('Authentication required', {
              extensions: { code: 'UNAUTHENTICATED' },
            });
          }

          // Remove "Bearer " prefix if present
          const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

          // Decode the token (issued by external service)
          const decoded = jwt.decode(cleanToken);

          if (!decoded) {
            throw new GraphQLError('Invalid or expired token', {
              extensions: { code: 'UNAUTHENTICATED' },
            });
          }

          // Attach decoded user to context for downstream use
          context.user = decoded;

          return resolve(source, args, context, info);
        };

        return fieldConfig;
      }
    },
  });
}

module.exports = authDirectiveTransformer;
