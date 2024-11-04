import { Request, Response } from 'express';
import { PostsService } from '../services';
import { validationResult } from 'express-validator';
import { Comment } from '../types/entities/comment';
export class PostsController {
  private postsService: PostsService;

  constructor(postsService: PostsService) {
    this.postsService = postsService;
  }

  async votePost(request: Request, response: Response): Promise<void> {
    try {
        const { id: postId } = request.params;
        const userId = request.userId as string;
        const { voteType } = request.body;

        if (!['upvote', 'downvote'].includes(voteType)) {
            response.status(400).json({
                status: 400,
                message: 'Invalid vote type. Use "upvote" or "downvote".',
            });
            return;
        }

        console.log(`Received request to ${voteType} post with ID: ${postId}`);

        const voteResponse = await this.postsService.votePost(postId, userId, voteType as 'upvote' | 'downvote');

        response.status(voteResponse.status).json({
            ...voteResponse,
        });
    } catch (error) {
        console.error("Error in votePost controller:", error);
        response.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error,
        });
    }
}


  async getPostsByCategory(request: Request, response: Response): Promise<void> {
    try {
      const { category } = request.query;
      const postsResponse = await this.postsService.getPostsByCategory(category as string);

      response.status(postsResponse.status).json({
        ...postsResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async getAllPostsByUser(request: Request, response: Response): Promise<void> {
    try {
      const { userId } = request.params;
      const postsResponse = await this.postsService.getPostsByUserId(userId);

      response.status(postsResponse.status).json({
        ...postsResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async deletePost(request: Request, response: Response): Promise<void> {
    try {
      const { id } = request.params;
      const postResponse = await this.postsService.deletePost(id);

      response.status(postResponse.status).json({
        ...postResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async updatePost(request: Request, response: Response): Promise<void> {
    try {
      const { id } = request.params;
      const { title, description, categories } = request.body;

      const updateData = { title, description, categories };
      const postResponse = await this.postsService.updatePost(id, updateData);

      response.status(postResponse.status).json({
        ...postResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async getPostById(request: Request, response: Response): Promise<void> {
    try {
      const { id } = request.params;
      const postResponse = await this.postsService.getPostById(id);

      response.status(postResponse.status).json({
        ...postResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }


  async createPost(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
    } else {
      try {
        const { title, description, categories } = request.body;

        const postData = {
          title,
          description,
          categories,
          createdBy: request.userId,
        };

        const postResponse = await this.postsService.createPost(postData);

        response.status(postResponse.status).send({
          ...postResponse,
        });
      } catch (error) {
        response.status(500).json({
          status: 500,
          message: 'Internal server error',
          data: error
        });
      }
    }
  }

  async getPosts(request: Request, response: Response): Promise<void> {
    try {
      const postsResponse = await this.postsService.getPosts();

      response.status(postsResponse.status).send({
        ...postsResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }
}
