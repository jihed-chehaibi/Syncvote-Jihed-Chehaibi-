import { User } from './entities/User';
import { Post } from './entities/Post';
import { Comment } from './entities/comment';
import { firestore } from 'firebase-admin';
import CollectionReference = firestore.CollectionReference;
import DocumentData = firestore.DocumentData;


export interface CommentReference {
  commentId: string;
  postId: string;
}
export interface FirestoreCollections {
  users: CollectionReference<User, DocumentData>;
  posts: CollectionReference<Post, DocumentData>;
  comments: CollectionReference<Comment, DocumentData>;
  commentRefs: CollectionReference<CommentReference, DocumentData>;
}
