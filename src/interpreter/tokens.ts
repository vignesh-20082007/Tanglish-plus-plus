export enum TokenType {
  // Special
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
  INDENT = 'INDENT',
  DEDENT = 'DEDENT',

  // Literals & Identifiers
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',

  // Keywords
  SOLLU = 'SOLLU',             // print
  KELU = 'KELU',               // input
  IRUNTHA = 'IRUNTHA',         // if
  ILLATTI = 'ILLATTI',         // elif
  ILLANA = 'ILLANA',           // else
  VARISAIYA = 'VARISAIYA',     // for (varisaiya / kaaga)
  KAAGA = 'KAAGA',             // for
  ULLA = 'ULLA',               // in (ulla / kulla)
  KULLA = 'KULLA',             // in
  IRUKKURA_VARAI = 'IRUKKURA_VARAI', // while
  FUN = 'FUN',                 // def
  SEYAL = 'SEYAL',             // def
  THIRUPIKUDU = 'THIRUPIKUDU', // return
  KUTTI_FUN = 'KUTTI_FUN',     // lambda
  CLASS = 'CLASS',             // class
  ITHU = 'ITHU',               // self
  MUYARCHI = 'MUYARCHI',       // try
  THAVARU = 'THAVARU',         // except
  KANDIPPA = 'KANDIPPA',       // finally
  ULAGAM = 'ULAGAM',           // global
  MATRUM = 'MATRUM',           // and
  ALLADHU = 'ALLADHU',         // or
  ILLAI = 'ILLAI',             // not
  UNMAI = 'UNMAI',             // true
  POI = 'POI',                 // false
  ONNUMILLA = 'ONNUMILLA',     // None
  IMPORT = 'IMPORT',           // import
  EDUTHU_VAA = 'EDUTHU_VAA',   // import
  KONDU_VA = 'KONDU_VA',       // import
  INCLUDE = 'INCLUDE',         // include
  FROM = 'FROM',               // from / engaerunthu
  RAISE = 'RAISE',             // raise / thavaru_kelu
  NIRUVA = 'NIRUVA',           // break
  THODARU = 'THODARU',         // continue
  PASS = 'PASS',               // pass
  DEL = 'DEL',                 // del / azhi

  // Operators
  EXPONENT = '**',
  FLOOR_DIV = '//',
  PLUS = '+',
  MINUS = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  MODULO = '%',
  EQUALS = '==',
  NOT_EQUALS = '!=',
  LESS_THAN = '<',
  LESS_THAN_EQUALS = '<=',
  GREATER_THAN = '>',
  GREATER_THAN_EQUALS = '>=',
  ASSIGN = '=',
  PLUS_ASSIGN = '+=',
  MINUS_ASSIGN = '-=',
  STAR_ASSIGN = '*=',
  SLASH_ASSIGN = '/=',

  // Delimiters
  LPAREN = '(',
  RPAREN = ')',
  LBRACKET = '[',
  RBRACKET = ']',
  LBRACE = '{',
  RBRACE = '}',
  COLON = ':',
  COMMA = ',',
  DOT = '.',
  SEMICOLON = ';',
}

export interface Token {
  type: TokenType;
  value: any;
  line: number;
  col: number;
}

export const KEYWORDS: Record<string, TokenType> = {
  // Input / Output
  sollu: TokenType.SOLLU,
  print: TokenType.SOLLU,
  kelu: TokenType.KELU,
  input: TokenType.KELU,

  // Conditionals
  iruntha: TokenType.IRUNTHA,
  oruvelaerunth: TokenType.IRUNTHA,
  if: TokenType.IRUNTHA,
  illatti: TokenType.ILLATTI,
  oruvelaillina: TokenType.ILLATTI,
  elif: TokenType.ILLATTI,
  illana: TokenType.ILLANA,
  athuvuillina: TokenType.ILLANA,
  else: TokenType.ILLANA,

  // Loops & Iterations
  varisaiya: TokenType.VARISAIYA,
  kaaga: TokenType.KAAGA,
  for: TokenType.VARISAIYA,
  ulla: TokenType.ULLA,
  kulla: TokenType.KULLA,
  in: TokenType.ULLA,
  irukkura_varai: TokenType.IRUKKURA_VARAI,
  while: TokenType.IRUKKURA_VARAI,
  niruva: TokenType.NIRUVA,
  neruthu: TokenType.NIRUVA,
  break: TokenType.NIRUVA,
  thodaru: TokenType.THODARU,
  neecontinue: TokenType.THODARU,
  continue: TokenType.THODARU,
  pass: TokenType.PASS,
  ethupannatha: TokenType.PASS,

  // Functions & Lambdas
  fun: TokenType.FUN,
  seyal: TokenType.SEYAL,
  def: TokenType.FUN,
  thirupikudu: TokenType.THIRUPIKUDU,
  return: TokenType.THIRUPIKUDU,
  kutti_fun: TokenType.KUTTI_FUN,
  lineda: TokenType.KUTTI_FUN,
  lambda: TokenType.KUTTI_FUN,

  // OOP / Classes
  class: TokenType.CLASS,
  ithu: TokenType.ITHU,
  self: TokenType.ITHU,

  // Exceptions & Error Handling
  muyarchi: TokenType.MUYARCHI,
  try: TokenType.MUYARCHI,
  thavaru: TokenType.THAVARU,
  except: TokenType.THAVARU,
  kandippa: TokenType.KANDIPPA,
  finally: TokenType.KANDIPPA,
  raise: TokenType.RAISE,
  thavaru_kelu: TokenType.RAISE,

  // Scope
  ulagam: TokenType.ULAGAM,
  global: TokenType.ULAGAM,

  // Logical Operators
  matrum: TokenType.MATRUM,
  apro: TokenType.MATRUM,
  and: TokenType.MATRUM,
  alladhu: TokenType.ALLADHU,
  or: TokenType.ALLADHU,
  illai: TokenType.ILLAI,
  illa: TokenType.ILLAI,
  not: TokenType.ILLAI,

  // Booleans & None
  unmai: TokenType.UNMAI,
  True: TokenType.UNMAI,
  true: TokenType.UNMAI,
  poi: TokenType.POI,
  False: TokenType.POI,
  false: TokenType.POI,
  onnumilla: TokenType.ONNUMILLA,
  ethumeilla: TokenType.ONNUMILLA,
  None: TokenType.ONNUMILLA,
  none: TokenType.ONNUMILLA,

  // Module Loading & Includes
  import: TokenType.IMPORT,
  eduthu_vaa: TokenType.EDUTHU_VAA,
  kondu_va: TokenType.KONDU_VA,
  eduthuko: TokenType.IMPORT,
  include: TokenType.INCLUDE,
  from: TokenType.FROM,
  engaerunthu: TokenType.FROM,

  // Deletion
  del: TokenType.DEL,
  azhi: TokenType.DEL,
};
