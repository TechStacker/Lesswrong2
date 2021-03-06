import { Components, registerComponent, getFragment, withMessages, getSetting } from 'meteor/vulcan:core';
import React from 'react';
import PropTypes from 'prop-types';
import { Comments } from '../../lib/collections/comments';
import { FormattedMessage } from 'meteor/vulcan:i18n';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';
import withUser from '../common/withUser'

const styles = theme => ({
  answersForm: {
    maxWidth:650,
    paddingBottom: theme.spacing.unit*4,
    [theme.breakpoints.down('md')]: {
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  formButton: {
    paddingBottom: "2px",
    fontSize: "16px",
    marginLeft: "5px",
    "&:hover": {
      background: "rgba(0,0,0, 0.05)",
    },
    color: theme.palette.secondary.main,
    float: "right"
  },
})

const FormGroupComponent = (props) => {
  return <React.Fragment>
    {props.fields.map(field => (
      <Components.FormComponent
        key={field.name}
        disabled={props.disabled}
        {...field}
        errors={props.errors}
        throwError={props.throwError}
        currentValues={props.currentValues}
        updateCurrentValues={props.updateCurrentValues}
        deletedValues={props.deletedValues}
        addToDeletedValues={props.addToDeletedValues}
        clearFieldErrors={props.clearFieldErrors}
        formType={props.formType}
        currentUser={props.currentUser}
      />
    ))}
  </React.Fragment>
}

const NewAnswerForm = ({post, classes, flash, currentUser}) => {

  const SubmitComponent = ({submitLabel = "Submit"}) => {
    return <div className={classes.submit}>
      <Button
        type="submit"
        className={classNames(classes.formButton)}
        onClick={(ev) => {
          if (!currentUser) {
            const isAF = getSetting('forumType') === 'AlignmentForum';
            const message = (isAF
              ? "Log in or go to LessWrong to submit your answer."
              : "Log in to submit your answer."
            );
            flash({messageString: message});
            ev.preventDefault();
          }
        }}
      >
        {submitLabel}
      </Button>
    </div>
  }

  const prefilledProps = {
    postId: post._id,
    answer: true,
    af: Comments.defaultToAlignment(currentUser, post),
  }
  const { SmartForm } = Components
  
  if (currentUser && !Comments.options.mutations.new.check(currentUser, prefilledProps)) {
    return <FormattedMessage id="users.cannot_comment"/>;
  }
  
  return (
    <div className={classes.answersForm}>
      <SmartForm
        collection={Comments}
        GroupComponent={FormGroupComponent}
        SubmitComponent={SubmitComponent}
        mutationFragment={getFragment('CommentsList')}
        prefilledProps={prefilledProps}
        alignmentForumPost={post.af}
        layout="elementOnly"
        addFields={currentUser?[]:["contents"]}
      />
    </div>
  )
};

NewAnswerForm.propTypes = {
  classes: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  prefilledProps: PropTypes.object,
  flash: PropTypes.func,
};

registerComponent('NewAnswerForm', NewAnswerForm, withMessages, withUser, withStyles(styles, {name:"NewAnswerForm"}));
