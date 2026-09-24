import React, { useState } from 'react';
import { ElectronicContract } from '../../types';
import { FileText, ShieldCheck, CheckCircle2, Download, Printer, X, Award, AlertCircle } from 'lucide-react';

interface Props {
  contract: ElectronicContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSignContract: (contractId: string) => Promise<void>;
  onProceedToPayment: (contract: ElectronicContract) => void;
}

export const ContractViewModal: React.FC<Props> = ({
  contract,
  isOpen,
  onClose,
  onSignContract,
  onProceedToPayment,
}) => {
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  if (!isOpen || !contract) return null;

  const handleSign = async () => {
    setSigning(true);
    try {
      await onSignContract(contract.id);
      setSignedSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSigning(false);
    }
  };

  const isPassengerSigned =
    contract.status === 'passenger_signed' || contract.status === 'fully_executed' || signedSuccess;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Hợp Đồng Vận Chuyển Hành Khách Điện Tử
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                  {contract.contractCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Căn cứ Nghị định 10/2020/NĐ-CP & Luật Giao dịch điện tử • Lưu trữ 03 năm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Paper Viewer */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 bg-white">
          {/* Header Banner */}
          <div className="text-center pb-4 border-b border-slate-200">
            <p className="font-bold text-slate-900 tracking-wide uppercase text-sm">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[11px] font-semibold text-slate-700">Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-24 h-0.5 bg-slate-300 mx-auto my-2" />
            <h4 className="font-extrabold text-indigo-900 text-base mt-2">
              HỢP ĐỒNG VẬN CHUYỂN HÀNH KHÁCH BẰNG XE Ô TÔ
            </h4>
            <p className="text-slate-500 text-[11px]">
              (Áp dụng cho xe hợp đồng dưới 08 chỗ ngồi theo quy định Bộ Giao thông Vận tải)
            </p>
            <p className="text-slate-500 font-mono text-[11px] mt-1">
              Số: <strong className="text-slate-800">{contract.contractCode}</strong> • Ngày lập:{' '}
              {new Date(contract.issuedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Legal Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Hợp đồng này được phát hành <strong>riêng biệt cho hành khách {contract.passengerName}</strong>{' '}
              với đúng mức giá niêm yết của đơn vị vận tải <strong>{contract.operatorName}</strong>.
              ViaStep đóng vai trò là sàn giao dịch TMĐT chứng nhận hợp đồng.
            </span>
          </div>

          {/* Parties Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="font-bold text-indigo-900 uppercase text-[11px] block border-b pb-1">
                Bên Vận Tải (Bên A - Đơn vị có giấy phép):
              </span>
              <p>
                <strong>Tên đơn vị:</strong> {contract.operatorName}
              </p>
              <p>
                <strong>Số Giấy phép KDVT:</strong> {contract.operatorLicense}
              </p>
              <p>
                <strong>Mã số thuế:</strong> {contract.operatorTaxCode}
              </p>
              <p>
                <strong>Phương tiện:</strong> Xe hợp đồng dưới 8 chỗ ngồi, có phù hiệu hợp lệ
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="font-bold text-indigo-900 uppercase text-[11px] block border-b pb-1">
                Bên Thuê Vận Chuyển (Bên B - Hành khách):
              </span>
              <p>
                <strong>Họ tên hành khách:</strong> {contract.passengerName}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {contract.passengerPhone}
              </p>
              <p>
                <strong>Số lượng chỗ ngồi:</strong> {contract.seats} chỗ
              </p>
              <p>
                <strong>Hành lang:</strong> {contract.corridorName}
              </p>
            </div>
          </div>

          {/* Route & Times */}
          <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 uppercase text-[11px] block border-b pb-1">
              Điều 1: Lộ trình và Địa chỉ đón/trả tận nơi (Không có bến cố định)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-500 font-medium">Địa chỉ đón tận nơi:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{contract.pickupAddress}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Địa chỉ trả tận nơi:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{contract.dropoffAddress}</p>
              </div>
            </div>
            <p className="text-slate-500 text-[11px] pt-1">
              • Ngày khởi hành: <strong>{contract.travelDate}</strong> | Khung giờ đón dự kiến:{' '}
              <strong>{contract.estimatedPickupTime}</strong>
            </p>
          </div>

          {/* Fare & Payments */}
          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
            <span className="font-bold text-indigo-950 uppercase text-[11px] block border-b border-indigo-200 pb-1">
              Điều 2: Giá cước vận chuyển (Đúng theo biểu giá của Bên A)
            </span>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-slate-600">
                  Đơn giá cước do Bên A ({contract.operatorName}) niêm yết:
                </p>
                <p className="text-[11px] text-slate-500">
                  (Đã bao gồm thuế GTGT, phí cầu đường, bảo hiểm trách nhiệm dân sự)
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">
                  {contract.pricePerSeat.toLocaleString('vi-VN')} đ/chỗ
                </span>
                <p className="text-xs text-slate-500">x {contract.seats} chỗ</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
              <span className="font-extrabold text-slate-900 text-sm">
                Tổng cước vận chuyển thanh toán:
              </span>
              <span className="text-base font-extrabold text-indigo-700">
                {contract.totalAmount.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>

          {/* Legal Terms Summary */}
          <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
            <p>
              <strong>Điều 3: Cam kết pháp lý & Lưu trữ dữ liệu:</strong>
            </p>
            <p>
              3.1. Hợp đồng vận chuyển điện tử này được tạo lập theo Điều 13, 14 Nghị định 10/2020/NĐ-CP
              và Nghị định 47/2022/NĐ-CP, có đầy đủ giá trị pháp lý ràng buộc giữa Bên Vận tải và Hành
              khách.
            </p>
            <p>
              3.2. Dữ liệu hợp đồng được mã hóa và lưu trữ an toàn trên nền tảng tối thiểu 03 (ba) năm
              nhằm phục vụ việc thanh tra, kiểm tra chuyên ngành của cơ quan nhà nước có thẩm quyền.
            </p>
          </div>

          {/* Digital Signatures Box */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            {/* Operator Signature */}
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center">
              <p className="font-bold text-slate-900 text-xs">ĐẠI DIỆN BÊN VẬN TẢI (BÊN A)</p>
              <div className="my-2 p-2 bg-white rounded-lg border border-emerald-300 inline-block shadow-2xs">
                <Award className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="text-[10px] font-bold text-emerald-800 mt-1">ĐÃ KÝ SỐ ĐIỆN TỬ</p>
                <p className="text-[9px] text-slate-500 font-mono">
                  {contract.signature.providerCertificate}
                </p>
                <p className="text-[9px] text-slate-400">
                  {new Date(contract.signature.operatorSignedAt || contract.issuedAt).toLocaleString(
                    'vi-VN'
                  )}
                </p>
              </div>
            </div>

            {/* Passenger Signature */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <p className="font-bold text-slate-900 text-xs">HÀNH KHÁCH (BÊN B)</p>
              {isPassengerSigned ? (
                <div className="my-2 p-2 bg-white rounded-lg border border-indigo-300 inline-block shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mx-auto" />
                  <p className="text-[10px] font-bold text-indigo-800 mt-1">ĐÃ KÝ ĐIỆN TỬ</p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    Xác thực OTP qua số {contract.passengerPhone}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {new Date(contract.signature.passengerSignedAt || Date.now()).toLocaleString(
                      'vi-VN'
                    )}
                  </p>
                </div>
              ) : (
                <div className="my-2 py-3">
                  <p className="text-[11px] text-amber-700 font-medium">Chưa ký hợp đồng</p>
                  <p className="text-[10px] text-slate-500">Cần ký để kích hoạt thanh toán</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In hợp đồng</span>
            </button>
            <button
              onClick={() => alert('Đã tạo tệp sao lưu điện tử hợp đồng: ' + contract.contractCode + '.pdf')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải bản PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isPassengerSigned ? (
              <button
                onClick={handleSign}
                disabled={signing}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{signing ? 'Đang xác thực chữ ký...' : 'Ký Hợp Đồng Điện Tử Này'}</span>
              </button>
            ) : contract.status === 'fully_executed' ? (
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Hợp Đồng Đã Ký & Đã Thanh Toán
              </span>
            ) : (
              <button
                onClick={() => onProceedToPayment(contract)}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <span>Tiến Hành Thanh Toán ({contract.totalAmount.toLocaleString('vi-VN')} đ)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
