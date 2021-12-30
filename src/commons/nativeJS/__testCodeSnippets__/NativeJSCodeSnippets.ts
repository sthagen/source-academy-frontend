import { ExceptionError } from 'js-slang/dist/errors/errors';

export interface CodeSnippetTestCase<ValueType> {
  name: string;
  snippet: string;
  value: ValueType;
  error?: ExceptionError;
}

const RECURSION_FACTORIAL: CodeSnippetTestCase<number> = {
  name: 'RECURSION (factorial)',
  snippet: `
    function factorial (n) {
        if (n == 0 || n == 1) {
            return 1;
        } else {
            return n * factorial(n-1);
        }
    }
      
    factorial(5);
    `,
  value: 120
};

const LOOP_WHILE: CodeSnippetTestCase<number> = {
  name: 'LOOP (while)',
  snippet: `
    let n = 0;
    while (n < 3) {
        n++;
    }
    `,
  value: 2
};

const LOOP_FOR: CodeSnippetTestCase<number> = {
  name: 'LOOP (for)',
  snippet: `
    for (let i = 0; i < 3; ++i) {
        i;
    }
    `,
  value: 2
};

const LITERAL_OBJECT: CodeSnippetTestCase<string> = {
  name: 'LITERAL OBJECT',
  snippet: `
    const sourceLanguage = {
        chapter: 1,
        variant: "default",
        displayName: "Source 1"
    }
    sourceLanguage["displayName"];
    `,
  value: 'Source 1'
};

const OOP: CodeSnippetTestCase<number> = {
  name: 'OOP',
  snippet: `
    class Rectangle {
        constructor(height, width) {
          this.height = height;
          this.width = width;
        }
    }
    const rect1 = new Rectangle(1080, 1920);
    rect1.height;
    `,
  value: 1080
};

// TODO
//const TRY_CATCH: CodeSnippetTestCase<Object> = {
//    snippet: "",
//    value: {}
//}

const ARRAY_MAP: CodeSnippetTestCase<Array<number>> = {
  name: 'ARRAY MAP',
  snippet: `
    [1,2,3,4].map(num => num + 1);
    `,
  value: [2, 3, 4, 5]
};

const ARRAY_FILTER: CodeSnippetTestCase<Array<number>> = {
  name: 'ARRAY FILTER',
  snippet: `
    [1,2,3,4].filter(num => num > 2);
    `,
  value: [3, 4]
};

const SICP: CodeSnippetTestCase<Array<any>> = {
  name: 'SICP',
  snippet: `
    parse('list(1,2,3);');
    `,
  value: [
    'application',
    [
      ['name', ['list', null]],
      [
        [
          ['literal', [1, null]],
          [
            ['literal', [2, null]],
            [['literal', [3, null]], null]
          ]
        ],
        null
      ]
    ]
  ]
};

export const VALID_NATIVEJS_TEST_CODE_SNIPPETS: CodeSnippetTestCase<any>[] = [
  RECURSION_FACTORIAL,
  LOOP_FOR,
  LOOP_WHILE,
  LITERAL_OBJECT,
  OOP,
  ARRAY_MAP,
  ARRAY_FILTER,
  SICP
];
