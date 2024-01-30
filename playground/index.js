require.config({
    paths: {
      vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
    }
  })

  const keywords = ['number', 'string', 'begin', 'end', 'lazy',
    'newline', 'tab', 'any', 'ignore_case', 'global', 'multiline',
    'loop', 'one_or_more', 'one_of', 'range', 'optional', 'except', 'group', 'ref',
    'followed_by', 'not_followed_by', 'preceded_by', 'not_preceded_by',
    'word', 'chinese', 'digit', 'whitespace', 'boundary',
    'non_word', 'non_digit', 'non_whitespace', 'non_boundary'
  ]

  require(['vs/editor/editor.main'], () => {
    const monaco = window.monaco
    const rexx = window.rexx

    monaco.languages.register({ id: 'rexx' })

    monaco.languages.setMonarchTokensProvider('rexx', {
      keywords,
      tokenizer: {
        root: [
          [
            /[a-z_]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'variable'
              }
            }
          ],
          [/\d/, 'digit'],
          [/'.*?'/, 'string'],
          [/".*?"/, 'string'],
          [/\/\/.*/, 'comment']
        ]
      }
    })
    monaco.languages.setLanguageConfiguration('rexx', {
      comments: {
        lineComment: '//',
        blockComment: '//'
      },
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '(', close: ')' },
        { open: '\'', close: '\'' }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '(', close: ')' },
        { open: '\'', close: '\'' }
      ],
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      folding: {
        markers: {
          start: /^\s*\/\*\s*#region\b\s*(.*?)\s*\*\//,
          end: /^\s*\/\*\s*#endregion\b.*\*\//
        }
      }
    })

    let variables = []

    function updateVariablesFromCode(code) {
      const variableRegex = /[A-Za-z_][A-Za-z0-9_]*(?=\s*=)/g
      const newVariables = code.match(variableRegex)
      if (newVariables) {
        variables = [...new Set([...variables, ...newVariables])]
      }
    }

    monaco.languages.registerCompletionItemProvider('rexx', {
      provideCompletionItems: (model, position) => {
        const keywordsSuggestions = keywords.map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword
        }))
        const variableSuggestions = variables.map(variable => ({
          label: variable,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: variable
        }))

        return { suggestions: [...keywordsSuggestions, ...variableSuggestions] }
      }
    })

    const editor = monaco.editor.create(document.getElementById('id-code-editor'), {
      value: 'one_of { range {\'a\', \'z\'} }',
      language: 'rexx',
      automaticLayout: true,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
      scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden'
        // handleMouseWheel:false,
      },
      // theme: 'vs-dark',
      tabSize: 2,
      fontSize: 14,
      lineNumbers: 'on',
      lineNumbersMinChars: 2,
      lineDecorationsWidth: 5,
      glyphMargin: false,
      folding: true,
      renderLineHighlight: 'none'
    })
    editor.onDidChangeModelContent((event) => {
      updateVariablesFromCode(editor.getValue())
    })

    const preview = monaco.editor.create(document.getElementById('id-code-preview'), {
      value: '\n{\n' + '  default: /[a-z]/,\n' + '}',
      language: 'js',
      automaticLayout: true,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
      scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden'
        // handleMouseWheel:false,
      },
      // theme: 'vs-dark',
      tabSize: 2,
      fontSize: 14,
      lineNumbers: 'on',
      lineNumbersMinChars: 2,
      lineDecorationsWidth: 5,
      glyphMargin: false,
      folding: true,
      renderLineHighlight: 'none'

    })
    document.getElementById('id-button-compile').addEventListener('click', (event) => {
      event.target.textContent = '    Compiled !     '
      setTimeout(() => {
        event.target.textContent = 'Compile'
      }, 1000)
      let result = ''
      try {
        const regexObject = rexx(editor.getValue())
        result += '\n{\n'
        Object.keys(regexObject).forEach(key => {
          const regex = regexObject[key]
          result += `\t${key}: ${regex.toString()},\n`
        })
        result += '}\n'
      } catch (e) {
        result = e.toString()
      }
      preview.setValue(result)
      preview.getAction('editor.action.formatDocument').run()
    })
  })