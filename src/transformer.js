import { AstType, isAstType } from './parser.js'

const traverser = (ast, visitor) => {
  const traverseArray = (array, parent) => {
    for (const child of array) {
      traverseNode(child, parent)
    }
  }
  const traverseNode = (node, parent) => {
    const methods = visitor[node.type.toString()]
    if (methods && methods.enter) {
      methods.enter(node, parent)
    }

    const types = [
      AstType.Program, AstType.Alternative, AstType.OneOf, AstType.Exception,
      AstType.Group, AstType.Repetition, AstType.Variable, AstType.Disjunction,
      AstType.Assertion, AstType.CharacterClass, AstType.VariableDeclaration
    ]
    for (let i = 0; i < types.length; i++) {
      if (isAstType(node, types[i]) && node.body) {
        traverseArray(node.body, node)
      }
    }

    if (methods && methods.exit) {
      methods.exit(node, parent)
    }
  }
  traverseNode(ast, null)
}

const transformer = (ast) => {
  traverser(ast, {
    OneOf: {
      // one_of {'abc', 'def'}                abe|def
      // one_of {'a', 'b', 'c'}               [abc]           isAllChars
      // one_of {'abc'}                       [abc]           isAltWithAllChars
      // one_of {'abc', range{'d','f'}}       [abcd-f]        hasClassRange
      enter (node, parent) {
        const isAllChars = (body) => body.every(child => isAstType(child, AstType.Char))
        const isAltWithAllChars = node.body.length === 1 && isAstType(node.body[0], AstType.Alternative) && isAllChars(node.body[0].body)
        const hasClassRange = node.body.some(child => isAstType(child, AstType.ClassRange))
        node.isCharacterClass = isAllChars(node.body) || isAltWithAllChars || hasClassRange
      },
      exit (node, parent) {
        let n = null
        if (node.isCharacterClass) {
          n = {
            type: AstType.CharacterClass,
            body: [...node.body]
          }
        } else {
          n = {
            type: AstType.Disjunction,
            body: [...node.body]
          }
        }
        parent.body.splice(parent.body.indexOf(node), 1, n)
      }

    }
  })
  return ast
}

export { transformer }
