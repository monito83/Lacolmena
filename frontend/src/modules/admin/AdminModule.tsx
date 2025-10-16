import React from 'react';
import { Settings, Users, Mail, Calendar, FileText, Building } from 'lucide-react';

const AdminModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-warm border border-warm-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Settings className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Módulo Administrativo
            </h1>
            <p className="text-text-secondary">
              Gestión de personal, comunicaciones, eventos y documentación
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
              Gestión de Personal
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Administra empleados, nóminas y datos del personal de La Colmena.
          </p>
          <button className="btn-primary w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Mail className="h-5 w-5 text-secondary-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Comunicaciones
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Gestiona comunicaciones internas y externas de la escuela.
          </p>
          <button className="btn-secondary w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Calendar className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Eventos y Actividades
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Organiza eventos, actividades y calendario escolar.
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
              Documentación
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Archiva y gestiona documentos administrativos importantes.
          </p>
          <button className="btn-outline w-full">
            Ingresar
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-warm border border-warm-200 p-6">
          <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
            Gestión de Personal
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-primary-500" />
              <div>
                <p className="font-medium text-text-primary">Nóminas y Salarios</p>
                <p className="text-sm text-text-muted">Control de pagos y beneficios</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-secondary-500" />
              <div>
                <p className="font-medium text-text-primary">Datos de Empleados</p>
                <p className="text-sm text-text-muted">Información personal y profesional</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-accent-500" />
              <div>
                <p className="font-medium text-text-primary">Control de Asistencia</p>
                <p className="text-sm text-text-muted">Registro de horarios y ausencias</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-warm border border-warm-200 p-6">
          <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
            Comunicaciones y Eventos
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary-500" />
              <div>
                <p className="font-medium text-text-primary">Notificaciones</p>
                <p className="text-sm text-text-muted">Sistema de mensajes internos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-secondary-500" />
              <div>
                <p className="font-medium text-text-primary">Calendario Escolar</p>
                <p className="text-sm text-text-muted">Eventos y actividades programadas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-accent-500" />
              <div>
                <p className="font-medium text-text-primary">Archivo Digital</p>
                <p className="text-sm text-text-muted">Documentos y archivos organizados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del módulo */}
      <div className="bg-white rounded-2xl shadow-warm border border-warm-200 p-6">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Información del Módulo Administrativo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text-primary mb-2">Funcionalidades Principales:</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• Gestión completa del personal</li>
              <li>• Sistema de comunicaciones internas</li>
              <li>• Organización de eventos y actividades</li>
              <li>• Archivo digital de documentos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-2">Integración:</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• Conecta con datos del módulo académico</li>
              <li>• Integra información financiera</li>
              <li>• Alimenta reportes del dashboard</li>
              <li>• Soporte para decisiones administrativas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModule;
