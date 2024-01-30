import { tokenizer } from '../src/tokenizer.js'
import { parser } from '../src/parser.js'
import { transformer } from '../src/transformer.js'
import { generator } from '../src/generator.js'

describe('Generator Tests', () => {
  test('Generator Alternative', () => {
    const tokens = tokenizer(`
        'ab'
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({ default: /ab/ })
  })

  test('Generator Disjunction', () => {
    const tokens = tokenizer(`
        one_of {'abc', '123'}
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({ default: /(?:abc|123)/ })
  })

  test('Generator Group', () => {
    const tokens = tokenizer(`
        {
        group {'abc'}
        group ('g2') {'123'}
        }
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({ default: /(abc)(?<g2>123)/ })
  })

  test('Generator Backreference', () => {
    const tokens = tokenizer(`
        {
            group {123}
            group ('a') {456}
            ref{1}
            ref{'a'}
        }
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({ default: /(123)(?<a>456)\1\k<a>/ })
  })

  test('Generator Assertion', () => {
    const tokens = tokenizer(`
        {
            followed_by { '.jpg' }
            not_followed_by { '.png' }
            preceded_by { 'foo' }
            not_preceded_by { 'bar' }
        }
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({ default: /(?=\.jpg)(?!\.png)(?<=foo)(?<!bar)/ })
  })

  test('Generator Assertion', () => {
    const tokens = tokenizer(`
        {
            begin
            loop(1..) {except{word}}
            end
        }
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({ default: /^(?:[^\w])+$/ })
  })

  test('Generator Loop', () => {
    const tokens = tokenizer(`
        {
            loop(0..1){word}
            loop(0..){non_word}
            loop(1..){digit}
            loop(2){'l',loop(2..3){'o'}, 'p'}
        }
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({ default: /\w?\W*\d+(?:lo{2,3}p){2}/ })
  })

  test('Generator CharacterClass', () => {
    const tokens = tokenizer(`
        {
            one_of {'a','b','c'}
            except {'a'}
            one_of {range {0,9}}
            one_of {range {'a', 'z'} ,range{'A', 'Z'}}
            one_of {range {'a', 'z'}, '_@' ,range{'A', 'Z'}}
            except {range {'a', 'z'}}
            except {range {'a', 'z'}, '_@',range {'A', 'Z'}}
        }
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({ default: /[abc][^a][0-9][a-zA-Z][a-z_@A-Z][^a-z][^a-z_@A-Z]/ })
  })

  test('Generator Variable and Char', () => {
    const tokens = tokenizer(`
        var1 = {
            '.', '\\w', '\\uffff'
        }
        var2 = {
            var1,',',var1
        }
        `)
    const ast = parser(tokens)
    const transformedAst = transformer(ast)
    const regexObject = generator(transformedAst)
    expect(regexObject).toEqual({
      default: /(?:)/,
      var1: /\.\w\uffff/,
      var2: /\.\w\uffff,\.\w\uffff/
    })
  })
})
