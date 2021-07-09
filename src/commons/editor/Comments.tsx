import {
    Button,
    ButtonGroup,
    Card,
    Divider,
    Icon,
    Menu,
    MenuItem,
    Popover,
    Position,
    // Spinner
  } from '@blueprintjs/core';
  import CSS from 'csstype'; // TODO: Remove
import { some } from 'lodash';
  import * as React from 'react';
  import { format } from 'timeago.js';

  import Markdown from '../Markdown';
  import { CommentAPI, IComment } from './UseComments';
  
 
  
  export interface CommentsProps {
    comments: IComment[]; // Subset of comments on this widget only!
    // commentsAPIRef: React.MutableRefObject<CommentAPI>;
    commentsAPI: CommentAPI;
  }
  
  // =============== STYLES ===============
  // TODO: REMOVE.
  
  const commentsContainerStyles: CSS.Properties = {
    display: 'grid',
    gridTemplateColumns: '3em auto',
    fontFamily: `-apple-system, "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Open Sans", "Helvetica Neue", "Icons16", sans-serif`
  };
  
  const commentStyles: CSS.Properties = {
    gridColumn: 2,
    display: 'grid',
    gridTemplateColumns: '4em auto',
    fontSize: '0.8em',
    backgroundColor: '#253545'
  };
  
  const contentStyles: CSS.Properties = {};
  
  const optionStyles: CSS.Properties = {
    float: 'right',
    padding: '0.3em'
  };
  
  const relativeTimeStyles: CSS.Properties = {
    color: 'lightgray',
    fontSize: '0.9em'
  };
  
  const usernameStyles: CSS.Properties = {
    fontWeight: 'bolder',
    paddingRight: '0.5em'
  };
  
  const profilePicStyles: CSS.Properties = {
    width: '3em',
    height: '3em'
  };
  
  const replyContainerStyles: CSS.Properties = {
    gridColumn: '1 / 3',
    padding: '0.5em',
    backgroundColor: 'grey'
  };
  
  const enterMessageStyles: CSS.Properties = {
    width: '100%',
    display: 'block',
    resize: 'vertical',
    marginBottom: '0.4em'
  };
  
  const errorTextStyles: CSS.Properties = {
    color: 'red',
    padding: '0.2em'
  };
  
  /* Note on interfacing with extra data.
  The currentComment will be overwritten by parent refreshing from new data. 
  -Either: Dump in redux store / localstorage.
  -Get a ref to the element from the parent, then request it for data, update and restore it.
  -This WILL cause the focus on the textArea to be lost 
   because it will be re-rendered by the parent component.
  */
  

    //@ts-ignore
    function CollapsedComment(props: { comment: IComment, expandComment: (IComment) => void }) {
      const { comment, expandComment } = props;
      return (
        <div
          onClick={() => expandComment(comment)}
          style={{
            backgroundColor: 'rgb(37, 53, 69)',
            paddingTop: '0.5em',
            gridColumn: '2'
          }}
        >
          <Divider style={{ borderColor: 'rgba(144, 144, 144, 0.4)' }}></Divider>
        </div>
      );
    }

    //@ts-ignore

    function CommentCard(props: { comment: IComment, editComment: (IComment) => ((any) => void), collapseComment: (IComment) => void,
      isUnsubmittedComment: (c: IComment) => boolean, updatePreviewCommentText: (comment: IComment) => ((e: any) => void),
      cancelWithPrompt: (c: IComment) => ((e: any) => void), confirmSubmit: (c: IComment) => ((e: any) => void) }) {
      const { comment, editComment, collapseComment, isUnsubmittedComment, updatePreviewCommentText, cancelWithPrompt, confirmSubmit } = props;
      const error = /*errorMsgs[id] || */'';
      // const isLoading = loadingStatus[id] || false;
      // Override the comment with the temp edited version.
      const displayComment = comment.meta.editing ? comment.meta.editing : comment;
      const { profilePic, username, text, datetime } = displayComment;
      const isEditing: boolean = comment.meta.editing !== undefined;

      return (
        <Card className="comment" style={commentStyles}>
          <img className="profile-pic" src={profilePic} alt="" style={profilePicStyles}></img>
          <div className="content" style={contentStyles}>
            {
              /* Popover bp-layout="float-right" isn't working */
              !isEditing ? (
                <div style={optionStyles}>
                  <Popover
                    content={
                      <Menu>
                        <MenuItem text="Edit" onClick={editComment(comment)}></MenuItem>
                        {/* <MenuItem text="Delete" onClick={deleteComment(comment)}></MenuItem> */}
                      </Menu>
                    }
                    position={Position.RIGHT_TOP}
                  >
                    <Icon icon="more"></Icon>
                  </Popover>
                </div>
              ) : (
                ''
              )
            }
            <div style={optionStyles}>
              <Icon icon="small-minus" onClick={() => collapseComment(comment)}></Icon>
            </div>
            <span className="username" style={usernameStyles}>
              {username}{' '}
            </span>
            <span className="relative-time" style={relativeTimeStyles}>
              {isUnsubmittedComment(comment) ? 'Preview' : format(new Date(datetime))}
            </span>
            <Markdown className="text" content={text || '(Content preview)'} />
            <div className="error-text" style={errorTextStyles}>
              {error}
            </div>
          </div>
          {isEditing ? (
            <div className="reply-container" style={replyContainerStyles}>
              <textarea
                style={enterMessageStyles}
                placeholder="Write a message..."
                onChange={updatePreviewCommentText(displayComment)}
                defaultValue={text}
              ></textarea>
              <ButtonGroup>
                <Button onClick={cancelWithPrompt(displayComment)}>Cancel</Button>
                <Button
                  intent="success"
                  onClick={confirmSubmit(comment)}
                  // disabled={text.trim().length === 0 || isLoading}
                >
                  Submit
                </Button>
                {
                  // Technically not part of button group, by why not?
/*                   isLoading ? (
                    <div style={{ paddingTop: '0.3em', paddingLeft: '1em' }}>
                      <Spinner size={Spinner.SIZE_SMALL}></Spinner>
                    </div>
                  ) : (
                    ''
                  )*/
                }
              </ButtonGroup>
            </div>
          ) : (
            ''
          )}
        </Card>
      );
    }
  
  export default function Comments(props: CommentsProps) {
    const { comments, commentsAPI } = props;
    // Errors are local.
    // TODO: move errors into CommentsAPI.
    // const [errorMsgs, setErrorMsgs] = React.useState({} as { [id: string]: string });
    // const errorMsgsRef = React.useRef(errorMsgs);
    // errorMsgsRef.current = errorMsgs;
  
    const {
      updateComment,
      removeComment,
      isUnsubmittedComment,
      setEdit,
      mergeEdit,
      cancelEdit,
      collapseComment,
      expandComment
    } = commentsAPI;
  
  
    // ---------------- STATE HELPERS ----------------
  
    // Will be required later to propagate the changes back.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  
    function updatePreviewCommentText(comment: IComment) {
      return function (event: React.ChangeEvent<HTMLTextAreaElement>) {
        const text = event.target.value;
        updateComment({
          ...comment,
          text
        })
      };
    }
  
    // ---------------- CONTROLS ----------------
  
    function cancelWithPrompt(comment: IComment) {
      return function (evt: any) {
        // eslint-disable-next-line no-restricted-globals
        const sure = comment.text.trim() === '' || confirm('Are you sure about that?');
        if (sure) {
          if (isUnsubmittedComment(comment)) {
            removeComment(comment);
          } else {
            cancelEdit(comment);
          }
        }
      };
    }
  
    function confirmSubmit(comment: IComment) {
      return async function (evt: any) {
        // TODO: figure out a method for edits
        // const newComment: IComment = {
        //   ...comment,
        //   datetime: Date.now()
        // };
  
        // // This is to give a spinner to the users.
        // setLoadingStatus({
        //   ...loadingStatus,
        //   [comment.id]: true
        // });
  
        // try {
        //   await sendToServer(newComment); // TODO: STUB FUNCTION, PLEASE UPDATE.
        //   updateComment(newComment);
        //   removeCommentEdit(newComment);
        //   setErrorMsgs(omit(errorMsgs, [comment.id]));
        // } catch (e) {
        //   setErrorMsgs({
        //     ...errorMsgsRef.current,
        //     [comment.id]: e
        //   });
        // } finally {
        //   // Pop quiz: why do we need to ref.current?
        //   setLoadingStatus(omit(loadingStatusRef.current, [comment.id]));
        // }
          console.log('merge edit', comment);
          mergeEdit(comment);
      };
    }
  
    function editComment(comment: IComment) {
      return function (evt: any) {
        // Puts this comment as being updated
        setEdit(comment);
      };
    }
  
    /*function deleteComment(comment: IComment) {
      return async function (evt: any) {
        try {
          await sendToServer(comment);
          removeComment(comment);
          setErrorMsgs(omit(errorMsgs, [comment.id]));
        } catch (e) {
          setErrorMsgs({
            ...errorMsgsRef.current,
            [comment.id]: e
          });
        }
      };
    }*/
  
    const setCollapseAll = React.useCallback( (status: boolean) => {
      if(status) {
        collapseComment(...comments);
      } else {
        expandComment(...comments);
      }
    },[comments, collapseComment, expandComment]);
  
    // ----------------- RENDERING -----------------
    const isCollapsed = some(comments, c => c.meta.isCollapsed);

    return (
      <div className="comments-container" 
        style={commentsContainerStyles}>
        <div
          className="gutter-controls"
          style={{ float: 'left' }}
          onClick={() => setCollapseAll(!isCollapsed)}
        >
          <Icon icon={isCollapsed ? 'small-plus' : 'small-minus'}></Icon>
        </div>
        {comments.map(comment => {
          const { id } = comment;
          const { isCollapsed } = comment.meta;
          if (isCollapsed) {
            return (<CollapsedComment comment={comment} key={id} expandComment={expandComment} />)
          }
          return (
            <CommentCard
              comment={comment}
              key={id}
              editComment={editComment}
              collapseComment={collapseComment}
              isUnsubmittedComment={isUnsubmittedComment}
              updatePreviewCommentText={updatePreviewCommentText}
              cancelWithPrompt={cancelWithPrompt}
              confirmSubmit={confirmSubmit}
            />
          );
        })}
      </div>
    );
  }