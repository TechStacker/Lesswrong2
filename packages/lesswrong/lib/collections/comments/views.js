import { getSetting } from 'meteor/vulcan:core'
import { viewFieldNullOrMissing } from 'meteor/vulcan:lib';
import { Comments } from './index';
import moment from 'moment';
import { ensureIndex,  combineIndexWithDefaultViewIndex} from '../../collectionUtils';

// Auto-generated indexes from production

Comments.addDefaultView(terms => {
  const validFields = _.pick(terms, 'userId');
  const alignmentForum = getSetting('forumType') === 'AlignmentForum' ? {af: true} : {}
  return ({
    selector: {
      $or: [{$and: [{deleted: true}, {deletedPublic: true}]}, {deleted: false}],
      hideAuthor: terms.userId ? false : undefined,
      ...validFields,
      ...alignmentForum,
    },
    options: {
      sort: {postedAt: -1},
    }
  });
})

export function augmentForDefaultView(indexFields)
{
  return combineIndexWithDefaultViewIndex({
    viewFields: indexFields,
    prefix: {},
    suffix: {deleted:1, deletedPublic:1, hideAuthor:1, userId:1, af:1},
  });
}

// Most common case: want to get all the comments on a post, filter fields and
// `limit` affects it only minimally. Best handled by a hash index on `postId`.
ensureIndex(Comments, { postId: "hashed" });

// For the user profile page
ensureIndex(Comments, { userId:1, postedAt:-1 });

Comments.addView("commentReplies", function (terms) {
  return {
    selector: {
      parentCommentId: terms.parentCommentId,
    },
    options: {
      sort: {postedAt: -1}
    }
  }
})
ensureIndex(Comments, { parentCommentId: "hashed" });

Comments.addView("postCommentsDeleted", function (terms) {
  return {
    selector: {
      $or: null,
      deleted: null,
      postId: terms.postId
    },
    options: {sort: {deletedDate: -1, baseScore: -1, postedAt: -1}}
  };
});

Comments.addView("allCommentsDeleted", function (terms) {
  return {
    selector: {
      $or: null,
      deleted: true,
    },
    options: {sort: {deletedDate: -1, postedAt: -1, baseScore: -1 }}
  };
});

Comments.addView("postCommentsTop", function (terms) {
  return {
    selector: {
      postId: terms.postId,
      parentAnswerId: viewFieldNullOrMissing,
      answer: false,
    },
    options: {sort: {deleted: 1, baseScore: -1, postedAt: -1}},

  };
});
ensureIndex(Comments,
  augmentForDefaultView({ postId:1, parentAnswerId:1, answer:1, deleted:1, baseScore:-1, postedAt:-1 }),
  { name: "comments.top_comments" }
);

Comments.addView("postCommentsOld", function (terms) {
  return {
    selector: {
      postId: terms.postId,
      parentAnswerId: viewFieldNullOrMissing,
      answer: false,
    },
    options: {sort: {deleted: 1, postedAt: 1}},
    parentAnswerId: viewFieldNullOrMissing
  };
});
// Uses same index as postCommentsNew

Comments.addView("postCommentsNew", function (terms) {
  return {
    selector: {
      postId: terms.postId,
      parentAnswerId: viewFieldNullOrMissing,
      answer: false,
    },
    options: {sort: {deleted: 1, postedAt: -1}}
  };
});
ensureIndex(Comments,
  augmentForDefaultView({ postId:1, parentAnswerId:1, answer:1, deleted:1, postedAt:-1 }),
  { name: "comments.new_comments" }
);

Comments.addView("postCommentsBest", function (terms) {
  return {
    selector: {
      postId: terms.postId,
      parentAnswerId: viewFieldNullOrMissing,
      answer: false,
    },
    options: {sort: {deleted: 1, baseScore: -1}, postedAt: -1}
  };
});
// Same as postCommentsTop

Comments.addView("postLWComments", function (terms) {
  return {
    selector: {
      postId: terms.postId,
      af: null,
      answer: false,
      parentAnswerId: viewFieldNullOrMissing
    },
    options: {sort: {deleted: 1, baseScore: -1, postedAt: -1}}
  };
})

Comments.addView("allRecentComments", function (terms) {
  return {
    selector: {deletedPublic: false},
    options: {sort: {postedAt: -1}, limit: terms.limit || 5},
  };
});

Comments.addView("recentComments", function (terms) {
  return {
    selector: { score:{$gt:0}, deletedPublic: false},
    options: {sort: {postedAt: -1}, limit: terms.limit || 5},
  };
});
ensureIndex(Comments, augmentForDefaultView({ postedAt: -1 }));

Comments.addView("recentDiscussionThread", function (terms) {
  const eighteenHoursAgo = moment().subtract(18, 'hours').toDate();
  return {
    selector: {
      postId: terms.postId,
      score: {$gt:0},
      deletedPublic: false,
      postedAt: {$gt: eighteenHoursAgo}
    },
    options: {sort: {postedAt: -1}, limit: terms.limit || 5}
  };
})
// Uses same index as postCommentsNew

Comments.addView("afRecentDiscussionThread", function (terms) {
  const sevenDaysAgo = moment().subtract(7, 'days').toDate();
  return {
    selector: {
      postId: terms.postId,
      score: {$gt:0},
      deletedPublic: false,
      postedAt: {$gt: sevenDaysAgo},
      af: true,
    },
    options: {sort: {postedAt: -1}, limit: terms.limit || 5}
  };
})

Comments.addView("postCommentsUnread", function (terms) {
  return {
    selector: {
      postId: terms.postId,
      deleted: false,
      score: {$gt: 0}
    },
    options: {sort: {postedAt: -1}, limit: terms.limit || 15},
  };
});

Comments.addView("sunshineNewCommentsList", function (terms) {
  return {
    selector: {
      $or: [
        {$and: []},
        {needsReview: true},
        {baseScore: {$lte:0}}
      ],
      reviewedByUserId: {$exists:false},
      deleted: false,
    },
    options: {sort: {postedAt: -1}, limit: terms.limit || 5},
  };
});

export const questionAnswersSort = {chosenAnswer: 1, baseScore: -1, postedAt: -1}
Comments.addView('questionAnswers', function (terms) {
  return {
    selector: {postId: terms.postId, answer: true},
    options: {sort: questionAnswersSort}
  };
});

// Used in legacy routes
ensureIndex(Comments, {legacyId: "hashed"});

// Used in scoring cron job
ensureIndex(Comments, {inactive:1,postedAt:1});

Comments.addView("sunshineNewUsersComments", function (terms) {
  return {
    selector: {
      userId: terms.userId,
      // Don't hide deleted
      $or: null,
    },
    options: {sort: {postedAt: -1}, limit: terms.limit || 5},
  };
});
ensureIndex(Comments, augmentForDefaultView({userId:1, postedAt:1}));

Comments.addView('repliesToAnswer', function (terms) {
  return {
    selector: {parentAnswerId: terms.parentAnswerId},
    options: {sort: {baseScore: -1}}
  };
});
ensureIndex(Comments, augmentForDefaultView({parentAnswerId:1, baseScore:-1}));

// Used in moveToAnswers
ensureIndex(Comments, {topLevelCommentId:1});

// Used in findCommentByLegacyAFId
ensureIndex(Comments, {agentFoundationsId:1});