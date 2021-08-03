import { HTMLTable, Text } from '@blueprintjs/core';
import * as React from 'react';

import CommentsOnLine from '../editor/CommentsOnLine';
import { getPrettyDate } from '../utils/DateHelper';

type AssessmentWorkspaceGradingResultProps = StateProps;

type StateProps = {
  graderName: string;
  gradedAt: string;
  xp: number;
  grade: number;
  maxGrade: number;
  maxXp: number;
  assessmentId: number;
  questionId: number;
};

class AssessmentWorkspaceGradingResult extends React.Component<
  AssessmentWorkspaceGradingResultProps,
  {}
> {
  public render() {
    return (
      <div className="GradingResult">
        <div className="grading-result-table">
          <HTMLTable>
            <tbody>
              <tr>
                <th>Grade:</th>
                <td>
                  <Text>
                    {this.props.grade} / {this.props.maxGrade}
                  </Text>
                </td>
              </tr>

              <tr>
                <th>XP:</th>
                <td>
                  <Text>
                    {this.props.xp} / {this.props.maxXp}
                  </Text>
                </td>
              </tr>

              <tr>
                <th>Comments:</th>
                <td>
                  {/* Would like to put it here, but it's ugly */}
                </td>
              </tr>
            </tbody>
          </HTMLTable>

          {<CommentsOnLine 
              assessmentId={this.props.assessmentId}
              questionId={this.props.questionId}
              lineNum={-1}
              showAddComment={true}
            ></CommentsOnLine>
          }

          <br />

          <div className="grading-result-info">
            <Text>
              Graded by <b>{this.props.graderName}</b> on {getPrettyDate(this.props.gradedAt)}
            </Text>
          </div>
        </div>
      </div>
    );
  }
}

export default AssessmentWorkspaceGradingResult;
