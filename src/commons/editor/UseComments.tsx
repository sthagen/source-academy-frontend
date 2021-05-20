import { Ace, require as acequire } from 'ace-builds';
import { groupBy, map, sortBy, values } from 'lodash';
import * as React from 'react';
import ReactDOM from 'react-dom';

//@ts-ignore
import Comments from './Comments';
import { CommentAPI, useComments } from './CommentsAPI'
import { EditorHook } from './Editor';
const LineWidgets = acequire('ace/line_widgets').LineWidgets;

export type { IComment, CommentAPI } from './CommentsAPI';

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
}

const useCommentsEditorHook: EditorHook = (
    inProps,
    outProps,
    keyBindings,
    reactAceRef,
    contextMenuHandlers
) => {
    //@ts-ignore
    const [ignored, forceUpdate] = React.useReducer(x => x + 1, 0);
    const commentsAPI = useComments(forceUpdate);
    const commentsAPIRef: React.MutableRefObject<CommentAPI> = React.useRef(commentsAPI);
    React.useEffect(() => {
        commentsAPIRef.current = commentsAPI;
    }, [commentsAPI]);
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
    React.useEffect(() => {
        console.log('re-render comments')
        const comments = commentsAPI.commentsRef.current;

        // React can't handle the rendering because it's going into
        // an unmanaged component.
        // Also, the line number changes externally, so extra fun.
        // TODO: implement line number changes for comments. <--- going to skip this. 

        // Re-render all comments.
        const commentsByLine = groupBy(values(comments), c => c.linenum);
        const commentsWidgets = map(commentsByLine, commentsOnLineUnsorted => {
            //@ts-ignore
            const lineNo = commentsOnLineUnsorted[0].linenum;
            const commentsOnLine = sortBy(commentsOnLineUnsorted, c => c.datetime);
            const container = document.createElement('div');
            container.style.maxWidth = '40em';
            // container.style.backgroundColor = 'grey';
            const widget: IWidget = {
                row: commentsOnLine[0].linenum, // Must exist.
                fixedWidth: true,
                coverGutter: true,
                el: container,
                type: 'errorMarker'
            };
            // console.log("rerendering", lineNo);
            // setInterval(() => 
            // ReactDOM.render(
            //     <div>
            //         <h2>It is {new Date().toLocaleTimeString()}.</h2>
            //         {/* <div>Test</div> */}
            //         <Comments key={lineNo}
            //             comments={commentsOnLine}
            //             commentsAPIRef={commentsAPIRef}
            //         />
            //     </div>,
            //     container
            // ), 1000);
            ReactDOM.render(
                <div>
                    <h2>It is {new Date().toLocaleTimeString()}.</h2>
                    <Comments key={lineNo}
                        comments={commentsOnLine}
                        commentsAPIRef={commentsAPIRef}
                        // commentsAPI={commentsAPI}
                    />
                </div>,
                container
            );
            widgetManagerRef.current?.addLineWidget(widget);
            return widget;
        });

        return () => {
            // Remove all comments
            commentsWidgets.forEach(widget => {
                widgetManagerRef.current?.removeLineWidget(widget);
            });
        };
    }, [commentsAPI, commentsAPI.commentsRef]);
};

export default useCommentsEditorHook;