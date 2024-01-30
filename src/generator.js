import { AstType, isAstType } from './parser.js'

const map = {
  Program (node) {
    const o = {}
    node.body.forEach(n => {
      if (isAstType(n, AstType.VariableDeclaration)) {
        o[n.name] = new RegExp(`${n.body.map(generator).join('')}`, n.flags)
      }
    })
    o.default = new RegExp(`${node.body.map(generator).join('')}`)
    return o
  },

  Variable (node) {
    return `${node.body.map(generator).join('')}`
  },

  Alternative (node) {
    return (node.body || []).map(generator).join('')
  },

  Char (node) {
    const value = node.value
    if (node.escaped) {
      return `\\${value}`
    }
    return value
  },

  CharacterClass (node) {
    const code = node.body.map(generator).join('')
    if (node.negative) {
      return `[^${code}]`
    }
    return `[${code}]`
  },
  ClassRange (node) {
    return `${generator(node.from)}-${generator(node.to)}`
  },

  Disjunction (node) {
    return `(?:${node.body.map(generator).join('|')})`
  },

  Group (node) {
    const code = node.body.map(generator).join('')
    if (node.name) {
      return `(?<${node.name}>${code})`
    }
    return `(${code})`
  },

  Backreference (node) {
    if (node.kind === 'number') {
      return `\\${node.reference}`
    } else if (node.kind === 'name') {
      return `\\k<${node.reference}>`
    }
  },

  Assertion (node) {
    if (['^', '$', '\\b', '\\B'].includes(node.kind)) {
      return node.kind
    } else if (node.kind === 'lookahead') {
      const body = node.body.map(generator).join('')
      if (node.negative) {
        return `(?!${body})`
      }
      return `(?=${body})`
    } else if (node.kind === 'lookbehind') {
      const body = node.body.map(generator).join('')
      if (node.negative) {
        return `(?<!${body})`
      }
      return `(?<=${body})`
    }
  },

  Repetition (node) {
    if (node.body.length === 1 && isAstType(node.body[0], AstType.Char)) {
      return `${node.body.map(generator).join('')}${generator(node.quantifier)}`
    }
    return `(?:${node.body.map(generator).join('')})${generator(node.quantifier)}`
  },

  Quantifier (node) {
    let quantifier
    const greedy = node.greedy ? '' : '?'
    if (node.from === 0 && !node.to) {
      quantifier = '*'
    } else if (node.from === 0 && node.to === 1) {
      quantifier = '?'
    } else if (node.from === 1 && !node.to) {
      quantifier = '+'
    } else if (node.from === node.to) {
      quantifier = `{${node.from}}`
    } else {
      quantifier = node.to ? `{${node.from},${node.to}}` : `{${node.from},}`
    }
    return `${quantifier}${greedy}`
  }

}

function generator (node) {
  if (node) {
    const type = node.type.toString()
    const f = map[type]
    return f ? f(node) : null
  }
}

export { generator }
