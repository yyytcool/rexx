<h1 align="center"> 🦖 Rexx </h1>

<p align="center">
  <a href="https://www.npmjs.com/package/rexx"><img src="https://img.shields.io/npm/v/rexx.svg?style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/rexx"><img src="https://img.shields.io/npm/dm/rexx.svg?style=flat-square" alt="npm downloads"></a>
  <a href="https://github.com/yyytcool/rexx/blob/main/package.json"><img src="https://img.shields.io/github/package-json/v/yyytcool/rexx?style=flat-square" alt="package.json version"></a>
  <a href="https://codecov.io/gh/yyytcool/rexx"><img src="https://img.shields.io/codecov/c/github/yyytcool/rexx?style=flat-square" alt="codecov"></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square" alt="Standard - JavaScript Style Guide"></a>
  <a href="https://github.com/yyytcool/rexx/actions"><img src="https://img.shields.io/github/actions/workflow/status/yyytcool/rexx/codecov.yml?branch=main&style=flat-square" alt="github actions"></a>
  <a href="https://github.com/yyytcool/rexx?tab=Apache-2.0-1-ov-file#readme"><img src="https://img.shields.io/github/license/yyytcool/rexx?style=flat-square" alt="License"></a>
</p>

<p align="center">
  <a href="https://yyytcool.github.io/rexx">🎮&nbsp;&nbsp;Playground</a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://stackblitz.com/edit/rexx-demo">💻&nbsp;&nbsp;Live Demo</a>
</p>

> Rexx: A human-friendly regex library with structured syntax and variable support.

## Introduction

 - Human readable.
 - Structured syntax.
 - Support for variables and comments.
 - Easily build regular expression patterns.

## Installation

```sh
# Install rexx using npm
npm install rexx

# using Yarn
yarn add rexx

# using pnpm 
pnpm install rexx
```

## Usage

### Browser

```html
<script src="dist/rexx.js"></script>
<!--or via CDN-->
<script src="https://www.unpkg.com/rexx"></script>
```

### Node.js

```js
// CommonJS
const rexx = require('rexx')
// or ES6 Modules
import rexx from 'rexx'
```

## Examples
## Semantic Versioning
Semantic Versioning (SemVer) follows the pattern major.minor.patch, where major, minor, and patch are non-negative integers.
```js
const regExp = rexx(`
    digits = { one_or_more { digit } }

    semVer = {
        begin
        optional {'v'}
        group('major') { digits }
        '.'
        group('minor') { digits }
        '.'
        group('patch') { digits }
        end
    }
`)
console.log(regExp)
// {
//     digits: /\d+/,
//     semVer: /^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/,
//     default: /(?:)/,
// }
regExp.semVer.test('v1.2.3')     // true
```

### URL
A URL contains several components - the protocol, host, path, query, and hash.

`http://www.example.com/foo/bar.html?a=b&c=d#hash`

```js
const urlRegexp = rexx(`
    protocol = { optional { one_of{'http', 'https'} } }           // http
    host  = { one_or_more { except{'/'} } }                       // www.example.com
    path  = { loop(0..) {'/', one_or_more { except{'/?#'} } } }   // /foo/bar.html
    query = { optional {'?', one_or_more { except{'#'} } } }      // ?a=b&c=d
    hash  = { optional {'#', one_or_more { any } } }              // #hash
    url   = {
        group('protocol'){ protocol }
        optional{'://'}
        group('host'){ host }
        group('path'){ path }
        group('query'){ query }
        group('hash'){ hash }
    }
`)
console.log(urlRegexp.url)
// /(?<protocol>(?:(?:http|https))?)(?:\:\/\/)?(?<host>(?:[^\/])+)(?<path>(?:\/(?:[^\/\?#])+)*)(?<query>(?:\?(?:[^#])+)?)(?<hash>(?:#.+)?)/
urlRegexp.url.test('http://www.example.com/foo/bar.html?a=b&c=d#hash') // true
```
### Password validation
The password must contain characters from at least 3 of the following 4 rules:
upper case, lower case, numbers, non-alphanumeric.

```js
const pwdRegexp = rexx(`
    lower = { one_of {range {'a', 'z'} } }
    upper = { one_of {range {'A', 'Z'} } }
    _any  = { loop(0..) { any } }
    hasLower = { followed_by { _any, lower } }
    hasUpper = { followed_by { _any, upper } }
    hasDigit = { followed_by { _any, digit } }
    hasSymbol = { followed_by { _any, non_word } }
    password = {
        begin
        one_of {
            {hasLower, hasUpper, hasDigit}
            {hasLower, hasUpper, hasSymbol}
            {hasLower, hasDigit, hasSymbol}
            {hasUpper, hasDigit, hasSymbol}
        }
        loop(8..){ any }
        end
    }
`)
console.log(pwdRegexp.password)
// /^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*\W)|(?=.*[a-z])(?=.*\d)(?=.*\W)|(?=.*[A-Z])(?=.*\d)(?=.*\W)).{8,}$/

```

## Cheat sheet

| Rexx                                | RegExp          |    | Rexx           | RegExp          |
|-------------------------------------|-----------------|----|----------------|-----------------|
| one_of { 'a', 'b', 'c' }            | [abc]           |    | word           | \w              |
| one_of { 'foo', 'bar' }             | foo\|bar        |    | non_word       | \W              |
| one_of { range {'a', 'z'} }         | [a-z]           |    | digit          | \d              |
| optional {'a'} / loop(0..1) {'a'}   | a?              |    | non_digit      | \D              |
| optional {'abc'}                    | (?:abc)?        |    | whitespace     | \s              |
| loop(0..) {'a'}                     | a*              |    | non_whitespace | \S              |
| one_or_more {'a'} / loop(1..) {'a'} | a+              |    | boundary       | \b              |
| loop(2) {'a'}                       | a{2}            |    | non_boundary   | \B              |
| loop(2..3) {'a'}                    | a{2,3}          |    | chinese        | [\u4e00-\u9fa5] |
| except {'a'}                        | [^a]            |    | '\\d'          | \d              |
| except { range {'a', 'z'} }         | [^a-z]          |    | '\\uffff'      | \uffff          |
| group{'foo'}                        | (foo)           |    | newline        | \n              |
| group('year'){'2024'}               | (?\<year\>2024) |    | tab            | \t              |
| ref {1}                             | \1              |    | any            | .               |         
| ref {year}                          | \k\<year\>      |    | begin          | ^               |
| followed_by {'a'}                   | (?=a)           |    | end            | $               |
| not_followed_by {'a'}               | (?!a)           |    | global         | g               |
| preceded_by {'a'}                   | (?<=)           |    | ignore_case    | i               |
| not_preceded_by {'a'}               | (?<!)           |    | multiline      | m               |
| loop (1..) {'a'} lazy               | a+?             |

## Syntax

### ' ... '

Matches exact characters.

Example: `'foo'` in Rexx translates to `foo` in regex.

### one_of

Syntax: `one_of { pattern, pattern, ... }`

Matches any one of the listed alternatives. Commas are optional.

Example: `one_of { 'foo', 'bar' }` translates to `foo|bar` in regex.

### range

Syntax: `range { 'start', 'end' }`

Creates a range of characters.

Example: `one_of { range { 'a', 'z' } }` translates to `[a-z]`.

### optional

Syntax: `optional { pattern }`

Marks the pattern as optional.

Example: `optional { 'foo' }` translates to `foo?`.

### loop

Syntax: `loop(from..to) { pattern }` or `loop(times) { pattern }`

Specifies a pattern to repeat.

Example: `loop(1..3) { 'a' }` translates to `a{1,3}`.

### except

Syntax: `except { pattern }`

Matches any character except the given pattern.

Example: `except { 'a' }` becomes `[^a]`.

### group

Syntax: `group { pattern }` or `group('name') { pattern }`

Capturing group is assigned a name or sequential number.

Example: `group { 'abc' }` or `group('name'){ 'abc' }` translates to `(abc)` or `(?<name>abc).`

### ref

Syntax: `ref { 1 }` or `ref { 'name' }`

References a previously matched group.

Example: `ref { 1 }` or `ref { 'name' }` translates to `\1` or `\k<name>`.

### followed_by

Syntax: `followed_by { 'pattern' }`

Asserts that what follows the current position is the specified pattern.

Example: `followed_by { 'a' }` translates to `(?=a)`.

### not_followed_by

Syntax: `not_followed_by { 'pattern' }`

Asserts that what follows the current position is not the specified pattern.

Example: `not_followed_by { 'a' }` translates to `(?!a)` .

### preceded_by

Syntax: `preceded_by { 'pattern' }`

Asserts that what precedes the current position is the specified pattern.

Example: `preceded_by { 'a' }` translates to `(?<=a)`.

### not_preceded_by

Syntax: `not_preceded_by { 'pattern' }`

Asserts that what precedes the current position is not the specified pattern.

Example: `not_preceded_by { 'a' }` translates to `(?<!a)`.

### Comments

Syntax: `// This is a comment`

Adds a comment to the pattern for explanation.

## Variable

- To define a variable in a pattern, use `variable_name = { pattern }`.
- All variables must be declared before they are used.
- Once a variable is declared, you can reference it in your pattern using its name.
- Variable declarations can also include flags that alter the behavior of the regex. There are three kinds of
  flags: `ignore_case`, `global`, `multiline`.

## Similar packages

<table>
<tr>
<td>Packages</td> <td> Code </td>
</tr>

<tr>
<td>

[Rexx](https://github.com/yyytcool/rexx)

</td>
<td> 

```js
digits = { one_or_more { digit } }

semVer = {
    begin
    optional {'v'}
    group('major') { digits }
    '.'
    group('minor') { digits }
    '.'
    group('patch') { digits }
    end
}
// /^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/
```

</td>
</tr>

<tr><td>

[melody](https://github.com/yoav-lavi/melody)

</td>
<td>

```js
<start>;
option of "v";
capture major {
  some of <digit>;
}
".";
capture minor {
  some of <digit>;
}
".";
capture patch {
  some of <digit>;
}
<end>;
// /^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/
```

</td>
</tr>
<tr><td>

[megic-regexp](https://github.com/unjs/magic-regexp)

</td>
<td>

```js
import { createRegExp, maybe, oneOrMore, exactly, digit } from 'magic-regexp'

const regExp = createRegExp(
    maybe('v')
    .and(oneOrMore(digit).groupedAs('major'))
    .and(exactly('.'))
    .and(oneOrMore(digit).groupedAs('minor'))
    .and(exactly('.'))
    .and(oneOrMore(digit).groupedAs('patch'))
    .at.lineStart()
    .at.lineEnd()
)
// /^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/
```

</td></tr>
<tr><td>

[JSVerbalExpressions](https://github.com/VerbalExpressions/JSVerbalExpressions)

</td>
<td>

```js
const regExp = VerEx()
    .startOfLine()
    .maybe('v')
    .beginCapture()
        .digit().oneOrMore()
    .endCapture()
    .then('.')
    .beginCapture()
        .digit().oneOrMore()
    .endCapture()
    .then('.')
    .beginCapture()
        .digit().oneOrMore()
    .endCapture()
    .endOfLine()
    // /^(?:v)?(\d+)(?:\.)(\d+)(?:\.)(\d+)$/
```

</td></tr>
</table>

## Contributing

Contributions to this project are welcome.

Clone and fork:

```sh
git clone https://github.com/yyytcool/rexx.git
```

## License

[Apache License](./LICENSE).

Copyright (c) 2024-present, yyytcool
