import React, { useState } from 'react';
import { ElectronicContract } from '../../types';
import { CreditCard, QrCode, ShieldCheck, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface Props {
  contract: ElectronicContract | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<Props> = ({ contract, isOpen, onClose, onPaymentSuccess }) => {
  const [method, setMethod] = useState<'vnpay' | 'momo' | 'bank_transfer_qr'>('bank_transfer_qr');
  const [loading, setLoading] = useState(false);
  const [manualConfirmed, setManualConfirmed] = useState(false);

  if (!isOpen || !contract) return null;

  const handleConfirmPayment = async () => {
    if (!manualConfirmed) {
      alert('Vui lòng tích chọn xác nhận kiểm tra số tiền và thông tin hợp đồng trước khi thanh toán.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: contract.id,
          method,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(
          `Thanh toán thành công ${contract.totalAmount.toLocaleString('vi-VN')} VNĐ! Hợp đồng vận chuyển có hiệu lực đầy đủ.`
        );
        onPaymentSuccess();
        onClose();
      } else {
        alert('Lỗi: ' + (data.error || 'Không thể xử lý giao dịch'));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối cổng thanh toán sandbox.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cổng Thanh Toán Ký Quỹ & Bảo Đảm
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Môi trường Sandbox kiểm thử an toàn
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Amount Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-800 text-white shadow-md">
            <span className="text-[11px] text-indigo-200 uppercase tracking-wider block">
              Tổng số tiền cần thanh toán
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold">
                {contract.totalAmount.toLocaleString('vi-VN')}{' '}
                <span className="text-xs font-normal text-indigo-200">VNĐ</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                {contract.seats} chỗ ngồi
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-indigo-100 space-y-0.5">
              <p>
                <strong>Đơn vị thụ hưởng vận tải:</strong> {contract.operatorName}
              </p>
              <p>
                <strong>Mã hợp đồng:</strong> {contract.contractCode}
              </p>
              <p className="text-[10px] text-indigo-300">
                (Đúng giá {contract.pricePerSeat.toLocaleString('vi-VN')} đ/chỗ do đơn vị vận tải tự niêm yết)
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="font-bold text-slate-900 block mb-2">
              Chọn phương thức thanh toán:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('bank_transfer_qr')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  method === 'bank_transfer_qr'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span className="text-[11px]">VietQR Chuyển khoản</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('vnpay')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  method === 'vnpay'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-[11px]">VNPAY-QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('momo')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  method === 'momo'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-[10px]">
                  M
                </div>
                <span className="text-[11px]">Ví MoMo</span>
              </button>
            </div>
          </div>

          {/* QR Simulation Box */}
          {method === 'bank_transfer_qr' && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p>
                  <strong>Ngân hàng thụ hưởng:</strong> Vietcombank
                </p>
                <p>
                  <strong>Số tài khoản:</strong> 0011004389922 (Tài khoản ký quỹ)
                </p>
                <p>
                  <strong>Nội dung:</strong> {contract.contractCode}
                </p>
              </div>
            </div>
          )}

          {/* Manual Confirmation Step (Mandatory per prompt constraint) */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="manual-confirm"
                checked={manualConfirmed}
                onChange={(e) => setManualConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="manual-confirm" className="text-[11px] text-amber-900 font-medium cursor-pointer">
                <strong>Bước xác nhận an toàn thủ công:</strong> Tôi xác nhận đã kiểm tra hợp đồng số{' '}
                {contract.contractCode}, điểm đón/trả và đồng ý thanh toán số tiền{' '}
                {contract.totalAmount.toLocaleString('vi-VN')} VNĐ cho đơn vị vận tải {contract.operatorName}.
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={loading || !manualConfirmed}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Đang giao dịch...' : 'Xác Nhận & Hoàn Tất Thanh Toán'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
