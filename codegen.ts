import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../boundless-nestjs/src/schema.gql",
  documents: [
    "lib/graphql/**/*.ts",
    "lib/graphql/**/*.tsx",
    "hooks/**/*.ts",
    "hooks/**/*.tsx",
  ],
  ignoreNoDocuments: true,
  generates: {
    "./lib/graphql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-query",
      ],
      config: {
        fetcher: {
          func: "./client#fetcher",
          isReactHook: false,
        },
        exposeQueryKeys: true,
        scalars: {
          DateTime: "string",
          JSON: "Record<string, any>",
        },
      },
    },
  },
};

export default config;
