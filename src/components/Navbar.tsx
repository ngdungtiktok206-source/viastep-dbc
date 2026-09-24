import React from 'react';
import { UserRole } from '../types';
import {
  Car,
  ShieldCheck,
  Scale,
  Bot,
  User as UserIcon,
  Building2,
  Lock,
  ChevronDown,
} from 'lucide-react';

interface Props {
  currentRole: UserRole;
  onRoleChange: (role: UserRole, operatorId?: string) => void;
  currentUser: any;
  currentOperator: any;
  operators: any[];
  onOpenLegal: () => void;
  onOpenAi: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentRole,
  onRoleChange,
  currentUser,
  currentOperator,
  operators,
  onOpenLegal,
  onOpenAi,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    Via<span className="text-indigo-600">Step</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    SÀN TMĐT VẬN TẢI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Kết nối xe hợp đồng dưới 8 chỗ có giấy phép
                </p>
              </div>
            </div>

            {/* Compliance Badge */}
            <button
              onClick={onOpenLegal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium transition-colors"
              title="Xem quy chế sàn theo NĐ 10/2020 & 47/2022"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tuân thủ NĐ 10/2020 & NĐ 47/2022</span>
            </button>
          </div>

          {/* Center: Role Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onRoleChange('passenger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'passenger'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>1. Hành khách</span>
            </button>

            <button
              onClick={() => onRoleChange('operator', 'op-anbinh')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'operator'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>2. Nhà xe (HTX/DN)</span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>3. Quản trị ViaStep</span>
            </button>
          </div>

          {/* Right Action Icons & Operator Selector */}
          <div className="flex items-center gap-2">
            {/* If Operator role, dropdown to test different cooperatives */}
            {currentRole === 'operator' && (
              <div className="relative inline-block text-left mr-1">
                <select
                  value={currentOperator?.id || ''}
                  onChange={(e) => onRoleChange('operator', e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.businessName.length > 25
                        ? op.businessName.substring(0, 25) + '...'
                        : op.businessName}{' '}
                      ({op.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Legal Charter Modal Trigger */}
            <button
              onClick={onOpenLegal}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors text-xs flex items-center gap-1"
              title="Quy chế sàn TMĐT"
            >
              <Scale className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline font-medium">Quy chế sàn</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden md:inline">Trợ lý Pháp lý (AI)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
