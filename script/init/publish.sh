# 直接从 init.sh 复制，替换下 "build" => "publish --no-git-checks"
# 批量发布用
pnpm install

# base: 7
pnpm --filter="./packages/plugin-light-const" publish --no-git-checks
pnpm --filter="./packages/plugin-light-shared" publish --no-git-checks
pnpm --filter="./packages/plugin-light-shared-vue2" publish --no-git-checks
pnpm --filter="./packages/plugin-light-preprocess" publish --no-git-checks
pnpm --filter="./packages/plugin-light-cli" publish --no-git-checks
pnpm --filter="./packages/import-meta-resolve" publish --no-git-checks
pnpm --filter="./packages/uni-read-pages-vite" publish --no-git-checks

# cli: 1
pnpm --filter="./packages/net-cli" publish --no-git-checks

# runtime: 3
pnpm --filter="./packages/ebus-light" publish --no-git-checks
pnpm --filter="./packages/share-light" publish --no-git-checks
pnpm --filter="./packages/vconsole-helper" publish --no-git-checks

# eslint: 4
pnpm --filter="./packages/eslint-config-light" publish --no-git-checks
pnpm --filter="./packages/eslint-config-light-vue3" publish --no-git-checks
pnpm --filter="./packages/eslint-config-light-flat" publish --no-git-checks
pnpm --filter="./packages/eslint-plugin-light" publish --no-git-checks

# stylelint: 2
pnpm --filter="./packages/stylelint-config-*" publish --no-git-checks
pnpm --filter="./packages/stylelint-plugin-*" publish --no-git-checks

# plugin
pnpm --filter="./packages/webpack-loader-*" publish --no-git-checks
pnpm --filter="./packages/webpack-plugin-*" publish --no-git-checks
pnpm --filter="./packages/vite-plugin-*" publish --no-git-checks
pnpm --filter="./packages/postcss-*" publish --no-git-checks

# project config: 5
pnpm --filter="./packages/project-config-*" publish --no-git-checks

# pixui: 3
pnpm --filter="./packages/pixui-*" publish --no-git-checks

# next-admin-svr: 1
pnpm --filter="./packages/next-admin-svr" publish --no-git-checks

# *-mcp: 3
pnpm --filter="./packages/upload-mcp" publish --no-git-checks
pnpm --filter="./packages/npm-publish-mcp" publish --no-git-checks
pnpm --filter="./packages/mp-publish-mcp" publish --no-git-checks
