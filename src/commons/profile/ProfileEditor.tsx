import { FileInput, Slider } from '@blueprintjs/core';
import React from 'react'
import ReactAvatarEditor from 'react-avatar-editor'
import Dropzone from 'react-dropzone'

type ProfileEditorProps = OwnProps;

type OwnProps = {
  defaultImage?: string;
}

export default class ProfileEditor extends React.Component<ProfileEditorProps,{}> {
  editor?: ReactAvatarEditor = undefined;
  state = {
    image: '',
    allowZoomOut: false,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
    borderRadius: 0,
    width: 200,
    height: 200,
    disableCanvasRotation: false,
    isTransparent: false,
    backgroundColor: undefined,
    zoomMax: 4
  }

  public componentDidMount() {
    if(this.props.defaultImage) {
      this.setState({image: this.props.defaultImage});
    }
  }

  // handleNewImage = (e: { target: { files: any[] } }) => {
  handleNewImage: React.FormEventHandler<HTMLInputElement> = (e: any) => {
    this.setState({ image: e.target.files[0] })
  }

  public getImg = () => {
    const img = this.editor!.getImageScaledToCanvas().toDataURL()
    return img;
  }

  handleScale = (val: number) => {
    this.setState({ scale: val })
  }

  setEditorRef = (editor: ReactAvatarEditor) => {
    if (editor) this.editor = editor
  }

  handlePositionChange = (position: {x: number, y: number}) => {
    this.setState({ position })
  }

  handleZoom = (event: any) => {
    event.preventDefault();
    this.setState({
      scale: Math.min(this.state.zoomMax,
        Math.max(this.state.scale + event.deltaY * -0.0025, 1))
    })
  }

  render() {
    return (
      <div
        onWheel={this.handleZoom}
        className="profile-editor">
        <Dropzone
          onDrop={(acceptedFiles) => {
            this.setState({ image: acceptedFiles[0] })
          }}
          noClick
          multiple={false}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <ReactAvatarEditor
                ref={this.setEditorRef}
                scale={this.state.scale}
                width={this.state.width}
                height={this.state.height}
                position={this.state.position}
                onPositionChange={this.handlePositionChange}
                rotate={this.state.rotate}
                borderRadius={this.state.width / (100 / this.state.borderRadius)}
                image={this.state.image}
                className="editor-canvas"
                crossOrigin= "anonymous"
               />
              <br />
              <FileInput text="Choose file..." 
                onInputChange={(files) => this.handleNewImage(files)} />
            </div>
          )}
        </Dropzone>
        <div className="profile-zoom">
          <label>Zoom:</label>
          <Slider
            onChange={this.handleScale}
            min={this.state.allowZoomOut ? 0.1 : 1}
            max={this.state.zoomMax}
            stepSize={0.01}
            value={this.state.scale}
          />
        </div>
      </div>
    )
  }
}
