// middlewares/authJwt.js
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/firestore-helpers';
interface DecodeToken extends JwtPayload {
  id: string;
  role: string;
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    console.log("Received Authorization Header:", token);

    if (!token) {
      console.log("No token provided.");
      return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }

    const tokenParts = token.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      console.log("Token format incorrect:", tokenParts);
      return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }

    console.log("Token for verification:", tokenParts[1]);

    const decode = jwt.verify(tokenParts[1], process.env.SECRET_KEY as string) as DecodeToken;
    console.log("Decoded Token:", decode);

    req.userId = decode.id;
    req.userRole = decode.role;

    console.log("User Role Detected:", req.userRole);

    next();
  } catch (e) {
    console.error("Token verification error:", e);
    return res.status(401).json({ status: 401, message: 'Unauthorized' });
  }
};


const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("verifyAdmin called on route:", req.originalUrl);
  if (req.userRole === 'admin') {
    return next();
  } else {
    return res.status(403).json({ status: 403, message: 'Forbidden: Admins only' });
  }
};
  const verifyAdminOrOwner = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const userRole = req.userRole;
    const { id: postId } = req.params;

    try {
      // Si l'utilisateur est admin, autoriser
      if (userRole === 'admin') {
        return next();
      }

      // Récupérer le post pour vérifier le propriétaire
      const postDoc = await db.posts.doc(postId).get();
      if (!postDoc.exists) {
        return res.status(404).json({ status: 404, message: 'Post not found' });
      }

      const postData = postDoc.data();
      if (postData && postData.createdBy === userId) {
        return next(); // Autoriser si l'utilisateur est le propriétaire
      }

      // Si l'utilisateur n'est ni admin ni propriétaire
      return res.status(403).json({ status: 403, message: 'Forbidden: Admins or Owners only' });
    } catch (error) {
      console.error('Error in verifyAdminOrOwner:', error);
      return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  };

const authJwt = {
  verifyToken,
  verifyAdmin,
  verifyAdminOrOwner,
};

export default authJwt;
