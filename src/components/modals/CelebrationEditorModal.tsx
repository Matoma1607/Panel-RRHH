import React, { useState, useEffect } from 'react';
import { CelebrationItem } from '../../types';
import { X, Cake, Award, User, Building2, Calendar, Image, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CelebrationItem> & { id?: string }) => void;
  editingCelebration?: CelebrationItem | null;
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CelebrationEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingCelebration,
}) => {
  const [type, setType] = useState<'birthday' | 'anniversary'>('birthday');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('Ventas');
  const [avatar, setAvatar] = useState('');
  const [date, setDate] = useState('');
  const [yearsAtCompany, setYearsAtCompany] = useState<number>(1);

  useEffect(() => {
    if (editingCelebration) {
      setType(editingCelebration.type);
      setEmployeeName(editingCelebration.employeeName);
      setDepartment(editingCelebration.department);
      setAvatar(editingCelebration.avatar);
      setDate(editingCelebration.date);
      setYearsAtCompany(editingCelebration.yearsAtCompany || 1);
    } else {
      setType('birthday');
      setEmployeeName('');
      setDepartment('Ventas');
      setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
      const now = new Date();
      setDate(`${now.getDate()} de ${MONTHS_ES[now.getMonth()]}`);
      setYearsAtCompany(1);
    }
  }, [editingCelebration, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingCelebration?.id,
      employeeName: employeeName.trim(),
      department: department.trim(),
      avatar: avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      date: date.trim(),
      type,
      yearsAtCompany: type === 'anniversary' ? Number(yearsAtCompany) : undefined,
      greetingsCount: editingCelebration?.greetingsCount || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
            {type === 'birthday' ? <Cake className="w-5 h-5" /> : <Award className="w-5 h-5 text-amber-600" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {editingCelebration ? 'Editar Festejo' : 'Agregar Persona a Festejos'}
            </h3>
            <p className="text-xs text-slate-500">
              Registra un cumpleaños o aniversario laboral para felicitar al colaborador.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Switcher */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Tipo de Celebración</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('birthday')}
                className={`py-2.5 px-3 rounded-2xl font-bold border transition-all flex items-center justify-center gap-2 ${
                  type === 'birthday'
                    ? 'bg-pink-50 text-pink-700 border-pink-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Cake className="w-4 h-4 text-pink-500" />
                <span>🎂 Cumpleaños</span>
              </button>
              <button
                type="button"
                onClick={() => setType('anniversary')}
                className={`py-2.5 px-3 rounded-2xl font-bold border transition-all flex items-center justify-center gap-2 ${
                  type === 'anniversary'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>🏆 Aniversario</span>
              </button>
            </div>
          </div>

          {/* Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Ej: Lic. Sofía Martínez"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Área / Departamento</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ej: Ventas, Taller, Sistemas..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Date & Years (if anniversary) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Festejo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Ej: 18 de Agosto"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {type === 'anniversary' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Años en la Empresa</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={yearsAtCompany}
                    onChange={(e) => setYearsAtCompany(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                  <Award className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            )}
          </div>

          {/* Photo / Avatar URL */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">URL de Foto / Avatar</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <Image className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt="Preview"
                className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingCelebration ? 'Guardar Cambios' : 'Agregar a Festejos'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
