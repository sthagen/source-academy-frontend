import AceEditor from 'react-ace';

export type Position = {
  row: number;
  column: number;
};

// Ref: https://github.com/ajaxorg/ace/blob/6933ab5202ca90b07b1d58a6b016c70f13d310eb/lib/ace/mouse/mouse_event.js#L40
export type AceMouseEvent = {
  domEvent: React.MouseEvent<HTMLDivElement>;
  editor: AceEditor['editor'];
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  $pos: any;
  $inSelection: any;
  propagationStopped: boolean;
  defaultPrevented: any;

  // methods:
  stopPropagation: () => void;
  preventDefault: () => void;
  stop: () => void;
  getDocumentPosition: () => Position;
  inSelection: () => boolean; // Determines if the mouse position is selected.
  getButton: () => number; // 0 for leftmouse, 1 for middlemouse, 2 for rightmouse
  cancelContextMenu(): () => void;
};

// This interface is actually unused but ace poorly documents this feature so
// we leave this here for reference.
export interface IAutocompletionResult {
  caption: string;
  value: string;
  meta?: string;
  docHTML?: string;
  score?: number;
}

export type HighlightedLines = [number, number]; // Start line, end line.


// ------------ Comments --------------

// This is the data that's sent around.
export interface ICommentBase {
  id: string;
  // TODO: Reference user differently.
  userId: string;
  username: string;
  linenum: number;
  text: string;
  datetime: number; // if this is infinity, means not submitted yet!
  // Infinity so it gets sorted to bottom.
}

// Includes derived data
export interface IComment extends ICommentBase {
  profilePic: string;
  meta: ICommentMeta;
}

export interface ICommentMeta {
  editing?: IComment; // Stores a copy which is being edited.
  isCollapsed: boolean;
  error?: string;
}

export type IComments = { [lineNo: number]: IComment[] }

