/* eslint-disable no-eval */
import 'sicp';

import { ExceptionError } from 'js-slang/dist/errors/errors';
import { NativeJSEvalResult } from 'src/features/nativeJS/NativeJSTypes';

import { getEvalErrorLocation } from './EvalErrorLocator';

const RESTRICTED_GLOBALS: string[] = ['window'];
const RESTRICTED_GLOBALS_PRELUDE = `let ${RESTRICTED_GLOBALS.join(',')}`;
const EVAL_PRELUDE = `${[RESTRICTED_GLOBALS_PRELUDE].join('\n')}\n`;

interface EvalFuncPreludeOffset {
  evalFunc: (program: string) => any;
  preludeOffset: number;
}

const restrictedEval: EvalFuncPreludeOffset = {
  // modules are in strict mode by default
  // therefore, `eval()` will be ran in strict mode
  evalFunc: (program: string) => eval(`${EVAL_PRELUDE}${program}`),
  preludeOffset: EVAL_PRELUDE.split('\n').length - 1
};

export function evalNativeJSProgram(program: string): NativeJSEvalResult {
  const { evalFunc, preludeOffset }: EvalFuncPreludeOffset = restrictedEval;
  try {
    return { status: 'finished', value: evalFunc(program) };
  } catch (error) {
    return {
      status: 'error',
      value: undefined,
      error: new ExceptionError(error, getEvalErrorLocation(error, preludeOffset))
    };
  }
}
