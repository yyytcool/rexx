class Type {
  static number = new Type('number')
  static string = new Type('string')

  static variable = new Type('variable')
  static keyword = new Type('keyword')

  static braceLeft = new Type('braceLeft') // {
  static braceRight = new Type('braceRight') // }
  static parenthesesLeft = new Type('parenthesesLeft') // (
  static parenthesesRight = new Type('parenthesesRight') // )

  static comma = new Type('comma') // ,
  static assign = new Type('assign') // =
  static point = new Type('point') // .

  constructor (name) {
    this.name = name
  }

  toString () {
    return `${this.name}`
  }
}

const isType = (token, type) => {
  if (token instanceof Token) {
    return token.type.name === type.name
  } else {
    return false
  }
}

const checkType = (token, ...types) => {
  const checked = types.some(type => isType(token, type))
  if (!checked) {
    const expectedTypes = types.join(', ')
    throw new TypeError(`Expected token type [${expectedTypes}], but found: [${token?.type}]`)
  }
}

class Token {
  constructor (type, value) {
    this.type = type
    this.value = value
  }

  toString () {
    return `${this.constructor.name}:${this.value}(${this.type})`
  }
}

const isKeyword = (w) => {
  const words = ['number', 'string', 'begin', 'end', 'lazy',
    'newline', 'tab', 'any', 'ignore_case', 'global', 'multiline',
    'loop', 'one_or_more', 'one_of', 'range', 'optional', 'except', 'group', 'ref',
    'followed_by', 'not_followed_by', 'preceded_by', 'not_preceded_by',
    'word', 'chinese', 'digit', 'whitespace', 'boundary', 'non_word', 'non_digit', 'non_whitespace', 'non_boundary'
  ]
  return words.includes(w)
}

const tokenizer = (input) => {
  const WHITESPACE = /\s/ // [ \t\n\r]
  const NUMBERS = /\d/ // 0-9
  const QUOTE = /['"]/ // ' "
  const LETTERS = /[a-z_]/i // a-z A-Z _
  const SPECIAL_CHARS = /[{}()=,.]/ // {}()=,.

  input += '\n'
  const tokens = []
  let i = 0

  while (i < input.length) {
    let char = input[i]

    if (WHITESPACE.test(char)) {
      i++
      continue
    }

    if (NUMBERS.test(char)) {
      let value = ''
      while (NUMBERS.test(char)) {
        value += char
        char = input[++i]
      }
      tokens.push(new Token(Type.number, value))
      continue
    }

    if (QUOTE.test(char)) {
      let value = ''
      char = input[++i]
      while (!QUOTE.test(char)) {
        value += char
        char = input[++i]
      }
      ++i
      tokens.push(new Token(Type.string, value))
      continue
    }

    if (LETTERS.test(char)) {
      let value = ''
      while (LETTERS.test(char) || NUMBERS.test(char)) {
        value += char
        char = input[++i]
      }
      const type = isKeyword(value) ? Type.keyword : Type.variable
      tokens.push(new Token(type, value))
      continue
    }

    if (SPECIAL_CHARS.test(char)) {
      const map = {
        '{': Type.braceLeft,
        '}': Type.braceRight,
        '(': Type.parenthesesLeft,
        ')': Type.parenthesesRight,
        '=': Type.assign,
        ',': Type.comma,
        '.': Type.point
      }
      ++i
      tokens.push(new Token(map[char], char))
      continue
    }

    if (char === '/') {
      const next = input[i + 1]
      if (next === '/') {
        i += 2
        while (input[i] !== '\n' && i < input.length) {
          ++i
        }
      }
      ++i
      continue
    }

    throw new TypeError(`Unknown character at position ${i}: ${char}`)
  }
  return tokens
}

export { Type, isType, checkType, Token, tokenizer }
