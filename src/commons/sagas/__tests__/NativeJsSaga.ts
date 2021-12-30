import { ExceptionError } from 'js-slang/dist/errors/errors';
import { expectSaga } from 'redux-saga-test-plan';
import {
  evalInterpreterError,
  evalInterpreterSuccess
} from 'src/commons/application/actions/InterpreterActions';
import { defaultState } from 'src/commons/application/ApplicationTypes';
import { evalNativeJSProgram } from 'src/commons/nativeJS/NativeJSEval';
import { runWrapper } from 'src/commons/utils/RunHelper';
import { clearReplOutput, updateWorkspace } from 'src/commons/workspace/WorkspaceActions';
import { NATIVE_JS_RUN } from 'src/features/nativeJS/NativeJSTypes';

import nativeJsSaga from '../NativeJsSaga';

describe('NativeJS Saga Tests', () => {
  it('Running valid NativeJS Program results in interpreterSuccess', () => {
    const workspaceLocation = 'playground';
    const program = "1 + '1'";

    return expectSaga(nativeJsSaga)
      .withState(defaultState)
      .put(updateWorkspace(workspaceLocation, { isRunning: true }))
      .put(clearReplOutput(workspaceLocation))
      .call(runWrapper, evalNativeJSProgram, program)
      .put(evalInterpreterSuccess('11', workspaceLocation))
      .dispatch({ type: NATIVE_JS_RUN, payload: { workspace: workspaceLocation, program } })
      .silentRun();
  });

  it('Running invalid NativeJS Program results in interpreterError', () => {
    const workspaceLocation = 'playground';
    const invalidProgram = 'source + academy';
    const programError = new ExceptionError(new ReferenceError('source is not defined'), {
      start: { line: 1, column: 1 },
      end: { line: 0, column: 0 }
    });
    return expectSaga(nativeJsSaga)
      .withState(defaultState)
      .put(updateWorkspace(workspaceLocation, { isRunning: true }))
      .put(clearReplOutput(workspaceLocation))
      .call(runWrapper, evalNativeJSProgram, invalidProgram)
      .put(evalInterpreterError([programError], workspaceLocation))
      .dispatch({
        type: NATIVE_JS_RUN,
        payload: { workspace: workspaceLocation, program: invalidProgram }
      })
      .silentRun();
  });
});
