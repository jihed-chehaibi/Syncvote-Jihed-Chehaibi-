import { FirestoreCollections } from '../types/firestore';

export class CommentRefService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  async addCommentReference(commentId: string, postId: string) {
    const commentReference = { commentId, postId };
    await this.db.commentRefs.doc(commentId).set(commentReference);
  }

  async deleteCommentReference(commentId: string) {
    await this.db.commentRefs.doc(commentId).delete();
  }

  async updateCommentReference(commentId: string, newPostId: string) {
    await this.db.commentRefs.doc(commentId).update({ postId: newPostId });
  }

  async getCommentReference(commentId: string) {
    const doc = await this.db.commentRefs.doc(commentId).get();
    return doc.exists ? doc.data() : null;
  }
}
