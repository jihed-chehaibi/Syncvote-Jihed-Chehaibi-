// controllers/commentController.ts
import { Request, Response } from 'express';
import { CommentsService } from '../services/commentsService';

export class CommentsController {
  private commentsService: CommentsService;

  constructor(commentsService: CommentsService) {
    this.commentsService = commentsService;
  }

  async voteComment(request: Request, response: Response): Promise<void> {
    try {
        const { id: commentId } = request.params;
        const userId = request.userId as string;
        const { voteType } = request.body;

        if (!['upvote', 'downvote'].includes(voteType)) {
            response.status(400).json({
                status: 400,
                message: 'Invalid vote type. Use "upvote" or "downvote".',
            });
            return;
        }

        console.log(`Received request to ${voteType} comment with ID: ${commentId}`);

        const voteResponse = await this.commentsService.voteComment(commentId, userId, voteType as  'upvote' | 'downvote' );

        response.status(voteResponse.status).json({
            ...voteResponse,
        });
    } catch (error) {
        console.error("Error in voteComment controller:", error);
        response.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error,
        });
    }
}



  async deleteComment(request: Request, response: Response): Promise<void> {
    try {
        const { id: commentId } = request.params;
        const userId = request.userId;
        const isAdmin = request.userRole === 'admin';

        console.log(`Received request to delete comment with ID: ${commentId}`);

        const deleteResponse = await this.commentsService.deleteComment(commentId, userId as string, isAdmin);

        response.status(deleteResponse.status).json({
            ...deleteResponse,
        });
    } catch (error) {
        console.error("Error in deleteComment controller:", error);
        response.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error,
        });
    }
}


  async updateComment(request: Request, response: Response): Promise<void> {
    try {
        const { id: commentId } = request.params;
        const userId = request.userId;
        const isAdmin = request.userRole === 'admin';
        const updateData = request.body;

        console.log(`Received request to update comment with ID: ${commentId}`);

        const updateResponse = await this.commentsService.updateComment(
            commentId,
            userId || '',
            updateData,
            isAdmin
        );

        response.status(updateResponse.status).json({
            ...updateResponse,
        });
    } catch (error) {
        console.error("Error in updateComment controller:", error);
        response.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error,
        });
    }
}


  async getCommentById(request: Request, response: Response): Promise<void> {
    try {
      const { commentId } = request.params;
      console.log("Attempting to fetch comment with ID:", commentId);

      const commentResponse = await this.commentsService.getCommentById(commentId);

      response.status(commentResponse.status).json({
        ...commentResponse,
      });
    } catch (error) {
      console.error("Error in getCommentById controller:", error);
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async getCommentsByPostId(request: Request, response: Response): Promise<void> {
    try {
      const { postId } = request.params;
      const commentsResponse = await this.commentsService.getCommentsByPostId(postId);

      response.status(commentsResponse.status).json({
        ...commentsResponse,
      });
    } catch (error) {
      console.error("Error in getCommentsByPostId controller:", error);
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async addCommentToPost(request: Request, response: Response): Promise<void> {
    try {
      const { postId } = request.params;
      const { description } = request.body;
      const connecteduserId = request.userId;

      if (!description) {
         response.status(400).json({
          status: 400,
          message: 'Description is required for a comment.',
        });
        return;
      }

      const commentResponse = await this.commentsService.addCommentToPost(postId, connecteduserId as string, { description });
      response.status(commentResponse.status).json({
        ...commentResponse,
      });
    } catch (error) {
      console.error("Error in addCommentToPost controller:", error);
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }
}
