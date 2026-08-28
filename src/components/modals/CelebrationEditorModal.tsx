import React, { useState, useEffect } from 'react';
import { CelebrationItem } from '../../types';
import {
  X,
  Cake,
  Award,
  User,
  Building2,
  Calendar,
  Sparkles,
  Clock,
  Wand2,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { getCelebrationCountdown, parseCelebrationDate } from '../../utils/celebrationUtils';
import {
  detectGenderFromName,
  getSmartAvatarUrl,
  resolveCelebrationAvatar,
  AVATAR_MAN,
  AVATAR_WOMAN,
  DetectedGender,
} from '../../utils/avatarUtils';

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
  const [gender, setGender] = useState<DetectedGender>('male');
  const [avatar, setAvatar] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showCustomPhotoInput, setShowCustomPhotoInput] = useState(false);
  const [date, setDate] = useState('');
  const [yearsAtCompany, setYearsAtCompany] = useState<number>(1);
  const [useDatePickers, setUseDatePickers] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);

  useEffect(() => {
    if (editingCelebration) {
      setType(editingCelebration.type || 'birthday');
      const detected = editingCelebration.gender || detectGenderFromName(editingCelebration.employeeName);
      setGender(detected);
      setEmployeeName(editingCelebration.employeeName || '');
      setDepartment(editingCelebration.department || 'Ventas');
      
      const cleanAvatar = resolveCelebrationAvatar(
        editingCelebration.employeeName,
        editingCelebration.avatar,
        detected
      );
      setAvatar(cleanAvatar);
      
      if (
        editingCelebration.avatar &&
        editingCelebration.avatar !== AVATAR_MAN &&
        editingCelebration.avatar !== AVATAR_WOMAN &&
        !editingCelebration.avatar.includes('dicebear.com') &&
        !editingCelebration.avatar.includes('unsplash.com')
      ) {
        setCustomPhotoUrl(editingCelebration.avatar);
        setShowCustomPhotoInput(true);
      } else {
        setCustomPhotoUrl('');
        setShowCustomPhotoInput(false);
      }

      setDate(editingCelebration.date || '');
      setYearsAtCompany(editingCelebration.yearsAtCompany || 1);

      const parsed = parseCelebrationDate(editingCelebration.date);
      if (parsed) {
        setSelectedDay(parsed.day);
        setSelectedMonth(parsed.month - 1);
      }
    } else {
      setType('birthday');
      setEmployeeName('');
      setDepartment('Ventas');
      setGender('male');
      setAvatar(AVATAR_MAN);
      setCustomPhotoUrl('');
      setShowCustomPhotoInput(false);
      const now = new Date();
      setSelectedDay(now.getDate());
      setSelectedMonth(now.getMonth());
      setDate(`${now.getDate()} de ${MONTHS_ES[now.getMonth()]}`);
      setYearsAtCompany(1);
    }
  }, [editingCelebration, isOpen]);

  const handleNameChange = (name: string) => {
    setEmployeeName(name);
    const detected = detectGenderFromName(name);
    setGender(detected);
    if (!customPhotoUrl) {
      setAvatar(getSmartAvatarUrl(name, detected));
    }
  };

  const handleGenderChange = (newGender: DetectedGender) => {
    setGender(newGender);
    if (!customPhotoUrl) {
      setAvatar(getSmartAvatarUrl(employeeName, newGender));
    }
  };

  const handleCustomPhotoChange = (url: string) => {
    setCustomPhotoUrl(url);
    setAvatar(url.trim() || getSmartAvatarUrl(employeeName, gender));
  };

  const handleDayOrMonthChange = (d: number, m: number) => {
    setSelectedDay(d);
    setSelectedMonth(m);
    setDate(`${d} de ${MONTHS_ES[m]}`);
  };

  if (!isOpen) return null;

  const countdown = getCelebrationCountdown(date);
  const activeAvatar = customPhotoUrl.trim() || avatar || getSmartAvatarUrl(employeeName, gender);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingCelebration?.id,
      employeeName: employeeName.trim(),
      department: department.trim(),
      avatar: activeAvatar,
      gender,
      date: date.trim(),
      type,
      yearsAtCompany: type === 'anniversary' ? Number(yearsAtCompany) : undefined,
      greetingsCount: editingCelebration?.greetingsCount || 0,
      createdAt: editingCelebration?.createdAt || Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-6 relative max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 sm:mb-5 pb-3 border-b border-slate-100 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            {type === 'birthday' ? <Cake className="w-5 h-5" /> : <Award className="w-5 h-5 text-amber-600" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {editingCelebration ? 'Editar Festejo' : 'Agregar Festejo (Global)'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Registrado por el administrador y visible para todas las sucursales de SOLMAR.
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
                className={`py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                className={`py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
              <label className="block font-semibold text-slate-700 mb-1">Nombre del Colaborador</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Sofía Gómez o Martín Perez"
                  className="w-full pl-8 pr-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-teal-700"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 sm:top-2.5" />
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
                  className="w-full pl-8 pr-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-teal-700"
                />
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 sm:top-2.5" />
              </div>
            </div>
          </div>

          {/* AVATAR & GENDER SELECTION MODULE */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Wand2 className="w-3.5 h-3.5 text-teal-700" />
                <span>Avatar Automático (Silueta)</span>
              </span>
              {employeeName && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
                  Detectado: {gender === 'female' ? 'Mujer 👩' : 'Varón 👨'}
                </span>
              )}
            </div>

            {/* Direct selector between the two silhouette avatars */}
            <div className="grid grid-cols-2 gap-3">
              {/* Varón card */}
              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
                  gender === 'male' && !customPhotoUrl
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={AVATAR_MAN}
                    alt="Silueta Hombre"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200"
                  />
                  {gender === 'male' && !customPhotoUrl && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <span>Varón</span>
                    <span className="text-[11px]">👨</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Silueta masculina</div>
                </div>
              </button>

              {/* Mujer card */}
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
                  gender === 'female' && !customPhotoUrl
                    ? 'bg-pink-50/80 border-pink-500 ring-2 ring-pink-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={AVATAR_WOMAN}
                    alt="Silueta Mujer"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200"
                  />
                  {gender === 'female' && !customPhotoUrl && (
                    <div className="absolute -bottom-1 -right-1 bg-pink-600 text-white rounded-full p-0.5 shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <span>Mujer</span>
                    <span className="text-[11px]">👩</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Silueta femenina</div>
                </div>
              </button>
            </div>

            {/* Optional Custom Photo Input */}
            <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCustomPhotoInput(!showCustomPhotoInput)}
                className="text-[11px] font-semibold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3" />
                <span>{showCustomPhotoInput ? 'Ocultar URL personalizada' : '¿Prefieres usar una foto/URL externa?'}</span>
              </button>
              {customPhotoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomPhotoUrl('');
                    setAvatar(getSmartAvatarUrl(employeeName, gender));
                  }}
                  className="text-[10px] text-rose-600 font-bold hover:underline"
                >
                  Restablecer a silueta
                </button>
              )}
            </div>

            {showCustomPhotoInput && (
              <div className="pt-1">
                <input
                  type="url"
                  value={customPhotoUrl}
                  onChange={(e) => handleCustomPhotoChange(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
              </div>
            )}
          </div>

          {/* Date Selector */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800">
                {type === 'birthday' ? 'Fecha de Cumpleaños' : 'Fecha de Aniversario'}
              </label>
              <button
                type="button"
                onClick={() => setUseDatePickers(!useDatePickers)}
                className="text-[11px] text-teal-800 font-semibold hover:underline"
              >
                {useDatePickers ? 'Escribir manual' : 'Usar selectores'}
              </button>
            </div>

            {useDatePickers ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Día</span>
                  <select
                    value={selectedDay}
                    onChange={(e) => handleDayOrMonthChange(Number(e.target.value), selectedMonth)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-700"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Mes</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleDayOrMonthChange(selectedDay, Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-700"
                  >
                    {MONTHS_ES.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Ej: 18 de Agosto"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            )}

            {/* Countdown Preview */}
            {countdown && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-600">
                <Clock className="w-3.5 h-3.5 text-pink-500" />
                <span>
                  Próximo festejo: <strong>{date}</strong> —{' '}
                  <span className="font-bold text-pink-600">{countdown.relativeLabel}</span>
                </span>
              </div>
            )}
          </div>

          {/* Years (if anniversary) */}
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
                  className="w-full pl-8 pr-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-teal-700"
                />
                <Award className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 sm:top-2.5" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingCelebration ? 'Guardar Cambios' : 'Guardar Festejo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
