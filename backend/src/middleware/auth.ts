import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

// Extender la interfaz Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        familyId?: string;
        teacherId?: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acceso requerido',
        message: 'Debes proporcionar un token de autenticación'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verificar que el usuario aún existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        teacher: true,
        students: {
          include: {
            family: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Usuario no válido',
        message: 'El token no corresponde a un usuario activo'
      });
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      familyId: user.students[0]?.familyId,
      teacherId: user.teacher?.id
    };

    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token ha expirado, inicia sesión nuevamente'
      });
    }

    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al verificar la autenticación'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireTeacher = requireRole(['ADMIN', 'MAESTRO']);
export const requireFamily = requireRole(['ADMIN', 'MAESTRO', 'FAMILIA']);

// Middleware para verificar que el usuario puede acceder a datos de su familia
export const requireFamilyAccess = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes estar autenticado'
      });
    }

    // Los administradores y maestros pueden acceder a todo
    if (req.user.role === 'ADMIN' || req.user.role === 'MAESTRO') {
      return next();
    }

    // Las familias solo pueden acceder a sus propios datos
    if (req.user.role === 'FAMILIA') {
      const familyId = req.params.familyId || req.body.familyId;
      
      if (!familyId) {
        return res.status(400).json({ 
          error: 'ID de familia requerido',
          message: 'Debes proporcionar un ID de familia'
        });
      }

      if (familyId !== req.user.familyId) {
        return res.status(403).json({ 
          error: 'Acceso denegado',
          message: 'Solo puedes acceder a los datos de tu familia'
        });
      }
    }

    return next();
  } catch (error) {
    logger.error('Error en verificación de acceso familiar:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al verificar permisos de acceso'
    });
  }
};

// Middleware para verificar que el maestro puede acceder a sus estudiantes
export const requireTeacherAccess = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes estar autenticado'
      });
    }

    // Los administradores pueden acceder a todo
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Los maestros solo pueden acceder a sus estudiantes
    if (req.user.role === 'MAESTRO' && req.user.teacherId) {
      const studentId = req.params.studentId || req.body.studentId;
      
      if (studentId) {
        const student = await prisma.student.findFirst({
          where: {
            id: studentId,
            enrollments: {
              some: {
                class: {
                  teacherId: req.user.teacherId
                }
              }
            }
          }
        });

        if (!student) {
          return res.status(403).json({ 
            error: 'Acceso denegado',
            message: 'Solo puedes acceder a los estudiantes de tus clases'
          });
        }
      }
    }

    return next();
  } catch (error) {
    logger.error('Error en verificación de acceso de maestro:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al verificar permisos de acceso'
    });
  }
};
