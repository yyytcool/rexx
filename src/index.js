import { tokenizer } from './tokenizer.js'
import { parser } from './parser.js'
import { transformer } from './transformer.js'
import { generator } from './generator.js'

const rexx = (string) => {
  const tokens = tokenizer(string)
  const ast = parser(tokens)
  const transformedAst = transformer(ast)
  const regexObject = generator(transformedAst)
  return regexObject
}

export default rexx
