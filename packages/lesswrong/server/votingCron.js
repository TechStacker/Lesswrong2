import { batchUpdateScore } from './updateScores.js';
import { VoteableCollections } from '../lib/modules/make_voteable.js';
import { addCronJob } from './cronUtil';

// Setting voting.scoreUpdateInterval removed and replaced with a hard-coded
// interval because the time-parsing library we use can't handle numbers of
// seconds >= 60; rather than treat them as minutes (like you'd expect), it
// treats intervals like "every 100 seconds" as a syntax error.
//
//registerSetting('voting.scoreUpdateInterval', 60, 'How often to update scores, in seconds');
//const scoreInterval = parseInt(getSetting('voting.scoreUpdateInterval', 60));

addCronJob({
  name: 'updateScoreActiveDocuments',
  schedule(parser) {
    return parser.text(`every 30 seconds`);
  },
  job() {
    VoteableCollections.forEach(collection => {
      batchUpdateScore({collection});
    });
  }
});
addCronJob({
  name: 'updateScoreInactiveDocuments',
  schedule(parser) {
    return parser.text('every 24 hours');
  },
  job() {
    VoteableCollections.forEach(collection => {
      batchUpdateScore({collection, inactive: true});
    });
  }
});