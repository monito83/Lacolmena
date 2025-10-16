import React from 'react';
import { Users, UserPlus, BookOpen, FileText } from 'lucide-react';

const AcademicModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-warm border border-warm-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Módulo Académico
            </h1>
            <p className="text-text-secondary">
              Gestión de niños/niñas, maestros y personal docente
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Gestión de Niños
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Administra matrículas, historiales y datos de los niños y niñas de La Colmena.
          </p>
          <button className="btn-primary w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-secondary-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Gestión de Maestros
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Administra el personal docente y su información profesional.
          </p>
          <button className="btn-secondary w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Planificación
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Organiza clases, horarios y actividades académicas.
          </p>
          <button className="btn-accent w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-warm-200 rounded-lg">
              <FileText className="h-5 w-5 text-text-primary" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Reportes Académicos
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Genera reportes y documentos académicos necesarios.
          </p>
          <button className="btn-outline w-full">
            Ingresar
          </button>
        </div>
      </div>

      {/* Información del módulo */}
      <div className="bg-white rounded-2xl shadow-warm border border-warm-200 p-6">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Información del Módulo Académico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text-primary mb-2">Funcionalidades Principales:</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• Registro de niños y niñas con datos completos</li>
              <li>• Gestión de matrículas y historiales</li>
              <li>• Administración del personal docente</li>
              <li>• Seguimiento académico individual</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-2">Integración:</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• Conecta con el módulo financiero</li>
              <li>• Alimenta el módulo administrativo</li>
              <li>• Genera datos para reportes</li>
              <li>• Base para el sistema fraterno</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicModule;
