import * as controllers from './controllers';
import * as routes from './routes';
import * as services from './services';import { CommentsRoute } from './routes/commentsRoute';
import { FirestoreCollections } from './types/firestore';
import { RedisClientType } from 'redis';

export function initializeRoutes(db: FirestoreCollections, redisClient: RedisClientType) {
  const usersService = new services.UsersService(db, redisClient);
  const userController = new controllers.UserController(usersService);
  const usersRoute = new routes.UsersRoute(userController);

  const postsService = new services.PostsService(db);
  const commentsService = new services.CommentsService(db);

  const postsController = new controllers.PostsController(postsService);
  const commentsController = new controllers.CommentsController(commentsService);

  const postsRoute = new routes.PostsRoute(postsController, commentsController);
  const commentsRoute = new routes.CommentsRoute(commentsController); // Ajoutez cette ligne

  return {
    usersRoute,
    postsRoute,
    commentsRoute, // Ajoutez `commentsRoute` ici
  };
}
