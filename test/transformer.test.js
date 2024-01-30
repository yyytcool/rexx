import { tokenizer } from '../src/tokenizer.js'
import { AstType, parser } from '../src/parser.js'
import { transformer } from '../src/transformer.js'

describe('Transformer Tests', () => {
  test('Transformer one_of char children', () => {
    const tokens = tokenizer(`
        one_of {1, 2}
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const expectedTransformedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.CharacterClass,
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
    expect(transformedAst).toEqual(expectedTransformedAst)
  })

  test('Transformer one_of other children', () => {
    const tokens = tokenizer(`
        one_of { loop (2..) {'a'}, group {'b'}}
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const expectedTransformedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Disjunction,
          body: [
            {
              type: AstType.Repetition,
              quantifier: {
                type: AstType.Quantifier,
                kind: 'Range',
                greedy: true,
                from: 2
              },
              body: [
                {
                  type: AstType.Char,
                  value: 'a',
                  kind: 'simple',
                  escaped: false
                }
              ]
            },
            {
              type: AstType.Group,
              capturing: true,
              body: [
                {
                  type: AstType.Char,
                  value: 'b',
                  kind: 'simple',
                  escaped: false
                }
              ]
            }
          ]
        }
      ]
    }

    expect(transformedAst).toEqual(expectedTransformedAst)
  })

  test('Transformer one_of char and other children', () => {
    const tokens = tokenizer(`
        one_of {'a', one_of {'b', 'c'}}
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const expectedTransformedAst = {
      type: AstType.Program,
      body: [
        {
          type: AstType.Disjunction,
          body: [
            {
              type: AstType.Char,
              value: 'a',
              kind: 'simple',
              escaped: false
            },
            {
              type: AstType.CharacterClass,
              body: [
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
      ]
    }

    expect(transformedAst).toEqual(expectedTransformedAst)
  })
})
