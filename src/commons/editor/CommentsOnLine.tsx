// This is a wrapper for the comments object.
// This is because the useComments hook cannot be used inside React Class style objects.


import { Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import controlButton from "../ControlButton";
import Comments from "./Comments";
import { useComments } from "./CommentsAPI";


type StateProps = {
    showAddComment?: boolean
} & (AssessmentProps | SubmissionProps);

interface AssessmentProps {
    assessmentId: number;
    questionId: number;
    lineNum: number;
}

interface SubmissionProps {
    submissionId: number;
    questionId: number;
    lineNum: number;
}


export default function CommentsOnLine(props: StateProps) {
    const { lineNum } = props;
    const commentsAPI = useComments(props);
    const commentsOnLine = commentsAPI.comments[props.lineNum] || [];

    const isDisabled = false;
    const addCommentButtonOpts = {
        intent: Intent.NONE
    }
    return (<div>
        <Comments
            comments={commentsOnLine}
            commentsAPI={commentsAPI}
        ></Comments>
        {props.showAddComment ? 
        controlButton(
            'Add comment',
            IconNames.COMMENT,
            () => { commentsAPI.createEmptyComment(lineNum) },
            addCommentButtonOpts,
            isDisabled
          )
        : ''}
    </div>)
}