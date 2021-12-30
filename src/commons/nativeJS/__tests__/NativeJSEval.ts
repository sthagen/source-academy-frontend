import {
  CodeSnippetTestCase,
  VALID_NATIVEJS_TEST_CODE_SNIPPETS
} from '../__testCodeSnippets__/NativeJSCodeSnippets';
import { evalNativeJSProgram } from '../NativeJSEval';

describe('NativeJS Eval Test Cases', () => {
  it.each(VALID_NATIVEJS_TEST_CODE_SNIPPETS)(
    `[valid] %p`,
    ({ snippet, value }: CodeSnippetTestCase<any>) => {
      expect(evalNativeJSProgram(snippet).value).toEqual(value);
    }
  );
});
