// routes/commentsRoute.ts
import { Router } from 'express';
import { CommentsController } from '../controllers/commentsController';
import authJwt from '../middlewares/authJwt';

export class CommentsRoute {
  private commentsController: CommentsController;

  constructor(commentsController: CommentsController) {
    this.commentsController = commentsController;
  }

  createRouter(): Router {
    const router = Router();

    router.post('/comments/:id/vote',authJwt.verifyToken,this.commentsController.voteComment.bind(this.commentsController));
    router.delete('/comments/:id',authJwt.verifyToken,this.commentsController.deleteComment.bind(this.commentsController));
    router.put('/comments/:id', authJwt.verifyToken, this.commentsController.updateComment.bind(this.commentsController));
    router.get('/comments/:commentId', this.commentsController.getCommentById.bind(this.commentsController));


    return router;
  }
}
