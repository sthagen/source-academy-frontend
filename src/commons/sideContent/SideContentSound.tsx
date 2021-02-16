import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

type State = {
  loading: boolean;
};

class SideContentSound extends React.Component<{}, State> {

  
  constructor(props: any) {
    super(props);
    this.state = { loading: true };

  }


  public componentDidMount() {
    // do nothing
  }

  public render() {
    
    return (
      <div className={classNames('sa-list-visualizer', Classes.DARK)}>
        <p id="sound-default-text" className={Classes.RUNNING_TEXT}>
          The sound tab allows you to play and pause your custom sounds, change their volume and add additional filters to change how the audio sounds..
          <br />
          <br />
          Have fun experimenting with the filters!
          <br />
          <audio controls src = "" id = "sound-tab-player"></audio>
          <br />
          <br />
          Sound Visualizer Canvas
          
          <canvas id = "sound-tab-canvas"></canvas>
          <br />
          <br />
          Filters
        </p>
      
      </div>
      
    );
  }

}

export default SideContentSound;
