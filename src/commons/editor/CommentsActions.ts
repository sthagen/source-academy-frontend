// Maximum boiler plate
import { action } from 'typesafe-actions';

import {
  ADD_COMMENT_ASSESSMENT,
  ADD_COMMENT_SUBMISSION,
  REMOVE_COMMENT_ASSESSMENT,
  REMOVE_COMMENT_SUBMISSION,
  UPDATE_COMMENT_ASSESSMENT,
  UPDATE_COMMENT_SUBMISSION
} from './CommentTypes';
import { IComment } from './EditorTypes';

// Add 1 comment in a given line lineNumber
export const addCommentAssessment = (
  assessmentId: number,
  questionId: number,
  lineNum: number,
  comment: IComment
) => action(ADD_COMMENT_ASSESSMENT, { assessmentId, questionId, lineNum, comment });

// Add 1 comment in a given line lineNumber
export const addCommentSubmission = (
  submissionId: number,
  questionId: number,
  lineNum: number,
  comment: IComment
) => action(ADD_COMMENT_SUBMISSION, { submissionId, questionId, lineNum, comment });

export const updateCommentsAssessment = (
  assessmentId: number,
  questionId: number,
  lineNum: number,
  comments: IComment[]
) => action(UPDATE_COMMENT_ASSESSMENT, { assessmentId, questionId, lineNum, comments });

export const updateCommentsSubmission = (
  submissionId: number,
  questionId: number,
  lineNum: number,
  comments: IComment[]
) => action(UPDATE_COMMENT_SUBMISSION, { submissionId, questionId, lineNum, comments });

// Remove 1 comment in a given line lineNumber
export const removeCommentAssessment = (
  assessmentId: number,
  questionId: number,
  lineNum: number,
  commentId: string
) => action(REMOVE_COMMENT_ASSESSMENT, { assessmentId, questionId, lineNum, commentId });

// Remove 1 comment in a given line lineNumber
export const removeCommentSubmission = (
  submissionId: number,
  questionId: number,
  lineNum: number,
  commentId: string
) => action(REMOVE_COMMENT_SUBMISSION, { submissionId, questionId, lineNum, commentId });
