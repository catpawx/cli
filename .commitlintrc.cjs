// .commitlintrc.js
const packagesScopesLint = [
  // 'eslint-config-preset',
]
const packagesScopes = [
  // {
  //   value: 'eslint-config-preset',
  //   name: 'eslint-config-preset                   eslint 预制规则',
  // },
]

module.exports = {
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules

    // [2, "always", scopes]
    // level 校验等级 0 禁用 1 警告 2 错误
    // applicable 规则匹配模式   always 正匹配  nerver 反匹配
    // value 参数值

    /**
     * type[scope]: [function] description
     * ^^^^
     */
    // type 可选值 例如: [ 'feat', 'fix' ]
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'revert',
        'chore',
      ],
    ],
    /**
     * type[scope]: [function] description
     *      ^^^^^
     */
    'scope-enum': [
      2,
      'always',
      [
        ...packagesScopesLint,
        'docs',
        'examples',
        'scripts',
        'templates',
        '.husky',
        '.vscode',
        'other',
      ],
    ], //scope 可选值
    /**
     * type[scope]: [function] description
     *
     * ^^^^^^^^^^^^^^ empty line.
     * - Something here
     */
    'body-leading-blank': [1, 'always'], //body 开头空行
    /**
     * type[scope]: [function] description
     *
     * - something here
     *
     * ^^^^^^^^^^^^^^
     */
    'footer-leading-blank': [1, 'always'], //footer 开头空行
    /**
     * type[scope]: [function] description [No more than 72 characters]
     *      ^^^^^
     */
    'header-max-length': [2, 'always', 100], //header 最大长度
    'type-case': [2, 'always', 'lower-case'], //type 单词格式
    'type-empty': [2, 'never'], //type不能为空
    'scope-case': [2, 'always', 'lower-case'], //scope 单词格式
    // "scope-empty": [2, "never"], //scope不能为空
    'subject-case': [
      1,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ], //subject 单词格式
    'subject-empty': [2, 'never'], //subject 是否为空
    'subject-min-length': [2, 'never', 5], //subject 至少5个字
    'subject-full-stop': [2, 'never', '.'], //subject 中止符
  },
  prompt: {
    alias: { fd: 'docs: fix typos' },
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixsSelect: '选择关联issue前缀（可选）:',
      customFooterPrefixs: '输入自定义issue前缀 :',
      footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      confirmCommit: '是否提交或修改commit ?',
    },
    types: [
      { value: 'feat', name: 'feat:     新增功能 | A new feature' },
      { value: 'fix', name: 'fix:      修复缺陷 | A bug fix' },
      {
        value: 'docs',
        name: 'docs:     文档更新 | Documentation only changes',
      },
      {
        value: 'style',
        name: 'style:    代码格式 | Changes that do not affect the meaning of the code',
      },
      {
        value: 'refactor',
        name: 'refactor: 代码重构 | A code change that neither fixes a bug nor adds a feature',
      },
      {
        value: 'perf',
        name: 'perf:     性能提升 | A code change that improves performance',
      },
      {
        value: 'test',
        name: 'test:     测试相关 | Adding missing tests or correcting existing tests',
      },
      {
        value: 'build',
        name: 'build:    构建相关 | Changes that affect the build system or external dependencies',
      },
      { value: 'revert', name: 'revert:   回退代码 | Revert to a commit' },
      {
        value: 'chore',
        name: 'chore:    其他修改 | Other changes that do not modify src or test files',
      },
    ],
    useEmoji: false,
    emojiAlign: 'center',
    themeColorCode: '',
    scopes: [...packagesScopes],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixs: [
      // 如果使用 gitee 作为开发管理
      { value: 'link', name: 'link:     链接 ISSUES 进行中' },
      { value: 'closed', name: 'closed:   标记 ISSUES 已完成' },
    ],
    customIssuePrefixsAlign: 'top',
    emptyIssuePrefixsAlias: 'skip',
    customIssuePrefixsAlias: 'custom',
    allowCustomIssuePrefixs: true,
    allowEmptyIssuePrefixs: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
}
