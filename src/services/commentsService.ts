// services/commentsService.ts
import { IResBody } from '../types/api';
import { Comment } from '../types/entities/comment';
import { FirestoreCollections } from '../types/firestore';
import { firestore } from 'firebase-admin';

export class CommentsService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  async voteComment(commentId: string, userId: string, voteType: 'upvote' | 'downvote'  ): Promise<IResBody> {
    console.log(`Attempting to ${voteType} comment with ID: ${commentId}`);

    // Rechercher le commentaire dans tous les posts
    const postsQuerySnapshot = await this.db.posts.get();

    for (const postDoc of postsQuerySnapshot.docs) {
        const postRef = postDoc.ref;
        const commentRef = postRef.collection('comments').doc(commentId);
        const commentDoc = await commentRef.get();

        if (commentDoc.exists) {
            let currentVoteCount = commentDoc.data()?.voteCount || 0;
            const updatedVoteCount = voteType === 'upvote' ? currentVoteCount + 1 : currentVoteCount - 1;

            await commentRef.update({ voteCount: updatedVoteCount });
            console.log(`Comment ${voteType}d successfully with new vote count: ${updatedVoteCount}`);

            return {
                status: 200,
                message: `Comment ${voteType}d successfully`,
                data: { voteCount: updatedVoteCount },
            };
        }
    }

    console.log(`Comment not found for ID: ${commentId}`);
    return {
        status: 404,
        message: 'Comment not found',
    };
}


  async deleteComment(commentId: string, userId: string, isAdmin: boolean): Promise<IResBody> {
    console.log(`Attempting to delete comment with ID: ${commentId}`);

    // Rechercher le commentaire dans tous les posts
    const postsQuerySnapshot = await this.db.posts.get();

    for (const postDoc of postsQuerySnapshot.docs) {
        const postRef = postDoc.ref;
        const commentRef = postRef.collection('comments').doc(commentId);
        const commentDoc = await commentRef.get();

        if (commentDoc.exists) {
            const commentData = commentDoc.data();

            // Vérifiez si l'utilisateur est autorisé à supprimer le commentaire
            if (commentData?.createdBy !== userId && !isAdmin) {
                console.log(`Unauthorized delete attempt by user ID: ${userId}`);
                return {
                    status: 403,
                    message: 'Forbidden: Only the owner or an admin can delete this comment',
                };
            }

            // Effectuer la suppression
            await commentRef.delete();

            console.log(`Commentaire supprimé avec succès pour ID: ${commentId}`);
            return {
                status: 200,
                message: 'Comment deleted successfully',
            };
        }
    }

    console.log(`Commentaire non trouvé pour ID: ${commentId}`);
    return {
        status: 404,
        message: 'Comment not found',
    };
}

  async updateComment(commentId: string, userId: string, updateData: Partial<Comment>, isAdmin: boolean): Promise<IResBody> {
    console.log(`Attempting to update comment with ID: ${commentId}`);

    const postsQuerySnapshot = await this.db.posts.get();

    for (const postDoc of postsQuerySnapshot.docs) {
        const postRef = postDoc.ref;
        const commentRef = postRef.collection('comments').doc(commentId);
        const commentDoc = await commentRef.get();

        if (commentDoc.exists) {
            const commentData = commentDoc.data();

            if (commentData?.createdBy !== userId && !isAdmin) {
                console.log(`Unauthorized update attempt by user ID: ${userId}`);
                return {
                    status: 403,
                    message: 'Forbidden: Only the owner or an admin can update this comment',
                };
            }

            await commentRef.update({
                ...updateData,
                updatedAt: firestore.Timestamp.now(),
            });

            console.log(`Commentaire mis à jour avec succès pour ID: ${commentId}`);
            return {
                status: 200,
                message: 'Comment updated successfully',
            };
        }
    }

    console.log(`Commentaire non trouvé pour ID: ${commentId}`);
    return {
        status: 404,
        message: 'Comment not found',
    };
}


  async getCommentById(commentId: string): Promise<IResBody> {
    console.log(`Attempting to fetch comment with ID: ${commentId}`);

    const postsQuerySnapshot = await this.db.posts.get();
    console.log(`Nombre de posts récupérés pour la recherche: ${postsQuerySnapshot.size}`);

    for (const postDoc of postsQuerySnapshot.docs) {
        const postRef = postDoc.ref;
        const commentRef = postRef.collection('comments').doc(commentId);

        const commentDoc = await commentRef.get();
        if (commentDoc.exists) {
            const data = commentDoc.data();
            const comment: Comment = {
                id: commentDoc.id,
                description: data?.description,
                voteCount: data?.voteCount,
                postId: postDoc.id,
                createdBy: data?.createdBy,

            };
            console.log(`Commentaire trouvé dans le post avec ID: ${postDoc.id}`);

            return {
                status: 200,
                message: 'Commentaire récupéré avec succès !',
                data: comment,
            };
        }
    }

    console.log(`Commentaire non trouvé pour ID: ${commentId}`);
    return {
        status: 404,
        message: 'Commentaire non trouvé',
    };
}

  async getCommentsByPostId(postId: string): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const commentsQuerySnapshot = await postRef.collection('comments').get();

    const comments: Comment[] = commentsQuerySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        description: data.description,
        postId: data.postId,
        createdBy: data.createdBy,
        voteCount: data.voteCount || 0,

      } as Comment;
    });

    return {
      status: 200,
      message: 'Comments retrieved successfully!',
      data: comments,
    };
  }

  async addCommentToPost(postId: string, connectedUserId: string, commentData: { description: string }): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return {
        status: 404,
        message: 'Post not found',
      };
    }

    const newComment: Comment = {
      description: commentData.description,
      postId,
      createdBy: connectedUserId,
      voteCount: 0,

    };

    try {

      const commentRef = postRef.collection('comments').doc();
      await commentRef.set(newComment);



      await this.db.commentRefs.doc(commentRef.id).set({
        commentId: commentRef.id,
        postId: postId
        });
        console.log("Comment reference added in commentRefs with ID:", commentRef.id);

      return {
        status: 201,
        message: 'Comment added successfully!',
      };
    } catch (error) {
      console.error("Error adding comment in CommentsService:", error);
      return {
        status: 500,
        message: 'Failed to add comment',
        data: error,
      };
    }
  }
}
