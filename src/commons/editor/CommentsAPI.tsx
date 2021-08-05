import { find } from 'lodash';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v1 as uuidv1 } from 'uuid';

import { OverallState } from '../application/ApplicationTypes';
import {
  addCommentAssessment,
  addCommentSubmission,
  removeCommentAssessment,
  removeCommentSubmission,
  updateCommentsAssessment,
  updateCommentsSubmission
} from './CommentsActions';
import { IComment, IComments } from './EditorTypes';
import { CommentsStateProps } from './UseComments';

export type { IComment, IComments } from './EditorTypes';

export interface CommentAPI {
  comments: IComments;
  loadComments: (assessmentId: string) => Promise<IComments>;
  createEmptyComment: (row: number) => void;
  updateComment: (comment: IComment) => void;
  removeComment: (comment: IComment) => void;
  setEdit: (comment: IComment) => void;
  cancelEdit: (comment: IComment) => void;
  mergeEdit: (comment: IComment) => void;
  collapseComment: (...comments: IComment[]) => void;
  expandComment: (...comments: IComment[]) => void;
  isUnsubmittedComment: (comment: IComment) => boolean;
}

// Mock function, please replace.
// function sendToServer(comment: IComment) {
//     return new Promise<{ [id: string]: IComment }>((resolve, reject) => {
//         if (Math.random() < 0.5) {
//             setTimeout(resolve, 1000);
//         } else {
//             setTimeout(() => reject('(Test error message) Some error occured, please try again'), 1000);
//         }
//     });
// }

// REST API changes.
// GET /assessments/{assessmentId}/
// Will return comments in the following format:
// comments: { [id: string]: IComment }
// comments are within questions.
// The following fields need to be expanded in:
// username: string;
// profilePic: string;

// PUT /assessments/{assessmentId}/{questionId}/{commentId}
// body: IComment
// Directly upserts existing comment if and only if the following holds true:
// - The user is either staff or the student doing the assessment.
// - The existing comment (if exists) has the same id as the user.
// Collisions are not supposed to occur, since uuid v1 uses MAC address + timestamp.
// Keep only the following fields:
// id: string;
// userId: string;
// linenum: number;
// text: string;
// datetime: number;

interface StateProps {
  userId?: number;
  profilePic?: string;
  name?: string;
}

const NO_COMMENTS = {} as IComments;

// This is because this is a self-contained abstraction which is meant to be loaded into components.
export function useComments(props: CommentsStateProps): CommentAPI {
  const { questionId, assessmentId, submissionId, disableComments } = props;
  // if assessmentId -> load/store data from state.sessions.assessments.get(assessmentId)
  // if submissionId -> load/store data from state.sessions.gradings.get(submissionId)

  // const [comments, setComments] = React.useState({} as { [id: string]: IComment });
  const comments =
    useSelector<OverallState, IComments | undefined>(state => {
      if (props.assessmentId !== undefined) {
        return state.session.assessments.get(assessmentId!)?.questions[questionId!].comments;
      } else if (submissionId !== undefined) {
        return state.session.gradings.get(submissionId)![questionId!].comments;
      }
      return NO_COMMENTS;
    }) || NO_COMMENTS; // Prevent creation of new
  // @ts-ignore
  const isDisabled = disableComments || (assessmentId === undefined && submissionId === undefined);
  const dispatch = useDispatch();
  // Raw API, purely adjusts data, nothing related to network.
  // Note: All comments should be on the same line!
  // There should be at least 1 comment!
  const updateCommentRaw = React.useCallback(
    (...comments: IComment[]) => {
      if (assessmentId !== undefined) {
        dispatch(
          updateCommentsAssessment(assessmentId, questionId!, comments[0].linenum, comments)
        );
      } else if (submissionId !== undefined) {
        dispatch(
          updateCommentsSubmission(submissionId, questionId!, comments[0].linenum, comments)
        );
      }
    },
    [assessmentId, dispatch, questionId, submissionId]
  );

  const addCommentRaw = React.useCallback(
    (comment: IComment) => {
      if (assessmentId !== undefined) {
        console.log('addCommentAss');
        dispatch(addCommentAssessment(assessmentId, questionId!, comment.linenum, comment));
      } else if (submissionId !== undefined) {
        console.log('addCommentSub');
        dispatch(addCommentSubmission(submissionId, questionId!, comment.linenum, comment));
      }
    },
    [assessmentId, dispatch, questionId, submissionId]
  );

  const removeCommentRaw = React.useCallback(
    (comment: IComment) => {
      if (assessmentId !== undefined) {
        dispatch(removeCommentAssessment(assessmentId, questionId!, comment.linenum, comment.id));
      } else if (submissionId !== undefined) {
        dispatch(removeCommentSubmission(submissionId, questionId!, comment.linenum, comment.id));
      }
    },
    [assessmentId, dispatch, questionId, submissionId]
  );

  // const [comments, setComments] = React.useState({} as { [id: string]: IComment });
  const { name, userId, profilePic } = useSelector<OverallState, StateProps>(state => ({
    userId: state.session.userId,
    profilePic: state.session.profilePic,
    name: state.session.name
  }));

  // const updateCommentRaw = React.useCallback(
  //     (...updatedComments: IComment[]) => {
  //         const updatedCommentsById = keyBy(updatedComments, 'id');
  //         setComments({
  //             ...(comments),
  //             ...updatedCommentsById
  //         });
  //     },
  //     [comments]
  // );

  // STUB FUNCTION
  const loadComments: (assessmentId: string) => Promise<IComments> = React.useCallback(
    (assessmentId: string) =>
      new Promise((resolve, reject) => {
        if (Math.random() < 0.5) {
          setTimeout(() => resolve(comments), 1000);
        } else {
          setTimeout(
            () => reject('(Test error message) Some error occured, please try again'),
            1000
          );
        }
      }),

    [comments]
  );

  // TODO: update details accordingly.
  const createEmptyComment = React.useCallback(
    row => {
      const id = uuidv1();
      const newComment: IComment = {
        id,
        userId: '' + userId,
        username: name!,
        profilePic: profilePic!,
        linenum: row,
        text: '',
        datetime: Infinity,
        // Not submitted yet!
        // Will sort to the end.
        meta: {
          isCollapsed: false
        }
      };
      newComment.meta.editing = newComment; // set to editing by default
      addCommentRaw(newComment);
    },
    [addCommentRaw, name, profilePic, userId]
  );

  // Need a way to update the edit transparently.
  // If it's editing, replace the edit-comment instead.
  // TODO: Assert that the editing isn't nested.
  const updateComment = React.useCallback(
    (comment: IComment) => {
      const original = find(comments[comment.linenum], c => c.id === comment.id)!;
      if (!original.meta.editing) {
        updateCommentRaw(comment);
      } else {
        updateCommentRaw({
          ...original,
          meta: {
            ...original.meta,
            editing: comment
          }
        });
      }
    },
    [comments, updateCommentRaw]
  );

  const removeComment = React.useCallback(
    (commentToRemove: IComment) => {
      removeCommentRaw(commentToRemove);
    },
    [removeCommentRaw]
  );

  const setEdit = React.useCallback(
    (comment: IComment) => {
      updateCommentRaw({
        ...comment,
        meta: {
          ...comment.meta,
          editing: comment
        }
      });
    },
    [updateCommentRaw]
  );

  const cancelEdit = React.useCallback(
    (comment: IComment) => {
      updateCommentRaw({
        ...comment,
        meta: {
          ...comment.meta,
          editing: undefined
        }
      });
    },
    [updateCommentRaw]
  );

  // Replaces the comment with the edited variant.
  // TODO: send to server.
  const mergeEdit = React.useCallback(
    (comment: IComment) => {
      updateCommentRaw({
        ...comment.meta.editing!,
        meta: {
          ...comment.meta,
          editing: undefined
        }
      });
    },
    [updateCommentRaw]
  );

  const collapseComment = React.useCallback(
    (...comments: IComment[]) => {
      updateCommentRaw(
        ...comments.map(c => ({
          ...c,
          meta: {
            ...c.meta,
            isCollapsed: true
          }
        }))
      );
    },
    [updateCommentRaw]
  );

  const expandComment = React.useCallback(
    (...comments: IComment[]) => {
      updateCommentRaw(
        ...comments.map(c => ({
          ...c,
          meta: {
            ...c.meta,
            isCollapsed: false
          }
        }))
      );
    },
    [updateCommentRaw]
  );

  const isUnsubmittedComment = (comment: IComment) => comment.datetime === Infinity;

  return {
    comments,
    loadComments,
    updateComment,
    removeComment,
    setEdit,
    cancelEdit,
    mergeEdit,
    collapseComment,
    expandComment,
    isUnsubmittedComment,
    createEmptyComment
  };
}
