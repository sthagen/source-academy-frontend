import { keyBy } from 'lodash';
import { Reducer } from 'redux';
import { Grading } from 'src/features/grading/GradingTypes';

import { defaultSession } from '../application/ApplicationTypes';
import { SessionState } from '../application/types/SessionTypes';
import { Assessment } from '../assessment/AssessmentTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { IComment, IComments } from './CommentsAPI';
import {
  ADD_COMMENT_ASSESSMENT,
  ADD_COMMENT_SUBMISSION,
  REMOVE_COMMENT_ASSESSMENT,
  REMOVE_COMMENT_SUBMISSION,
  UPDATE_COMMENT_ASSESSMENT,
  UPDATE_COMMENT_SUBMISSION
} from './CommentTypes';

// I really never want to write code like this again.
export const CommentsReducer: Reducer<SessionState> = (
  state = defaultSession,
  action: SourceActionType
) => {
  switch (action.type) {
    case ADD_COMMENT_SUBMISSION: {
      const { submissionId, questionId, lineNum, comment } = action.payload;
      const newGradings = new Map(state.gradings);
      const oldGrading: Grading = state.gradings.get(submissionId)!;
      const oldComments = oldGrading[questionId].comments || {};
      const newComments: IComments = {
        ...oldComments,
        [lineNum]: [...(oldComments[lineNum] || []), comment]
      };
      newGradings.set(
        submissionId,
        oldGrading.map((gradingQuestion, qId) => {
          if (qId === questionId) {
            return {
              ...gradingQuestion,
              comments: newComments
            };
          }
          return gradingQuestion;
        })
      );
      return {
        ...state,
        gradings: newGradings
      };
    }
    case ADD_COMMENT_ASSESSMENT: {
      const { assessmentId, questionId, lineNum, comment } = action.payload;
      const newAssessments = new Map(state.assessments);
      const oldAssessment: Assessment = state.assessments.get(assessmentId)!;
      const oldComments = oldAssessment.questions[questionId].comments || {};
      const newComments: IComments = {
        ...oldComments,
        [lineNum]: [...(oldComments[lineNum] || []), comment]
      };
      newAssessments.set(assessmentId, {
        ...oldAssessment,
        questions: {
          ...oldAssessment.questions,
          [questionId]: {
            ...oldAssessment.questions[questionId],
            comments: newComments
          }
        }
      });
      return {
        ...state,
        assessments: newAssessments
      };
    }
    case UPDATE_COMMENT_SUBMISSION: {
      const { submissionId, questionId, lineNum, comments } = action.payload;
      const commentsById = keyBy(comments, c => c.id);
      const newGradings = new Map(state.gradings);
      const oldGrading: Grading = state.gradings.get(submissionId)!;
      const oldComments = oldGrading[questionId].comments || {};
      const oldCommentsAtLine = oldComments[lineNum] || [];
      const newComments: IComment[] = oldCommentsAtLine.map(cComment => {
        if (cComment.id in commentsById) {
          return commentsById[cComment.id];
        } else {
          return cComment;
        }
      });
      newGradings.set(
        submissionId,
        oldGrading.map((gradingQuestion, qId) => {
          if (qId === questionId) {
            return {
              ...gradingQuestion,
              comments: {
                ...gradingQuestion.comments,
                [lineNum]: newComments
              }
            };
          }
          return gradingQuestion;
        })
      );
      return {
        ...state,
        gradings: newGradings
      };
    }
    case UPDATE_COMMENT_ASSESSMENT: {
      const { assessmentId, questionId, lineNum, comments } = action.payload;
      const commentsById = keyBy(comments, c => c.id);
      const newAssessments = new Map(state.assessments);
      const oldAssessment: Assessment = state.assessments.get(assessmentId)!;
      const oldComments = oldAssessment.questions[questionId].comments || {};
      const oldCommentsAtLine = oldComments[lineNum] || [];
      const newComments: IComment[] = oldCommentsAtLine.map(cComment => {
        if (cComment.id in commentsById) {
          return commentsById[cComment.id];
        } else {
          return cComment;
        }
      });
      newAssessments.set(assessmentId, {
        ...oldAssessment,
        questions: {
          ...oldAssessment.questions,
          [questionId]: {
            ...oldAssessment.questions[questionId],
            comments: {
              ...oldAssessment.questions[questionId].comments,
              [lineNum]: newComments
            }
          }
        }
      });
      return {
        ...state,
        assessments: newAssessments
      };
    }
    case REMOVE_COMMENT_SUBMISSION: {
      const { submissionId, questionId, lineNum, commentId } = action.payload;
      const newGradings = new Map(state.gradings);
      const oldGrading: Grading = state.gradings.get(submissionId)!;
      const comments = { ...oldGrading[questionId].comments };
      const oldCommentsAtLine = comments[lineNum] || [];
      const newCommentsAtLine: IComment[] = oldCommentsAtLine.filter(
        comment => comment.id !== commentId
      );
      delete comments[lineNum]; // Guarantees line removal if it is empty.

      if (newCommentsAtLine.length > 0) {
        comments[lineNum] = newCommentsAtLine;
      }
      newGradings.set(
        submissionId,
        oldGrading.map((gradingQuestion, qId) => {
          if (qId === questionId) {
            return {
              ...gradingQuestion,
              comments
            };
          }
          return gradingQuestion;
        })
      );
      return {
        ...state,
        gradings: newGradings
      };
    }
    case REMOVE_COMMENT_ASSESSMENT: {
      const { assessmentId, questionId, lineNum, commentId } = action.payload;
      const newAssessments = new Map(state.assessments);
      const oldAssessment: Assessment = state.assessments.get(assessmentId)!;
      const comments = { ...oldAssessment.questions[questionId].comments };
      const oldCommentsAtLine = comments[lineNum] || [];
      const newCommentsAtLine: IComment[] = oldCommentsAtLine.filter(
        comment => comment.id !== commentId
      );
      delete comments[lineNum];

      if (newCommentsAtLine.length > 0) {
        comments[lineNum] = newCommentsAtLine;
      }

      newAssessments.set(assessmentId, {
        ...oldAssessment,
        questions: {
          ...oldAssessment.questions,
          [questionId]: {
            ...oldAssessment.questions[questionId],
            comments
          }
        }
      });
      return {
        ...state,
        assessments: newAssessments
      };
    }
    default:
      console.error('Unknown action type in', action);
      return state;
  }
};
