import { addCallback } from 'meteor/vulcan:core';
import { Posts } from '../collections/posts';
import { Comments } from '../collections/comments'
import Users from 'meteor/vulcan:users';
import Sequences from '../collections/sequences/collection.js';
import { algoliaDocumentExport } from './utils.js';
import { Components } from 'meteor/vulcan:core';
import ReactDOMServer from 'react-dom/server';

function newCommentAlgoliaIndex(comment) {
  algoliaDocumentExport([comment], Comments, 'test_comments', Comments.toAlgolia, (comment) => Comments.update(comment._id, {$set: {algoliaIndexAt: new Date()}}))
  // console.log("Indexed new comment into Algolia: ", comment);
}
addCallback("comments.new.async", newCommentAlgoliaIndex)

function editCommentAlgoliaIndex(comment) {
  algoliaDocumentExport([comment], Comments, 'test_comments', Comments.toAlgolia, (comment) => Comments.update(comment._id, {$set: {algoliaIndexAt: new Date()}}))
  // console.log("Updated Algolia index for edited comment", comment);
}
addCallback("comments.edit.async", editCommentAlgoliaIndex)

function newPostAlgoliaIndex(post) {
  if (!post.draft) {
    algoliaDocumentExport([post], Posts, 'test_posts', Posts.toAlgolia, (post) => Posts.update(post._id, {$set: {algoliaIndexAt: new Date()}}))
    // console.log("Indexed new post into Algolia: ", post);
  }
}
addCallback("posts.new.async", newPostAlgoliaIndex)

function editPostAlgoliaIndex(post) {
  if (!post.draft) {
    algoliaDocumentExport([post], Posts, 'test_posts', Posts.toAlgolia, (post) => Posts.update(post._id, {$set: {algoliaIndexAt: new Date()}}))
    // console.log("Updated Algolia index for edited post ", post);
  }
}
addCallback("posts.edit.async", editPostAlgoliaIndex)

function newUserAlgoliaIndex(user) {
  algoliaDocumentExport([user], Users, 'test_users', Users.toAlgolia, (user) => Users.update(user._id, {$set: {algoliaIndexAt: new Date()}}))
}
addCallback("users.new.async", newUserAlgoliaIndex)

function editUserAlgoliaIndex(user) {
  algoliaDocumentExport([user], Users, 'test_users', Users.toAlgolia, (user) => Users.update(user._id, {$set: {algoliaIndexAt: new Date()}}))
}
addCallback("users.edit.async", editUserAlgoliaIndex)

function newSequenceAlgoliaIndex(sequence) {
  algoliaDocumentExport([sequence], Sequences, 'test_sequences', Sequences.toAlgolia, (sequence) => Sequences.update(sequence._id, {$set: {algoliaIndexAt: new Date()}}))
}
addCallback("sequences.new.async", newSequenceAlgoliaIndex)

function editSequenceAlgoliaIndex(sequence) {
  algoliaDocumentExport([sequence], Sequences, 'test_sequences', Sequences.toAlgolia, (sequence) => Sequences.update(sequence._id, {$set: {algoliaIndexAt: new Date()}}))
}
addCallback("sequences.edit.async", editSequenceAlgoliaIndex);