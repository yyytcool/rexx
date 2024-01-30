import { Type, Token, tokenizer } from '../src/tokenizer.js'

describe('Lexer Tests', () => {
  test('Tokenizes numbers correctly', () => {
    const input = '123'
    const tokens = tokenizer(input)
    expect(tokens.length).toBe(1)
    expect(tokens[0].type).toBe(Type.number)
    expect(tokens[0].value).toBe('123')
  })

  test('Tokenizes strings correctly', () => {
    const input = '"hello"'
    const tokens = tokenizer(input)
    expect(tokens.length).toBe(1)
    expect(tokens[0].type).toBe(Type.string)
    expect(tokens[0].value).toBe('hello')
  })

  test('Tokenizes keywords correctly', () => {
    const input = 'loop'
    const tokens = tokenizer(input)
    expect(tokens.length).toBe(1)
    expect(tokens[0].type).toBe(Type.keyword)
    expect(tokens[0].value).toBe('loop')
  })

  test('Tokenizes variables correctly', () => {
    const input = 'myVar'
    const tokens = tokenizer(input)
    expect(tokens.length).toBe(1)
    expect(tokens[0].type).toBe(Type.variable)
    expect(tokens[0].value).toBe('myVar')
  })

  test('Tokenizes special characters correctly', () => {
    const input = '{}()=.,'
    const tokens = tokenizer(input)
    expect(tokens).toEqual([
      new Token(Type.braceLeft, '{'),
      new Token(Type.braceRight, '}'),
      new Token(Type.parenthesesLeft, '('),
      new Token(Type.parenthesesRight, ')'),
      new Token(Type.assign, '='),
      new Token(Type.point, '.'),
      new Token(Type.comma, ',')
    ])
  })

  test('Handles whitespace correctly', () => {
    const input = ' '
    const tokens = tokenizer(input)
    expect(tokens.length).toBe(0)
  })

  test('Handles comments correctly', () => {
    const input = '// this is a comment'
    const tokens = tokenizer(input)
    expect(tokens.length).toBe(0)
  })

  test('Throws error on unknown characters', () => {
    const input = '@'
    expect(() => tokenizer(input)).toThrow(TypeError)
  })
})
