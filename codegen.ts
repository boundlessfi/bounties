// Codegen reads the canonical schema from ../boundless-nestjs/src/schema.gql
// If you need a local copy in this repo, run: `npm run sync-schema`
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../boundless-nestjs/src/schema.gql",
  documents: [
    "lib/graphql/operations/**/*.graphql",
    "lib/graphql/operations/**/*.ts",
    "lib/graphql/operations/**/*.tsx",
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
        reactQueryVersion: 5,
        scalars: {
          DateTime: "string",
          JSON: "Record<string, any>",
        },
      },
    },
  },
};

export default config;
