import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  familyId?: string;
  teacherId?: string;
}

// Extender Request type para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado', message: 'No hay token de autenticación' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Verificar que el usuario aún existe en la base de datos
    const { data: users, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles(*),
        teachers(*),
        students(
          *,
          families(*)
        )
      `)
      .eq('id', decoded.userId)
      .limit(1);

    if (userError) {
      logger.error('Error al verificar usuario:', userError);
      return res.status(401).json({ error: 'No autorizado', message: 'Error al verificar usuario' });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'No autorizado', message: 'El usuario de este token ya no existe' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'No autorizado', message: 'Usuario inactivo' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      familyId: user.students?.length > 0 ? user.students[0].family_id : undefined,
      teacherId: user.teachers?.length > 0 ? user.teachers[0].id : undefined,
    };
    
    next();
  } catch (error) {
    logger.error('Error en la autenticación:', error);
    return res.status(401).json({ error: 'No autorizado', message: 'Token inválido o expirado' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `El rol de usuario ${req.user?.role || 'desconocido'} no está autorizado para acceder a esta ruta. Roles permitidos: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireTeacher = requireRole(['admin', 'maestro']);
export const requireFamily = requireRole(['admin', 'maestro', 'familia']);

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
    if (req.user.role === 'admin' || req.user.role === 'maestro') {
      return next();
    }

    // Las familias solo pueden acceder a sus propios datos
    if (req.user.role === 'familia') {
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
    if (req.user.role === 'admin') {
      return next();
    }

    // Los maestros solo pueden acceder a sus estudiantes
    if (req.user.role === 'maestro' && req.user.teacherId) {
      const studentId = req.params.studentId || req.body.studentId;

      if (studentId) {
        const { data: student, error } = await supabase
          .from('students')
          .select(`
            *,
            student_enrollments(
              *,
              classes(
                *,
                teachers(*)
              )
            )
          `)
          .eq('id', studentId)
          .limit(1);

        if (error) {
          return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'Error al verificar acceso al estudiante'
          });
        }

        if (!student || student.length === 0) {
          return res.status(403).json({
            error: 'Acceso denegado',
            message: 'Estudiante no encontrado'
          });
        }

        // Verificar si el estudiante está en alguna clase del maestro
        const isTeacherStudent = student[0].student_enrollments?.some(
          (enrollment: any) => enrollment.classes?.teachers?.id === req.user.teacherId
        );

        if (!isTeacherStudent) {
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


