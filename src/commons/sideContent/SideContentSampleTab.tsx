import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import { DebuggerContext } from '../workspace/WorkspaceTypes';
import { isCurrentlyActive, isEmptyDebuggerContext } from './SideContentHelper';
import { SideContentTab } from './SideContentTypes';

////////////////////////
//   React Component  //
////////////////////////

const SideContentSampleTab = (props: any) => {
  const workspaces = useSelector((state: OverallState) => state.workspaces);

  // Require workspace location
  if (!props.workspaceLocation) {
    return <></>;
  }

  const debuggerContext = workspaces[props.workspaceLocation].debuggerContext;

  const replOutput = isEmptyDebuggerContext(debuggerContext) ? '' : debuggerContext.result.value;

  return (
    <div>
      <p>The current result was: {replOutput}</p>
      <p>*Insert Transpiled React component here from modules/build*</p>
    </div>
  );
};

////////////////////////
// Spawning Behaviour //
////////////////////////

// Outside the react component
const toSpawnSampleTab = (debuggerContext: DebuggerContext): boolean => {
  console.log(debuggerContext);
  if (debuggerContext.result === undefined || debuggerContext.result.value === 'unsample') {
    return false;
  }
  const isToSpawn =
    isCurrentlyActive('Sample', debuggerContext.workspaceLocation) ||
    debuggerContext.result.value === 'sample';
  return isToSpawn;
};

////////////////////////
//        Wrap        //
////////////////////////

// Wrap it within SideContentTab
export const sampleTab: SideContentTab = {
  label: 'Sample',
  iconName: IconNames.ASTERISK,
  body: <SideContentSampleTab />,
  toSpawn: toSpawnSampleTab // indicate the spawning behaviour function
};

export default SideContentSampleTab;
