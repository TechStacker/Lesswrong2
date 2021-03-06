import { registerComponent, Components } from 'meteor/vulcan:core';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { commentBodyStyles, postBodyStyles } from '../../themes/stylePiping'
import withHover from '../common/withHover';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import withErrorBoundary from '../common/withErrorBoundary';
import { isMobile } from '../../lib/modules/utils/isMobile.js'
import { commentExcerptFromHTML } from '../../lib/editor/ellipsize'

const styles = theme => ({
  root: {
    position: "relative",
    cursor: "pointer",
  },
  commentInfo: {
    backgroundColor: "#f0f0f0",
    '&:hover': {
      backgroundColor: "#e0e0e0",
    },
    ...commentBodyStyles(theme),
    marginTop: 0,
    marginBottom: 0,
    paddingRight: theme.spacing.unit,
    color: "rgba(0,0,0,.6)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  username: {
    display:"inline-block",
    padding: 5,
    '& a, & a:hover': {
      color: "rgba(0,0,0,.87)",
    },
    fontWeight: 600,
  },
  karma: {
    display:"inline-block",
    textAlign: "center",
    width: 30,
    padding: 5,
  },
  date: {
    display:"inline-block",
    padding: 5,
    paddingRight: theme.spacing.unit,
    paddingLeft: theme.spacing.unit
  },
  truncatedHighlight: {
    padding: 5,
    ...commentBodyStyles(theme),
    marginTop: 0,
    marginBottom: 0,
    '& *': {
      display: "inline"
    },
    '& blockquote, & br, & figure, & img': {
      display: "none"
    },
    '& p': {
      marginRight: 6
    },
    '& strong': {
      fontWeight: theme.typography.body2.fontWeight
    }
  },
  highlight: {
    ...commentBodyStyles(theme),
    backgroundColor: "white",
    padding: theme.spacing.unit*1.5,
    width: 625,
    position: "absolute",
    top: "calc(100% - 20px)",
    right: 0,
    zIndex: 5,
    border: "solid 1px rgba(0,0,0,.1)",
    boxShadow: "0 0 10px rgba(0,0,0,.2)",
    maxHeight: 500,
    overflow: "hidden",
    '& img': {
      maxHeight: "200px"
    }
  },
  isAnswer: {
    ...postBodyStyles(theme),
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    '& a, & a:hover': {
      textShadow:"none",
      color: theme.typography.body1.color,
      backgroundImage: "none"
    }
  },
  odd: {
    backgroundColor: "white",
    '&:hover': {
      backgroundColor: "#f3f3f3",
    }
  },
})

const SingleLineComment = ({comment, classes, nestingLevel, hover}) => {
  const { voteCount, baseScore } = comment
  const { CommentBody, ShowParentComment } = Components
  
  const singleLineHtml = commentExcerptFromHTML(comment)
  const displayHoverOver = hover && (comment.baseScore > -5) && !isMobile()

  return (
    <div className={classes.root}>
      <div className={classNames(classes.commentInfo, {[classes.isAnswer]: comment.answer, [classes.odd]:((nestingLevel%2) !== 0)})}>
        <ShowParentComment comment={comment} nestingLevel={nestingLevel} />
        <Tooltip title={`This comment has ${baseScore} karma (${voteCount} ${voteCount == 1 ? "Vote" : "Votes"})`} placement="bottom">
          <span className={classes.karma}>

            {baseScore || 0}
          </span>
        </Tooltip>
        <span className={classes.username}>
          {comment.user.displayName}
        </span>
        <span className={classes.date}>
          <Components.FormatDate date={comment.postedAt}/>
        </span>
        {(comment.baseScore > -5) && <span className={classes.truncatedHighlight} dangerouslySetInnerHTML={{__html: singleLineHtml}} />}      </div>
      {displayHoverOver && <span className={classNames(classes.highlight)}>
        <CommentBody truncated comment={comment}/>
      </span>}
    </div>
  )
};

registerComponent('SingleLineComment', SingleLineComment, withStyles(styles, {name:"SingleLineComment"}), withHover, withErrorBoundary);
