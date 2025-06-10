const { defineConfig } = require('@catpawx/commitlint-config-preset')

module.exports = defineConfig({
  prompt: {
    skipQuestions: ['scope', 'body', 'breaking', 'footer', 'footerPrefix'],
  },
})
