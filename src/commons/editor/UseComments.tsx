import { Ace, require as acequire } from 'ace-builds';
import { each, sortBy } from 'lodash';
import * as React from 'react';
import ReactDOM from 'react-dom';

import Comments from './Comments';
import { useComments } from './CommentsAPI'
import { EditorHook } from './Editor';
const LineWidgets = acequire('ace/line_widgets').LineWidgets;

export type { IComment, CommentAPI } from './CommentsAPI';

export interface CommentsStateProps {
  // Provide either assessmentId XOR SubmissionId + question number, or none of them.
  // Too complicated to make into union type.
  assessmentId?: number;
  submissionId?: number;
  questionId?: number;
  disableComments?: boolean;
}

// Inferred from: https://github.com/ajaxorg/ace/blob/master/lib/ace/ext/error_marker.js#L129
interface IWidget {
    row: number;
    fixedWidth: boolean;
    coverGutter: boolean;
    el: Element;
    type: string;
}

interface ILineManager {
    attach: (editor: Ace.Editor) => void;
    addLineWidget: (widget: IWidget) => void;
    removeLineWidget: (widget: IWidget) => void;
    onWidgetChanged: (widget: IWidget) => void; // Call to update the widget's size.
}

const useCommentsEditorHook: EditorHook = (
    inProps,
    outProps,
    keyBindings,
    reactAceRef,
    contextMenuHandlers
) => {
    const lineWidgetsRef = React.useRef<{[lineNo: number]: IWidget}>([]);
    const commentsAPI = useComments(inProps);
    // ----------------- ACE-EDITOR CONFIG -----------------
    // Enables the line manager, which is used to put inline comments.

    const widgetManagerRef: React.MutableRefObject<ILineManager | null> = React.useRef(null);
    React.useEffect(() => {
        if (!reactAceRef.current) {
            return;
        }
        const editor = reactAceRef.current!.editor;
        widgetManagerRef.current = new LineWidgets(editor.session);
        widgetManagerRef.current!.attach(editor);
    }, [reactAceRef]);



    contextMenuHandlers.createCommentPrompt = commentsAPI.createEmptyComment;

    // ----------------- RENDERING -----------------

    // Render comments.
    // React can't handle the rendering because it's going into
    // an unmanaged component.
    React.useEffect(() => {
        const comments = commentsAPI.comments;
        const widgetManager = widgetManagerRef.current!;
        
        // Also, the line number changes externally, so extra fun.
        // TODO: implement line number changes for comments. <--- going to skip this. Only use on static line numbers.
        // Remove all containers which do not have a line.
        for(const [currLine, widget] of Object.entries(lineWidgetsRef.current)) {
            if(!(currLine in comments)) {
                widgetManagerRef.current?.removeLineWidget(widget);
                delete lineWidgetsRef.current[currLine];
            }
        }

        each(comments, (commentsOnLineUnsorted, idx) => {
            const lineNo = commentsOnLineUnsorted[0].linenum;
            if(lineNo === -1) { // Do not render the side-panel comments
                return;
            }
            const commentsOnLine = sortBy(commentsOnLineUnsorted, c => c.datetime);
            // The ref is required to prevent re-creating the container.
            // If the container is re-created, the focus will be lost.
            let widget: IWidget = lineWidgetsRef.current[lineNo];
            if(!widget) {
                const container = document.createElement("div");
                container.style.maxWidth = '40em';
                widget = lineWidgetsRef.current[lineNo] = {
                    row: commentsOnLine[0].linenum, // Must exist.
                    fixedWidth: true,
                    coverGutter: true,
                    el: container,
                    type: 'errorMarker'
                };
                widgetManager.addLineWidget(widget);
            }
            const container = widget.el;
            ReactDOM.render(
                <Comments key={lineNo}
                    comments={commentsOnLine}
                    commentsAPI={commentsAPI}
                />,
                container
            );
            widgetManager.onWidgetChanged(widget);
        });
    }, [commentsAPI]);
};

export default useCommentsEditorHook;