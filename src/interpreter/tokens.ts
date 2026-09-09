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
  sollu: TokenType.SOLLU,
  kelu: TokenType.KELU,
  iruntha: TokenType.IRUNTHA,
  illatti: TokenType.ILLATTI,
  illana: TokenType.ILLANA,
  varisaiya: TokenType.VARISAIYA,
  kaaga: TokenType.KAAGA,
  ulla: TokenType.ULLA,
  kulla: TokenType.KULLA,
  irukkura_varai: TokenType.IRUKKURA_VARAI,
  fun: TokenType.FUN,
  seyal: TokenType.SEYAL,
  thirupikudu: TokenType.THIRUPIKUDU,
  kutti_fun: TokenType.KUTTI_FUN,
  class: TokenType.CLASS,
  ithu: TokenType.ITHU,
  muyarchi: TokenType.MUYARCHI,
  thavaru: TokenType.THAVARU,
  kandippa: TokenType.KANDIPPA,
  ulagam: TokenType.ULAGAM,
  matrum: TokenType.MATRUM,
  alladhu: TokenType.ALLADHU,
  illai: TokenType.ILLAI,
  unmai: TokenType.UNMAI,
  poi: TokenType.POI,
  onnumilla: TokenType.ONNUMILLA,
  None: TokenType.ONNUMILLA,
  True: TokenType.UNMAI,
  False: TokenType.POI,
  import: TokenType.IMPORT,
  eduthu_vaa: TokenType.EDUTHU_VAA,
  kondu_va: TokenType.KONDU_VA,
  niruva: TokenType.NIRUVA,
  thodaru: TokenType.THODARU,
  pass: TokenType.PASS,
  del: TokenType.DEL,
  azhi: TokenType.DEL,
};
