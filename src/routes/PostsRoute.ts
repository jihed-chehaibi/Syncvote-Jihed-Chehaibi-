import { Router } from 'express';
import { PostsController } from '../controllers';
import { validateCreatePost } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt';
import { CommentsController } from '../controllers/commentsController';

export class PostsRoute {
  private postsController: PostsController;
  private commentsController: CommentsController;
  constructor(postsController: PostsController , commentsController: CommentsController  ) {
    this.postsController = postsController;
    this.commentsController = commentsController;

  }

  createRouter(): Router {
    const router = Router();

    router.post('/posts/:id/vote',authJwt.verifyToken,this.postsController.votePost.bind(this.postsController));
    router.post('/posts/:postId/comments', authJwt.verifyToken, this.commentsController.addCommentToPost.bind(this.commentsController));
    router.get('/posts/:postId/comments', this.commentsController.getCommentsByPostId.bind(this.commentsController));
    router.post('/posts', authJwt.verifyToken, validateCreatePost, this.postsController.createPost.bind(this.postsController));
    router.put('/posts/:id', authJwt.verifyToken, authJwt.verifyAdminOrOwner, this.postsController.updatePost.bind(this.postsController));
    router.delete('/posts/:id', authJwt.verifyToken, authJwt.verifyAdminOrOwner, this.postsController.deletePost.bind(this.postsController));
    router.get('/users/:userId/posts', this.postsController.getAllPostsByUser.bind(this.postsController));
    router.get('/posts', this.postsController.getPostsByCategory.bind(this.postsController));
    router.get('/posts', this.postsController.getPosts.bind(this.postsController));
    router.get('/posts/:id', this.postsController.getPostById.bind(this.postsController));





    return router;
  }
}
