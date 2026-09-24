import React, { useState } from 'react';
import { AlertTriangle, Send, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contracts: any[];
  onComplaintSubmitted: () => void;
}

export const ComplaintModal: React.FC<Props> = ({ isOpen, onClose, contracts, onComplaintSubmitted }) => {
  const [selectedContractId, setSelectedContractId] = useState(
    contracts[0]?.contractCode || 'HDDT-2026-0008'
  );
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContractId,
          subject,
          content,
          filedByRole: 'passenger',
          filedByName: 'Nguyễn Văn Hùng',
          targetPartyName: 'Đơn vị Vận tải liên quan',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Khiếu nại của bạn đã được ghi nhận. Ban Quản Trị ViaStep sẽ thụ lý và phản hồi trong 24h.');
        onComplaintSubmitted();
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Không thể gửi khiếu nại lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gửi Khiếu Nại & Phản Ánh Dịch Vụ
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ban Quản Trị ViaStep giám sát và xử lý độc lập
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Gắn với Mã Hợp đồng vận chuyển điện tử:
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {contracts.length > 0 ? (
                contracts.map((c) => (
                  <option key={c.id} value={c.contractCode}>
                    {c.contractCode} ({c.corridorName} - {c.operatorName})
                  </option>
                ))
              ) : (
                <option value="HDDT-2026-CHUNG">HDDT-2026-CHUNG (Chuyến đi gần nhất)</option>
              )}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Tiêu đề khiếu nại:
            </label>
            <input
              type="text"
              required
              placeholder="VD: Lái xe đón trễ giờ, phương tiện không đúng thỏa thuận..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Nội dung phản ánh chi tiết:
            </label>
            <textarea
              required
              rows={4}
              placeholder="Mô tả cụ thể thời gian, biển số xe, hành vi hoặc vấn đề phát sinh..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            Mọi khiếu nại được lưu trữ nhật ký xử lý minh bạch (Audit Trail) để cơ quan quản lý và các
            bên cùng theo dõi.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Đang gửi...' : 'Gửi Khiếu Nại'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
