import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authorization = req.get('authorization');
  const [scheme, token] = authorization?.split(' ') || [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Token d’authentification requis.',
    });
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error('Missing required environment variable: JWT_SECRET'));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token d’authentification invalide ou expiré.',
    });
  }
};

export const checkRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit pour ce rôle.',
    });
  }

  return next();
};
