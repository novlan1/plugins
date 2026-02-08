pnpm install

# base: 7
pnpm --filter="./packages/plugin-light-const" build
pnpm --filter="./packages/plugin-light-shared" build
pnpm --filter="./packages/plugin-light-shared-vue2" build
pnpm --filter="./packages/plugin-light-preprocess" build
pnpm --filter="./packages/plugin-light-cli" build
pnpm --filter="./packages/import-meta-resolve" build
pnpm --filter="./packages/uni-read-pages-vite" build

# cli: 1
pnpm --filter="./packages/net-cli" build

# runtime: 3
pnpm --filter="./packages/ebus-light" build
pnpm --filter="./packages/share-light" build
pnpm --filter="./packages/vconsole-helper" build

# eslint: 4
pnpm --filter="./packages/eslint-config-light" build
pnpm --filter="./packages/eslint-config-light-vue3" build
pnpm --filter="./packages/eslint-config-light-flat" build
pnpm --filter="./packages/eslint-plugin-light" build

# stylelint: 2
pnpm --filter="./packages/stylelint-config-*" build
pnpm --filter="./packages/stylelint-plugin-*" build

# plugin
pnpm --filter="./packages/webpack-loader-*" build
pnpm --filter="./packages/webpack-plugin-*" build
pnpm --filter="./packages/vite-plugin-*" build
pnpm --filter="./packages/postcss-*" build

# project config: 5
pnpm --filter="./packages/project-config-*" build

# pixui: 3
pnpm --filter="./packages/pixui-*" build

# next-admin-svr: 1
pnpm --filter="./packages/next-admin-svr" build

# *-mcp: 3
pnpm --filter="./packages/upload-mcp" build
pnpm --filter="./packages/npm-publish-mcp" build
pnpm --filter="./packages/mp-publish-mcp" build
