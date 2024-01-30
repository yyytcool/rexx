import { tokenizer } from '../src/tokenizer.js'
import { AstType, parser } from '../src/parser.js'

describe('Parser Tests', () => {
  test('Parses string', () => {
    const tokens = tokenizer('\'abc\'')
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Alternative,
          body: [
            {
              type: AstType.Char,
              value: 'a',
              kind: 'simple',
              escaped: false
            },
            {
              type: AstType.Char,
              value: 'b',
              kind: 'simple',
              escaped: false
            },
            {
              type: AstType.Char,
              value: 'c',
              kind: 'simple',
              escaped: false
            }
          ]
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })
  test('Parses undefined variable', () => {
    const tokens = tokenizer('var1')
    expect(() => parser(tokens)).toThrow(TypeError)
  })
  test('Parses variable', () => {
    const tokens = tokenizer(`
        var1 = {}
        var1
         `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.VariableDeclaration,
          name: 'var1',
          flags: '',
          body: []
        },
        {
          type: AstType.Variable,
          name: 'var1',
          body: []
        }

      ]
    }
    expect(ast).toEqual(expectedAst)
  })
  test('Parses loop', () => {
    const tokens = tokenizer(`
        loop (1..) {
            loop(2) {
                loop(2..3) {'reg'}
            }
        } lazy
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Repetition,
          quantifier: {
            type: AstType.Quantifier,
            kind: 'Range',
            greedy: false,
            from: 1
          },
          body: [
            {
              type: AstType.Repetition,
              quantifier: {
                type: AstType.Quantifier,
                kind: 'Range',
                greedy: true,
                from: 2,
                to: 2
              },
              body: [
                {
                  type: AstType.Repetition,
                  quantifier: {
                    type: AstType.Quantifier,
                    kind: 'Range',
                    greedy: true,
                    from: 2,
                    to: 3
                  },
                  body: [
                    {
                      type: AstType.Alternative,
                      body: [
                        {
                          type: AstType.Char,
                          value: 'r',
                          kind: 'simple',
                          escaped: false
                        },
                        {
                          type: AstType.Char,
                          value: 'e',
                          kind: 'simple',
                          escaped: false
                        },
                        {
                          type: AstType.Char,
                          value: 'g',
                          kind: 'simple',
                          escaped: false
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }

    expect(ast).toEqual(expectedAst)
  })

  test('Parses optional', () => {
    const tokens = tokenizer(`
        optional {
            12
        }
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Repetition,
          quantifier: {
            type: AstType.Quantifier,
            kind: 'Range',
            from: 0,
            to: 1,
            greedy: true
          },
          body: [
            {
              type: AstType.Alternative,
              body: [
                {
                  type: AstType.Char,
                  value: '1',
                  kind: 'simple',
                  escaped: false
                },
                {
                  type: AstType.Char,
                  value: '2',
                  kind: 'simple',
                  escaped: false
                }
              ]
            }
          ]
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })

  test('Parses one_or_more', () => {
    const tokens = tokenizer(`
        one_or_more {
            12
        }
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Repetition,
          quantifier: {
            type: AstType.Quantifier,
            kind: 'Range',
            from: 1,
            greedy: true
          },
          body: [
            {
              type: AstType.Alternative,
              body: [
                {
                  type: AstType.Char,
                  value: '1',
                  kind: 'simple',
                  escaped: false
                },
                {
                  type: AstType.Char,
                  value: '2',
                  kind: 'simple',
                  escaped: false
                }
              ]
            }
          ]
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })

  test('Parses one_of and range', () => {
    const tokens = tokenizer(`
        one_of {
            range {'a', 'z'}
            range {'A', 'Z'}
        }
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.OneOf,
          body: [
            {
              type: AstType.ClassRange,
              from: {
                type: AstType.Char,
                value: 'a',
                kind: 'simple',
                escaped: false
              },
              to: {
                type: AstType.Char,
                value: 'z',
                kind: 'simple',
                escaped: false
              }
            },
            {
              type: AstType.ClassRange,
              from: {
                type: AstType.Char,
                value: 'A',
                kind: 'simple',
                escaped: false
              },
              to: {
                type: AstType.Char,
                value: 'Z',
                kind: 'simple',
                escaped: false
              }
            }
          ]
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })

  test('Parses except', () => {
    const tokens = tokenizer(`
        except {',./'}
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.CharacterClass,
          negative: true,
          body: [
            {
              type: AstType.Alternative,
              body: [
                {
                  type: AstType.Char,
                  value: ',',
                  kind: 'simple',
                  escaped: false
                },
                {
                  type: AstType.Char,
                  value: '.',
                  kind: 'simple',
                  escaped: true
                },
                {
                  type: AstType.Char,
                  value: '/',
                  kind: 'simple',
                  escaped: true
                }
              ]
            }
          ]
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })

  test('Parses group', () => {
    const tokens = tokenizer(`
        group { word }
        group('c1') {chinese}
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Group,
          capturing: true,
          body: [
            {
              type: AstType.Char,
              value: '\\w',
              kind: 'meta'
            }
          ]
        },
        {
          type: AstType.Group,
          capturing: true,
          body: [
            {
              type: AstType.CharacterClass,
              body: [
                {
                  type: AstType.ClassRange,
                  from: {
                    type: AstType.Char,
                    value: '\\u4e00',
                    kind: 'unicode'
                  },
                  to: {
                    type: AstType.Char,
                    value: '\\u9fa5',
                    kind: 'unicode'
                  }
                }
              ]
            }
          ],
          name: 'c1'
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })

  test('Parses ref', () => {
    const tokens = tokenizer(`
        ref{1}
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Backreference,
          kind: 'number',
          reference: 1
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })

  test('Parses lookahead assertion and unicode', () => {
    const tokens = tokenizer(`
         {followed_by {'\\w', '\\u4e00'}}
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Alternative,
          body: [
            {
              type: AstType.Assertion,
              kind: 'lookahead',
              body: [
                {
                  type: AstType.Char,
                  value: '\\w',
                  kind: 'meta'
                },
                {
                  type: AstType.Char,
                  value: '\\u4e00',
                  kind: 'unicode'
                }
              ]
            }
          ]
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })

  test('Parses assertion and flag', () => {
    const tokens = tokenizer(`
        var2 = {
        begin
            1
        end
        }global
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.VariableDeclaration,
          name: 'var2',
          flags: 'g',
          body: [
            {
              type: AstType.Assertion,
              kind: '^'
            },
            {
              type: AstType.Char,
              value: '1',
              kind: 'simple',
              escaped: false
            },
            {
              type: AstType.Assertion,
              kind: '$'
            }
          ]
        }
      ]
    }
    expect(ast).toEqual(expectedAst)
  })

  test('Parses hex and control character', () => {
    const tokens = tokenizer(`
        group {'\\xff', '\\cf'}
    `)
    const ast = parser(tokens)
    const expectedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Group,
          capturing: true,
          body: [
            {
              type: AstType.Char,
              value: '\\xff',
              kind: 'hex'
            },
            {
              type: AstType.Char,
              value: '\\cf',
              kind: 'control'
            }
          ]
        }
      ]
    }

    expect(ast).toEqual(expectedAst)
  })

  test('Throws error on unexpected token 1', () => {
    const tokens = tokenizer('....')
    expect(() => parser(tokens)).toThrow(TypeError)
  })

  test('Throws error on unexpected token 2', () => {
    const tokens = tokenizer('one_of (\'a\')')
    expect(() => parser(tokens)).toThrow(TypeError)
  })
})
