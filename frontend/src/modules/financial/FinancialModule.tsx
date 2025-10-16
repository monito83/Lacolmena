import React from 'react';
import { DollarSign, CreditCard, TrendingUp, FileText, Heart, Calculator } from 'lucide-react';

const FinancialModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-warm border border-warm-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-100 rounded-xl">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Módulo Contable y Financiero
            </h1>
            <p className="text-text-secondary">
              Gestión del sistema fraterno de aportes, facturación y finanzas
            </p>
          </div>
        </div>
      </div>

      {/* Sistema Fraterno - Destacado */}
      <div className="fraternal-indicator rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-secondary-100 rounded-lg">
            <Heart className="h-6 w-6 text-secondary-600" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-text-primary">
              Sistema Fraterno de Aportes
            </h3>
            <p className="text-text-secondary text-sm">
              Cada familia contribuye según su capacidad, manteniendo el equilibrio solidario
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Heart className="h-5 w-5 text-secondary-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Compromisos Fraternos
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Gestiona los compromisos de aporte de cada familia y su seguimiento.
          </p>
          <button className="btn-secondary w-full">
            Gestionar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Facturación y Cobros
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Registra matrículas, aportes mensuales y pagos extraordinarios.
          </p>
          <button className="btn-primary w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Calculator className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Gastos e Ingresos
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Controla los gastos operativos y monitorea el flujo financiero.
          </p>
          <button className="btn-accent w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-warm-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-text-primary" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Estados Financieros
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Genera reportes financieros y análisis de sostenibilidad.
          </p>
          <button className="btn-outline w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <FileText className="h-5 w-5 text-secondary-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Presupuestos
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Planifica presupuestos y proyecciones financieras.
          </p>
          <button className="btn-secondary w-full">
            Ingresar
          </button>
        </div>

        <div className="module-card card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="font-display font-semibold text-text-primary">
              Inventario y Activos
            </h3>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Controla inventarios, activos y recursos de la escuela.
          </p>
          <button className="btn-accent w-full">
            Ingresar
          </button>
        </div>
      </div>

      {/* Información del módulo */}
      <div className="bg-white rounded-2xl shadow-warm border border-warm-200 p-6">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Características del Sistema Fraterno
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-text-primary mb-2">Principios del Sistema:</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• Aportes variables según capacidad familiar</li>
              <li>• Compromisos establecidos por consenso</li>
              <li>• Acompañamiento en situaciones difíciles</li>
              <li>• Transparencia sin exposición individual</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-2">Funcionalidades:</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• Seguimiento de cumplimiento discreto</li>
              <li>• Alertas suaves para revisiones</li>
              <li>• Reportes de equilibrio general</li>
              <li>• Gestión de casos especiales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialModule;
