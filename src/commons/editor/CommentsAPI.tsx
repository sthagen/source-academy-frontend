import { keyBy, omit } from 'lodash';
import * as React from 'react';
import { useSelector } from "react-redux";
import { v1 as uuidv1 } from 'uuid';

import { OverallState } from '../application/ApplicationTypes';

export interface IComment {
    id: string;
    // TODO: Reference user differently.
    userId: string;
    username: string;
    profilePic: string;
    linenum: number;
    text: string;
    datetime: number; // if this is infinity, means not submitted yet!
    // Infinity so it gets sorted to bottom.
    meta: ICommentMeta;
}

export interface ICommentMeta {
    editing?: IComment; // Stores a copy which is being edited.
    isCollapsed: boolean;
    error?: string;
}


export interface CommentAPI {
    comments: { [id: string]: IComment },
    loadComments: (assessmentId: string) => Promise<{ [id: string]: IComment }>,
    createEmptyComment: (row: number) => void;
    updateComment: (...comments: IComment[]) => void;
    removeComment: (...comments: IComment[]) => void;
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

// This is because this is a self-contained abstraction which is meant to be loaded into components.
export function useComments(): CommentAPI {
    const [comments, setComments] = React.useState({} as { [id: string]: IComment });

    // const [comments, setComments] = React.useState({} as { [id: string]: IComment });
    const { name, userId, profilePic } = useSelector<OverallState,StateProps>(state => ({
        userId: state.session.userId,
        profilePic: state.session.profilePic,
        name: state.session.name
    }));

    const updateCommentRaw = React.useCallback(
        (...updatedComments: IComment[]) => {
            const updatedCommentsById = keyBy(updatedComments, 'id');
            setComments({
                ...(comments),
                ...updatedCommentsById
            });
        },
        [comments]
    );

    // STUB FUNCTION
    const loadComments: (assessmentId: string) => Promise<{ [id: string]: IComment }> =
        React.useCallback(
            (assessmentId: string) =>
                new Promise((resolve, reject) => {
                    if (Math.random() < 0.5) {
                        setTimeout(() => resolve(comments), 1000);
                    } else {
                        setTimeout(() => reject('(Test error message) Some error occured, please try again'), 1000);
                    }
                })

            , [comments]);

    // TODO: update details accordingly.
    const createEmptyComment = React.useCallback(
        row => {
            const id = uuidv1();
            const newComment: IComment = {
                id,
                userId: ""+userId,
                username: name!,
                profilePic: profilePic!, 
                linenum: row,
                text: '',
                datetime: Infinity,
                // Not submitted yet!
                // Will sort to the end.
                meta: {
                    isCollapsed: false,
                }
            };
            newComment.meta.editing = newComment; // set to editing by default
            setComments({
                ...(comments),
                [id]: newComment
            });
        },
        [comments, name, profilePic, userId]
    );

    // Need a way to update the edit transparently.
    // If it's editing, replace the edit-comment instead.
    // Assert that the editing isn't nested.
    const updateComment = React.useCallback(
        (...newComments: IComment[]) => {
            updateCommentRaw(...(newComments.map(comment => {
                const original = (comments)[comment.id];

                if (!original.meta.editing) {
                    return comment;
                } else {
                    return {
                        ...original,
                        meta: {
                            ...original.meta,
                            editing: comment,
                        }
                    }
                }

            })))
        }, [comments, updateCommentRaw]
    );

    const removeComment = React.useCallback(
        (...commentsToRemove: IComment[]) => {
            const ids = commentsToRemove.map(c => c.id);
            setComments(omit(comments, ids));
            // Also remove from being edited.
        },
        [comments]
    );

    const setEdit = React.useCallback(
        (...comments: IComment[]) => {
            updateCommentRaw(...(comments.map(comment => ({
                ...comment,
                meta: {
                    ...comment.meta,
                    editing: comment,
                }
            }))))
        }, [updateCommentRaw]
    );

    const cancelEdit = React.useCallback(
        (...comments: IComment[]) => {
            updateCommentRaw(...(comments.map(comment => ({
                ...comment,
                meta: {
                    ...comment.meta,
                    editing: undefined,
                }
            }))))
        }, [updateCommentRaw]
    );

    // Replaces the comment with the edited variant.
    // TODO: send to server.
    const mergeEdit = React.useCallback(
        (...comments: IComment[]) => {
            updateCommentRaw(...(comments.map(comment => ({
                ...comment.meta.editing!,
                meta: {
                    ...comment.meta,
                    editing: undefined,
                }
            }))));
        }, [updateCommentRaw]
    )


    const collapseComment = React.useCallback(
        (...comments: IComment[]) => {
            updateCommentRaw(...(comments.map(comment => ({
                ...comment,
                meta: {
                    ...comment.meta,
                    isCollapsed: true,
                }
            }))));
        }, [updateCommentRaw]
    )

    const expandComment = React.useCallback(
        (...comments: IComment[]) => {
            updateCommentRaw(...(comments.map(comment => ({
                ...comment,
                meta: {
                    ...comment.meta,
                    isCollapsed: false,
                }
            }))));
        }, [updateCommentRaw]
    )

    const isUnsubmittedComment = (comment: IComment) =>
        comment.datetime === Infinity;



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