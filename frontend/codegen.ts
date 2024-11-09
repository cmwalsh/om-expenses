import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:3000/api/graphql',
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    'src/lib/gql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        rawRequest: true,
        extensionsType: 'unknown',
      },
    },
  },
};

export default config;
