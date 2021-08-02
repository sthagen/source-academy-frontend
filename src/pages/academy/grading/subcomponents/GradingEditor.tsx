import {
  Button,
  Divider,
  H3,
  Intent,
  NumericInput,
  Position,
  Pre
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { ReactMdeProps } from 'react-mde';
import { Prompt } from 'react-router';
import CommentsOnLine from 'src/commons/editor/CommentsOnLine';
import { IComments } from 'src/commons/editor/EditorTypes';

import controlButton from '../../../../commons/ControlButton';
import { getPrettyDate } from '../../../../commons/utils/DateHelper';
import { showSimpleConfirmDialog } from '../../../../commons/utils/DialogHelper';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../../../commons/utils/NotificationsHelper';
import { stringParamToInt } from '../../../../commons/utils/ParamParseHelper';

type GradingEditorProps = DispatchProps & OwnProps;

type GradingSaveFunction = (
  submissionId: number,
  questionId: number,
  gradeAdjustment: number | undefined,
  xpAdjustment: number | undefined,
  comments?: string
) => void;

export type DispatchProps = {
  handleGradingSave: GradingSaveFunction;
  handleGradingSaveAndContinue: GradingSaveFunction;
  handleReautogradeAnswer: (submissionId: number, questionId: number) => void;
};

type OwnProps = {
  solution: number | string | null;
  questionId: number; // grading![questionId].question.id
  realQuestionId: number; //just the questionId 
  submissionId: number;
  initialGrade: number;
  gradeAdjustment: number;
  maxGrade: number;
  initialXp: number;
  xpAdjustment: number;
  maxXp: number;
  studentName: string;
  comments?: IComments;
  graderName?: string;
  gradedAt?: string;
};

/**
 * Keeps track of the current editor state,
 * as well as the grade adjustment in the numeric input.
 *
 * @prop gradeAdjustmentInput a potentially null string which defines the
 *   result for the number grade input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 *
 * @prop xpAdjustmentInput a potentially null string which defines the
 *   result for the number XP input. This property being null
 *   will show the hint text in the NumericInput. This property is a string
 *   so as to allow input such as the '-' character.
 *
 * @prop editorValue the text in the react-mde editor, that will be saved
 *   to a comment displayed below the numerical grade and XP
 *
 * @prop selectedTab the selected tab for the react-mde editor
 *   (either 'write' or 'preview')
 *
 * @prop currentlySaving determines whether the 'You have unsaved changes'
 *   prompt should appear on page navigation, to prevent the
 *   'Save and Continue' button from activating the prompt
 *   in cases where navigation occurs before Redux has
 *   updated the props of the Editor component
 *
 *   This may pose a problem if the user clicks 'Save and Continue'
 *   and the saving process fails. The prompt would no longer
 *   appear although there exist unsaved changes
 */
type State = {
  gradeAdjustmentInput: string | null;
  xpAdjustmentInput: string | null;
  selectedTab: ReactMdeProps['selectedTab'];
  currentlySaving: boolean;
};

const gradingEditorButtonClass = 'grading-editor-button';

class GradingEditor extends React.Component<GradingEditorProps, State> {
  constructor(props: GradingEditorProps) {
    super(props);
    this.state = this.makeInitialState();
  }


  public render() {
    const hasUnsavedChanges = this.hasUnsavedChanges();
    const saveIntent = !this.props.gradedAt || hasUnsavedChanges;
    const saveButtonOpts = {
      intent: saveIntent ? Intent.WARNING : Intent.NONE,
      // intent: Intent.WARNING,
      minimal: !saveIntent,
      // minimal: false,
      className: gradingEditorButtonClass
    };
    const discardButtonOpts = {
      intent: hasUnsavedChanges ? Intent.DANGER : Intent.NONE,
      // intent: Intent.DANGER,
      // minimal: false,
      minimal: !hasUnsavedChanges,
      className: gradingEditorButtonClass
    };
    const saveAndContinueButtonOpts = {
      intent: saveIntent ? Intent.SUCCESS : Intent.NONE,
      // intent: Intent.SUCCESS,
      minimal: !saveIntent,
      className: gradingEditorButtonClass
    };

    // Derived values
    const totalGrade =
      this.props.initialGrade +
      (stringParamToInt(this.state.gradeAdjustmentInput || undefined) || 0);
    const totalXp =
      this.props.initialXp + (stringParamToInt(this.state.xpAdjustmentInput || undefined) || 0);
    const gradePlaceholder = `${this.props.initialGrade > 0 ? '-' : ''}${
      this.props.initialGrade
    } to ${this.props.maxGrade - this.props.initialGrade}`;
    const xpPlaceholder = `${this.props.initialXp > 0 ? '-' : ''}${this.props.initialXp} to ${
      this.props.maxXp - this.props.initialXp
    }`;

    return (
      <div className="GradingEditor">
        {!this.state.currentlySaving && hasUnsavedChanges ? (
          <Prompt message={'You have unsaved changes. Are you sure you want to leave?'} />
        ) : null}

        <div className="grading-editor-header">
          <H3>Currently Grading: {this.props.studentName}</H3>
        </div>
        {this.props.solution !== null ? (
          <div className="grading-editor-marking-scheme">
            <Pre>{this.props.solution.toString()} </Pre>
          </div>
        ) : null}

        <div className="grading-editor-container">
          <div className="grading-editor-grades">
            <div className="autograder-grade">
              <div>Autograder grade:</div>
              <div>
                {`${this.props.initialGrade} / ${this.props.maxGrade}`}{' '}
                <Button
                  icon="refresh"
                  small
                  minimal
                  onClick={this.onClickReautogradeAnswer}
                ></Button>
              </div>
            </div>
            <div className="grade-adjustment">
              <div>Grade adjustment:</div>
              <div>
                <NumericInput
                  className="adjustment-input"
                  onValueChange={this.onGradeAdjustmentInputChange}
                  value={this.state.gradeAdjustmentInput || ''}
                  buttonPosition={Position.RIGHT}
                  fill={true}
                  placeholder={gradePlaceholder}
                  intent={
                    totalGrade < 0 || totalGrade > this.props.maxGrade ? Intent.DANGER : Intent.NONE
                  }
                  min={0 - this.props.initialGrade}
                  max={
                    this.props.maxGrade > this.props.initialGrade
                      ? this.props.maxGrade - this.props.initialGrade
                      : undefined
                  }
                />
              </div>
            </div>
            <div className="final-grade">
              <div>Final grade:</div>
              <div>{`${totalGrade} / ${this.props.maxGrade}`}</div>
            </div>
          </div>
          <div className="grading-editor-xp">
            <div className="autograder-grade">
              <div>Autograder XP:</div>
              <div>{`${this.props.initialXp} / ${this.props.maxXp}`}</div>
            </div>
            <div className="grade-adjustment">
              <div>XP adjustment:</div>
              <div>
                <NumericInput
                  className="adjustment-input"
                  onValueChange={this.onXpAdjustmentInputChange}
                  value={this.state.xpAdjustmentInput || ''}
                  buttonPosition={Position.RIGHT}
                  fill={true}
                  placeholder={xpPlaceholder}
                  intent={totalXp < 0 || totalXp > this.props.maxXp ? Intent.DANGER : Intent.NONE}
                  min={0 - this.props.initialXp}
                  max={
                    this.props.maxXp > this.props.initialXp
                      ? this.props.maxXp - this.props.initialXp
                      : undefined
                  }
                />
              </div>
            </div>
            <div className="final-grade">
              <div>Final XP:</div>
              <div>{`${totalXp} / ${this.props.maxXp}`}</div>
            </div>
          </div>
        </div>

        <CommentsOnLine 
          submissionId={this.props.submissionId}
          questionId={this.props.realQuestionId}
          lineNum={-1}
          showAddComment={true}
        ></CommentsOnLine>

        {this.state.selectedTab === 'write' && (
          <div className="grading-editor-draft-buttons">
            <div className="grading-editor-save-button">
              {controlButton(
                'Save Changes',
                IconNames.FLOPPY_DISK,
                this.validateGradesBeforeSave(this.props.handleGradingSave),
                saveButtonOpts
              )}
            </div>
            <div className="grading-editor-discard-button">
              {controlButton(
                'Discard Changes',
                IconNames.TRASH,
                this.discardChanges,
                discardButtonOpts
              )}
            </div>
          </div>
        )}
        <div className="grading-editor-save-continue-button">
          {controlButton(
            'Save and Continue',
            IconNames.UPDATED,
            this.validateGradesBeforeSave(this.onClickSaveAndContinue),
            saveAndContinueButtonOpts
          )}
        </div>
        {this.props.graderName && this.props.gradedAt && (
          <>
            <Divider />
            <div className="grading-editor-last-graded-details">
              Last edited by <b>{this.props.graderName}</b> on {getPrettyDate(this.props.gradedAt)}
            </div>
          </>
        )}
      </div>
    );
  }

  public componentDidUpdate(prevProps: GradingEditorProps, prevState: State) {
    if (
      prevProps.submissionId !== this.props.submissionId ||
      prevProps.questionId !== this.props.questionId
    ) {
      this.setState(this.makeInitialState());
    }
  }

  /**
   * Makes sure that the Grade and XP values are permissible before
   * returning the relevant saving function (for the 'Save Draft'
   * and 'Submit and Continue' buttons)
   */
  private validateGradesBeforeSave =
    (handleSaving: GradingSaveFunction): (() => void) =>
    () => {
      const gradeAdjustmentInput =
        stringParamToInt(this.state.gradeAdjustmentInput || undefined) || undefined;
      const grade = this.props.initialGrade + (gradeAdjustmentInput || 0);
      const xpAdjustmentInput =
        stringParamToInt(this.state.xpAdjustmentInput || undefined) || undefined;
      const xp = this.props.initialXp + (xpAdjustmentInput || 0);
      if (grade < 0 || grade > this.props.maxGrade) {
        showWarningMessage(
          `Grade ${grade.toString()} is out of bounds. Maximum grade is ${this.props.maxGrade.toString()}.`
        );
        return;
      } else if (xp < 0 || xp > this.props.maxXp) {
        showWarningMessage(
          `XP ${xp.toString()} is out of bounds. Maximum xp is ${this.props.maxXp.toString()}.`
        );
        return;
      } else {
        handleSaving(
          this.props.submissionId,
          this.props.questionId,
          gradeAdjustmentInput,
          xpAdjustmentInput
        );
      }
    };

  /**
   * Sets the state currentlySaving to true to disable
   * the 'You have unsaved changes' prompt
   */
  private onClickSaveAndContinue: GradingSaveFunction = (
    submissionId: number,
    questionId: number,
    gradeAdjustment: number | undefined,
    xpAdjustment: number | undefined,
    comments?: string
  ) => {
    const callback = (): void => {
      this.props.handleGradingSaveAndContinue(
        submissionId,
        questionId,
        gradeAdjustment,
        xpAdjustment,
        comments!
      );
    };
    this.setState({ ...this.state, currentlySaving: true }, callback);
  };

  private onClickReautogradeAnswer = async () => {
    const confirm = await showSimpleConfirmDialog({
      contents: (
        <>
          <p>Reautograde this answer?</p>
          <p>Note: manual adjustments will be reset to 0.</p>
        </>
      ),
      positiveLabel: 'Reautograde',
      positiveIntent: 'danger'
    });
    if (confirm) {
      this.props.handleReautogradeAnswer(this.props.submissionId, this.props.questionId);
    }
  };

  /**
   * Send a warning prompt that loading from a local draft
   * will overwrite any unsaved changes
   */
  private discardChanges = (): void => {
    if (!this.hasUnsavedChanges() || window.confirm('This will reset the editor. Are you sure?')) {
      this.setState(
        {
          ...this.state,
          gradeAdjustmentInput: this.props.gradeAdjustment!.toString(),
          xpAdjustmentInput: this.props.xpAdjustment!.toString(),
          //TODO: re-implement the editor text box editorValue: this.props.comments || ''
        },
        () => {
          showSuccessMessage('Discarded!', 1000);
        }
      );
    }
  };

  /**
   * Handles changes in the grade NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  private onGradeAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    this.setState({
      ...this.state,
      gradeAdjustmentInput: valueAsString,
      xpAdjustmentInput: String(
        Math.round((valueAsNumber / this.props.maxGrade) * this.props.maxXp) || 0
      )
    });
  };

  /**
   * Handles changes in the XP NumericInput, and updates the local State.
   *
   * @param valueAsNumber an unused parameter, as we use strings for the input. @see State
   * @param valueAsString a string that contains the input. To be parsed by another function.
   */
  private onXpAdjustmentInputChange = (valueAsNumber: number, valueAsString: string | null) => {
    this.setState({
      ...this.state,
      xpAdjustmentInput: valueAsString
    });
  };


  private hasUnsavedChanges = () => {
    const gradeAdjustmentInput = stringParamToInt(this.state.gradeAdjustmentInput || undefined);
    const xpAdjustmentInput = stringParamToInt(this.state.xpAdjustmentInput || undefined);
    console.log(this.props.gradedAt, this.props.graderName)
    return (
      this.props.gradeAdjustment !== gradeAdjustmentInput ||
      this.props.xpAdjustment !== xpAdjustmentInput
    );
  };


  private makeInitialState(): State {
    return {
      gradeAdjustmentInput: this.props.gradeAdjustment.toString(),
      xpAdjustmentInput: this.props.xpAdjustment.toString(),
      selectedTab: 'write',
      currentlySaving: false
    };
  }
}

export default GradingEditor;
