import { Post } from '../types/entities/Post';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helpers';
import { Timestamp } from 'firebase/firestore';
import { categories } from '../constants/categories';

export class PostsService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  async votePost(postId: string, userId: string, voteType: 'upvote' | 'downvote'): Promise<IResBody> {
    console.log(`Attempting to ${voteType} post with ID: ${postId}`);

    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
        console.log(`Post not found for ID: ${postId}`);
        return {
            status: 404,
            message: 'Post not found',
        };
    }

    let currentVoteCount = postDoc.data()?.voteCount || 0;
    const updatedVoteCount = voteType === 'upvote' ? currentVoteCount + 1 : currentVoteCount - 1;

    await postRef.update({ voteCount: updatedVoteCount });
    console.log(`Post ${voteType}d successfully with new vote count: ${updatedVoteCount}`);

    return {
        status: 200,
        message: `Post ${voteType}d successfully`,
        data: { voteCount: updatedVoteCount },
    };
}

  async getPostsByCategory(category: string): Promise<IResBody> {
    const posts: any[] = [];

    let postsQuerySnapshot;
    if (category) {

      postsQuerySnapshot = await this.db.posts.where('categories', 'array-contains', category).get();
    } else {
      postsQuerySnapshot = await this.db.posts.get();
    }

    for (const doc of postsQuerySnapshot.docs) {
      posts.push({
        id: doc.id,
        ...doc.data(),
      });
    }

    return {
      status: 200,
      message: 'Posts retrieved successfully!',
      data: posts
    };
  }


  async getPostsByUserId(userId: string): Promise<IResBody> {
    const posts: any[] = [];
    const postsQuerySnapshot = await this.db.posts.where('createdBy', '==', userId).get();

    for (const doc of postsQuerySnapshot.docs) {
      posts.push({
        id: doc.id,
        ...doc.data(),
      });
    }

    return {
      status: 200,
      message: 'Posts retrieved successfully!',
      data: posts
    };
  }

  async deletePost(postId: string): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return {
        status: 404,
        message: 'Post not found',
      };
    }

    await postRef.delete();

    return {
      status: 200,
      message: 'Post deleted successfully',
    };
  }


  async updatePost(postId: string, updateData: Partial<Post>): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return {
        status: 404,
        message: 'Post not found',
      };
    }

    await postRef.update({
      ...updateData,
      updatedAt: firestoreTimestamp.now(),
    });

    return {
      status: 200,
      message: 'Post updated successfully',
    };
  }

  async getPostById(postId: string): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return {
        status: 404,
        message: 'Post not found',
      };
    }

    return {
      status: 200,
      message: 'Post retrieved successfully!',
      data: postDoc.data(),
    };
  }

  async createPost(postData: Post): Promise<IResBody> {
    const postRef = this.db.posts.doc();
    await postRef.set({
      ...postData,
      voteCount: 0,
      createdAt: firestoreTimestamp.now(),
      updatedAt: firestoreTimestamp.now(),
    });

    return {
      status: 201,
      message: 'Post created successfully!',
    };
  }

  async getPosts(): Promise<IResBody> {
    const posts: Post[] = [];
    const postsQuerySnapshot = await this.db.posts.get();

    for (const doc of postsQuerySnapshot.docs) {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
      });
    }

    return {
      status: 200,
      message: 'Posts retrieved successfully!',
      data: posts
    };
  }

}
