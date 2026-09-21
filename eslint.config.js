import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'app',
    vue: true,
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    jsonc: true,
    yaml: true,
    markdown: false,
    formatters: {
      css: true,
      html: true,
    },
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '.pnpm-store/**',
      '.history/**',
      'docs/**',
      'src/content/grades/**',
    ],
  },
  {
    rules: {
      // 领域层与内容包大量使用“聚合出口 + 类型再导出”，允许 barrel 文件
      'import/no-duplicates': 'off',
      // 儿童端界面文案使用中文，允许中文标点与全角符号
      'style/no-mixed-operators': 'off',
      'vue/max-attributes-per-line': ['error', { singleline: { max: 5 }, multiline: { max: 1 } }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'ts/consistent-type-definitions': ['error', 'interface'],
    },
  },
)
