import Votes from './collections/votes/collection.js';
import moment from 'moment-timezone';

// This file is mostly server-side, but lives in an included-with-client-bundle
// directory because we don't have a good way to make resolvers, or imports
// used by resolvers, be server specific.


// Given a user and a date range, get a summary of karma changes that occurred
// during that date range.
//
// For example:
// {
//   totalChange: 10,
//   startDate: Date("2018-09-09"),
//   endDate: Date("2018-09-10"),
//   documents: [
//     {
//       _id: "12345",
//       collectionName: "Posts",
//       scoreChange: 3,
//     },
//     {
//       _id: "12345",
//       collectionName: "Comments",
//       scoreChange: -1,
//     },
//   ]
// }
export async function getKarmaChanges({user, startDate, endDate})
{
  if (!user) throw new Error("Missing required argument: user");
  if (!startDate) throw new Error("Missing required argument: startDate");
  if (!endDate) throw new Error("Missing required argument: endDate");
  if (startDate > endDate)
    throw new Error("getKarmaChanges: endDate must be after startDate");
  
  let changedDocs = await Votes.rawCollection().aggregate([
    // Get votes cast on this user's content (including cancelled votes)
    {$match: {
      authorId: user._id,
      votedAt: {$gte: startDate, $lte: endDate},
      userId: {$ne: user._id}, //Exclude self-votes
    }},
    
    // Group by thing-that-was-voted-on and calculate the total karma change
    {$group: {
      _id: "$documentId",
      collectionName: { $first: "$collectionName" },
      scoreChange: { $sum: "$power" },
    }},
    
    // Filter out things with zero net change (eg where someone voted and then
    // unvoted and nothing else happened)
    {$match: {
      scoreChange: {$ne: 0}
    }},
  ]).toArray();
  
  let totalChange = 0;
  for (let changedDoc of changedDocs) {
    totalChange += changedDoc.scoreChange;
  }
  
  return {
    totalChange: totalChange,
    startDate: startDate,
    endDate: endDate,
    documents: changedDocs,
  };
}

export function getKarmaChangeDateRange({settings, now, lastOpened=null, lastBatchStart=null})
{
  // Greatest date prior to lastOpened at which the time of day matches
  // settings.timeOfDay.
  let todaysDailyReset = moment(now).tz("GMT");
  todaysDailyReset.set('hour', Math.floor(settings.timeOfDayGMT));
  todaysDailyReset.set('minute', 60*(settings.timeOfDayGMT%1));
  todaysDailyReset.set('second', 0);
  todaysDailyReset.set('millisecond', 0);
  
  const lastDailyReset = todaysDailyReset.isAfter(now)
    ? moment(todaysDailyReset).subtract(1, 'days')
    : todaysDailyReset;
  
  switch(settings.updateFrequency) {
    case "disabled":
      return null;
    case "daily":
      const oneDayPrior = moment(lastDailyReset).subtract(1, 'days');
      
      if (lastOpened && lastOpened > lastDailyReset.toDate() && lastBatchStart) {
        return {
          start: lastBatchStart,
          end: lastDailyReset.toDate()
        };
      }
      
      return {
        start: moment.min(oneDayPrior, moment(lastOpened)).toDate(),
        end: lastDailyReset.toDate(),
      };
    case "weekly":
      // Target day of the week, as an integer 0-6
      const targetDayOfWeekNum = moment().day(settings.dayOfWeekGMT).day();
      const lastDailyResetDayOfWeekNum = lastDailyReset.day();
      
      // Number of days back from today's daily reset to get to a daily reset
      // of the correct day of the week
      const daysOfWeekDifference = (lastDailyResetDayOfWeekNum - targetDayOfWeekNum + 7) % 7;
      
      const lastWeeklyReset = moment(lastDailyReset).add(-daysOfWeekDifference, 'days');
      const oneWeekPrior = moment(lastWeeklyReset).add(-7, 'days');
      return {
        start: moment.min(oneWeekPrior, moment(lastOpened)).toDate(),
        end: lastWeeklyReset.toDate(),
      };
    case "realtime":
      return {
        start: lastOpened || new Date("1970-01-01"),
        end: now
      }
  }
}

export function getKarmaChangeNextBatchDate({settings, now})
{
  switch(settings.updateFrequency) {
    case "disabled":
    case "realtime":
      return null;
    case "daily":
      const lastDailyBatch = getKarmaChangeDateRange({settings, now});
      const lastDailyReset = lastDailyBatch.end;
      const nextDailyReset = moment(lastDailyReset).add(1, 'days');
      return nextDailyReset.toDate();
      
    case "weekly":
      const lastWeeklyBatch = getKarmaChangeDateRange({settings, now});
      const lastWeeklyReset = lastWeeklyBatch.end;
      const nextWeeklyReset = moment(lastWeeklyReset).add(7, 'days');
      return nextWeeklyReset.toDate();
  }
}