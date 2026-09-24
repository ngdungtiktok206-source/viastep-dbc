import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, AppState, Operator } from './types';
import { Navbar } from './components/Navbar';
import { LegalModal } from './components/LegalModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { PassengerDashboard } from './components/passenger/PassengerDashboard';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  Car,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<UserRole>('passenger');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('op-anbinh');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // App Data State
  const [appData, setAppData] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch full state from server
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setAppData(data);
      }
    } catch (e) {
      console.error('Failed to load state', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    // Poll updates every 6 seconds to keep live matching and proposals fresh
    const interval = setInterval(fetchState, 6000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleRoleChange = (newRole: UserRole, operatorId?: string) => {
    setRole(newRole);
    if (operatorId) {
      setSelectedOperatorId(operatorId);
    }
  };

  const currentOperator =
    appData?.operators.find((op: Operator) => op.id === selectedOperatorId) ||
    appData?.operators[0] ||
    null;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentRole={role}
        onRoleChange={handleRoleChange}
        currentUser={appData?.currentUser}
        currentOperator={currentOperator}
        operators={appData?.operators || []}
        onOpenLegal={() => setIsLegalModalOpen(true)}
        onOpenAi={() => setIsAiDrawerOpen(true)}
      />

      {/* Interactive Walkthrough / Test Guide Banner */}
      <div className="bg-indigo-900 text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-700 font-bold uppercase text-[10px] tracking-wider text-amber-300">
              Quy Trình Nghiệp Vụ MVP
            </span>
            <span className="text-indigo-200">
              Chuyển đổi 3 vai trò ở thanh trên để kiểm thử luồng khép kín:
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium text-indigo-200 overflow-x-auto">
            <span className={role === 'passenger' ? 'text-amber-300 font-bold underline' : ''}>
              1. Đặt chỗ (Hành khách)
            </span>
            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className={role === 'operator' ? 'text-amber-300 font-bold underline' : ''}>
              2. Nhận gói ghép (Nhà xe)
            </span>
            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className={role === 'passenger' ? 'text-amber-300 font-bold underline' : ''}>
              3. Ký HĐ & Thanh toán (Hành khách)
            </span>
            <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className={role === 'operator' ? 'text-amber-300 font-bold underline' : ''}>
              4. Cập nhật đón khách (Nhà xe)
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !appData ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Đang tải dữ liệu sàn giao dịch ViaStep...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Passenger View */}
            {role === 'passenger' && (
              <PassengerDashboard
                requests={appData?.requests || []}
                contracts={appData?.contracts || []}
                trips={appData?.trips || []}
                corridors={appData?.corridors || []}
                operators={appData?.operators || []}
                onRefreshData={fetchState}
              />
            )}

            {/* Operator View */}
            {role === 'operator' && (
              <OperatorDashboard
                currentOperator={currentOperator}
                proposals={appData?.proposals || []}
                contracts={appData?.contracts || []}
                trips={appData?.trips || []}
                corridors={appData?.corridors || []}
                onRefreshData={fetchState}
                onSwitchOperator={(id) => setSelectedOperatorId(id)}
              />
            )}

            {/* Admin View */}
            {role === 'admin' && (
              <AdminDashboard
                operators={appData?.operators || []}
                proposals={appData?.proposals || []}
                contracts={appData?.contracts || []}
                complaints={appData?.complaints || []}
                auditLogs={appData?.auditLogs || []}
                onRefreshData={fetchState}
              />
            )}
          </>
        )}
      </main>

      {/* Legal Charter Modal */}
      <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} />

      {/* AI Legal & Dispatch Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onOpenComplaint={() => {
          setIsAiDrawerOpen(false);
          setRole('passenger');
        }}
      />

      {/* Footer with Legal Disclaimers */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-700">
              ViaStep © 2026 — Sàn Thương Mại Điện Tử Kết Nối Vận Tải Xe Hợp Đồng Liên Tỉnh
            </p>
            <p className="text-[11px] text-slate-400">
              Tuân thủ Nghị định 10/2020/NĐ-CP, Nghị định 47/2022/NĐ-CP & Luật Giao dịch điện tử. Không
              sở hữu xe, không điều xe, không ấn định giá cước.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Quy chế hoạt động sàn
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Hợp đồng mẫu & Chữ ký số
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Hỗ trợ 24/7 (1900-6868)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
