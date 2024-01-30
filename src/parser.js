import { isType, checkType, Type } from './tokenizer.js'

class AstType {
  static Program = new AstType('Program')
  static Alternative = new AstType('Alternative')
  static Assertion = new AstType('Assertion')
  static Char = new AstType('Char')
  static CharacterClass = new AstType('CharacterClass')
  static ClassRange = new AstType('ClassRange')
  static Disjunction = new AstType('Disjunction')
  static Exception = new AstType('Exception')
  static Group = new AstType('Group')
  static Backreference = new AstType('Backreference')
  static Repetition = new AstType('Repetition')
  static OneOf = new AstType('OneOf')
  static Quantifier = new AstType('Quantifier')
  static Variable = new AstType('Variable')
  static VariableDeclaration = new AstType('VariableDeclaration')

  constructor (name) {
    this.name = name
  }

  toString () {
    return `${this.name}`
  }
}

const isAstType = (node, type) => {
  return node.type.name === type.name
}

const parser = (tokens) => {
  let i = 0
  const variableMap = {}

  const parseNumber = (tokens) => {
    const number = tokens[i].value
    let node = {}
    if (number.length === 1) {
      node = {
        type: AstType.Char,
        value: number,
        kind: 'simple',
        escaped: false
      }
    } else {
      node = {
        type: AstType.Alternative,
        body: []
      }
      for (const n of number) {
        node.body.push({
          type: AstType.Char,
          value: n,
          kind: 'simple',
          escaped: false
        })
      }
    }
    ++i
    return node
  }
  const parseString = (tokens) => {
    const string = tokens[i].value
    let node = {}

    if (string.length === 1) {
      node = {
        type: AstType.Char,
        value: string,
        kind: 'simple',
        escaped: '/.:?*+|^$[](){}\\='.includes(string)
      }
    } else {
      if (string.startsWith('\\')) {
        if (string.length === 6 && string[1] === 'u') {
          node = {
            type: AstType.Char,
            value: string,
            kind: 'unicode'
          }
        } else if (string.length === 4 && string[1] === 'x') {
          node = {
            type: AstType.Char,
            value: string,
            kind: 'hex'
          }
        } else if (string.length === 3 && string[1] === 'c') {
          node = {
            type: AstType.Char,
            value: string,
            kind: 'control'
          }
        } else {
          node = {
            type: AstType.Char,
            value: string,
            kind: 'meta'
          }
        }
      } else {
        node = {
          type: AstType.Alternative,
          body: []
        }
        for (const s of string) {
          node.body.push({
            type: AstType.Char,
            value: s,
            kind: 'simple',
            escaped: '/.:?*+|^$[](){}\\='.includes(s)
          })
        }
      }
    }
    ++i
    return node
  }
  const parseVariable = (tokens) => {
    const name = tokens[i].value
    let flags = ''
    let token = tokens[++i]
    if (isType(token, Type.assign)) {
      const body = parseBraceContent(tokens)
      token = tokens[i]
      while (isType(token, Type.keyword) && ['ignore_case', 'global', 'multiline'].includes(token.value)) {
        flags += token.value.slice(0, 1)
        token = tokens[++i]
      }
      const node = {
        type: AstType.VariableDeclaration,
        name,
        flags,
        body
      }
      variableMap[name] = node
      return node
    } else {
      if (variableMap[name] == null) {
        throw new TypeError('Unknown variable is: ' + name)
      }
      const node = {
        type: AstType.Variable,
        name,
        body: variableMap[name].body
      }
      return node
    }
  }

  const parseSpecialKeywords = (tokens) => {
    let node = null
    const value = tokens[i].value
    if (['word', 'digit', 'whitespace', 'non_word', 'non_digit', 'non_whitespace', 'newline', 'tab', 'any'].includes(value)) {
      const map = {
        word: '\\w',
        digit: '\\d',
        whitespace: '\\s',
        non_word: '\\W',
        non_digit: '\\D',
        non_whitespace: '\\S',
        newline: '\\n',
        tab: '\\t',
        any: '.'
      }
      ++i
      node = {
        type: AstType.Char,
        value: map[value],
        kind: 'meta'
      }
    } else if (value === 'chinese') {
      node = {
        type: AstType.CharacterClass,
        body: [{
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
        }]
      }
      ++i
    } else if (['boundary', 'non_boundary', 'begin', 'end'].includes(value)) {
      const map = {
        boundary: '\\b',
        non_boundary: '\\B',
        begin: '^',
        end: '$'
      }
      node = {
        type: AstType.Assertion,
        kind: map[value]
      }
      ++i
    }
    return node
  }

  const parseLook = (tokens) => {
    const value = tokens[i].value
    const node = {
      type: AstType.Assertion
    }
    if (value === 'followed_by') {
      node.kind = 'lookahead'
    } else if (value === 'not_followed_by') {
      node.kind = 'lookahead'
      node.negative = true
    } else if (value === 'preceded_by') {
      node.kind = 'lookbehind'
    } else if (value === 'not_preceded_by') {
      node.kind = 'lookbehind'
      node.negative = true
    }
    node.body = parseBraceContent(tokens)
    return node
  }
  const parseOptional = (tokens) => {
    const node = {
      type: AstType.Repetition,
      quantifier: {
        type: AstType.Quantifier,
        kind: 'Range',
        from: 0,
        to: 1,
        greedy: true
      },
      body: null
    }
    node.body = parseBraceContent(tokens)
    return node
  }

  const parseOneOrMore = (tokens) => {
    const node = {
      type: AstType.Repetition,
      quantifier: {
        type: AstType.Quantifier,
        kind: 'Range',
        from: 1,
        greedy: true
      },
      body: null
    }
    node.body = parseBraceContent(tokens)
    return node
  }

  const parseOneOf = (tokens) => {
    const node = {
      type: AstType.OneOf,
      body: null
    }
    node.body = parseBraceContent(tokens)
    return node
  }

  const parseBraceContent = (tokens) => {
    checkType(tokens[++i], Type.braceLeft)
    let token = tokens[++i]
    const body = []
    while (!isType(token, Type.braceRight)) {
      if (isType(token, Type.comma)) {
        ++i
      } else {
        body.push(walk())
      }
      token = tokens[i]
    }
    checkType(tokens[i], Type.braceRight)
    ++i
    return body
  }

  const parseRange = (tokens) => {
    const node = {
      type: AstType.ClassRange
    }
    checkType(tokens[++i], Type.braceLeft)
    checkType(tokens[++i], Type.string, Type.number)
    node.from = parseString(tokens)
    checkType(tokens[i], Type.comma)
    checkType(tokens[++i], Type.string, Type.number)
    node.to = parseString(tokens)
    checkType(tokens[i], Type.braceRight)
    ++i
    return node
  }

  const parseExcept = (tokens) => {
    const node = {
      type: AstType.CharacterClass,
      negative: true,
      body: []
    }
    node.body = parseBraceContent(tokens)
    return node
  }
  const parseLoop = (tokens) => {
    const node = {
      type: AstType.Repetition,
      quantifier: {
        type: AstType.Quantifier,
        kind: 'Range',
        greedy: true
      },
      body: []
    }
    checkType(tokens[++i], Type.parenthesesLeft)
    checkType(tokens[++i], Type.number, Type.string)
    let token = tokens[i]
    node.quantifier.from = Number(token.value)
    token = tokens[++i]
    if (isType(token, Type.point)) {
      checkType(tokens[++i], Type.point)
      token = tokens[++i]
      if (isType(token, Type.number)) {
        ++i
        node.quantifier.to = Number(token.value)
      }
    } else {
      node.quantifier.to = node.quantifier.from
    }
    checkType(tokens[i], Type.parenthesesRight)
    node.body = parseBraceContent(tokens)
    token = tokens[i]
    if (isType(token, Type.keyword) && token.value === 'lazy') {
      node.quantifier.greedy = false
      ++i
    }
    return node
  }

  const parseGroup = (tokens) => {
    const node = {
      type: AstType.Group,
      capturing: true,
      body: []
    }
    let token = tokens[++i]
    if (isType(token, Type.parenthesesLeft)) {
      node.name = tokens[++i].value
      i += 2
    }
    token = tokens[++i]
    while (!isType(token, Type.braceRight)) {
      if (isType(token, Type.comma)) {
        ++i
      } else {
        node.body.push(walk())
      }
      token = tokens[i]
    }
    ++i
    return node
  }

  const parseRef = (tokens) => {
    const node = {
      type: AstType.Backreference,
      kind: 'name'
    }
    checkType(tokens[++i], Type.braceLeft)
    let reference = tokens[++i].value
    checkType(tokens[++i], Type.braceRight)
    if (!isNaN(reference)) {
      node.kind = 'number'
      reference = Number(reference)
    }
    node.reference = reference
    ++i
    return node
  }

  const walk = () => {
    const token = tokens[i]
    if (isType(token, Type.number)) {
      return parseNumber(tokens)
    }

    if (isType(token, Type.string)) {
      return parseString(tokens)
    }

    if (isType(token, Type.keyword)) {
      const map = {
        one_of: parseOneOf,
        range: parseRange,
        loop: parseLoop,
        optional: parseOptional,
        one_or_more: parseOneOrMore,
        except: parseExcept,
        group: parseGroup,
        ref: parseRef,
        followed_by: parseLook,
        not_followed_by: parseLook,
        preceded_by: parseLook,
        not_preceded_by: parseLook
      }
      const parseFunction = map[token.value]
      const specialKeywords = [
        'word', 'chinese', 'digit', 'whitespace', 'boundary', 'begin', 'end',
        'non_word', 'non_digit', 'non_whitespace', 'non_boundary', 'newline', 'tab', 'any'
      ]
      if (parseFunction) {
        return parseFunction(tokens)
      } else if (specialKeywords.includes(token.value)) {
        return parseSpecialKeywords(tokens)
      }
    }

    if (isType(token, Type.braceLeft)) {
      const node = {
        type: AstType.Alternative,
        body: []
      }
      --i
      node.body = parseBraceContent(tokens)
      return node
    }

    if (isType(token, Type.variable)) {
      return parseVariable(tokens)
    }

    throw new TypeError(`Unknown token at position ${i}: ${token}`)
  }

  const ast = {
    type: AstType.Program,
    body: []
  }

  while (i < tokens.length) {
    ast.body.push(walk())
  }

  return ast
}

export { AstType, isAstType, parser }
