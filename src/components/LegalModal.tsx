import React from 'react';
import { LEGAL_FRAMEWORK } from '../data/legalPolicy';
import { ShieldCheck, Scale, FileText, Clock, MapPin, AlertCircle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Quy Chế Hoạt Động & Bảo Đảm Pháp Lý ViaStep
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Căn cứ Nghị định 10/2020/NĐ-CP, Nghị định 47/2022/NĐ-CP & Luật Giao dịch điện tử
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-700">
          {/* Key Disclaimer Callout */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">
                Tuyên bố bản chất công nghệ trung gian:
              </p>
              <p className="text-amber-800 text-xs mt-1">
                ViaStep <strong>KHÔNG sở hữu xe</strong>, <strong>KHÔNG thuê lái xe</strong>,{' '}
                <strong>KHÔNG tự đặt giá cước</strong>, và <strong>KHÔNG điều động xe</strong>.
                ViaStep là phần mềm sàn TMĐT kết nối hành khách với các đơn vị vận tải xe hợp đồng
                dưới 8 chỗ đã được Sở GTVT cấp phép hợp pháp.
              </p>
            </div>
          </div>

          {/* Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEGAL_FRAMEWORK.corePrinciples.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  {idx === 0 && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  {idx === 1 && <Scale className="w-4 h-4 text-indigo-600" />}
                  {idx === 2 && <Clock className="w-4 h-4 text-amber-600" />}
                  {idx === 3 && <MapPin className="w-4 h-4 text-rose-600" />}
                  {idx === 4 && <FileText className="w-4 h-4 text-blue-600" />}
                  {idx === 5 && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  <h3 className="font-bold text-slate-900 text-sm">{rule.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-normal">{rule.content}</p>
              </div>
            ))}
          </div>

          {/* Legal References */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Văn bản quy phạm pháp luật áp dụng:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 list-disc list-inside">
              {LEGAL_FRAMEWORK.applicableLaws.map((law, idx) => (
                <li key={idx}>{law}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Hợp đồng vận chuyển lưu trữ tối thiểu 03 năm theo quy định thanh tra.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
          >
            Tôi Đã Hiểu & Đồng Ý
          </button>
        </div>
      </div>
    </div>
  );
};
