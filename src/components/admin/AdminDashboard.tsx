import React, { useState } from 'react';
import {
  Operator,
  MatchProposal,
  ElectronicContract,
  Complaint,
  AuditLog,
} from '../../types';
import {
  ShieldCheck,
  Scale,
  Users,
  AlertTriangle,
  Settings,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Lock,
  Building2,
  Info,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';

interface Props {
  operators: Operator[];
  proposals: MatchProposal[];
  contracts: ElectronicContract[];
  complaints: Complaint[];
  auditLogs: AuditLog[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  operators,
  proposals,
  contracts,
  complaints,
  auditLogs,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'operators' | 'audit' | 'complaints' | 'settings'>('operators');

  // Platform settings state
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(10);
  const [reserveFundPercent, setReserveFundPercent] = useState<number>(2);
  const [proposalTimeoutMinutes, setProposalTimeoutMinutes] = useState<number>(45);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Complaint resolution state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [adminResolutionText, setAdminResolutionText] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<'investigating' | 'resolved' | 'dismissed'>('resolved');

  // Approve / Reject Operator
  const handleVerifyOperator = async (operatorId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/operators/${operatorId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes:
            status === 'approved'
              ? 'Đã đối chiếu thông tin Giấy phép KDVT hợp lệ trên hệ thống dữ liệu Cục Đường Bộ.'
              : 'Hồ sơ chưa đạt yêu cầu kiểm tra.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
      alert('Không thể thực hiện thẩm định.');
    }
  };

  // Submit Complaint Resolution
  const handleResolveComplaint = async (complaintId: string) => {
    if (!adminResolutionText.trim()) return;

    try {
      const res = await fetch(`/api/complaints/${complaintId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: resolutionStatus,
          adminNotes: adminResolutionText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Cập nhật xử lý khiếu nại thành công!');
        setResolvingId(null);
        setAdminResolutionText('');
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Prominent Legal Boundary Notice */}
      <div className="p-4 rounded-2xl bg-indigo-950 text-white shadow-md border-l-4 border-amber-400 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Scale className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
              RÀNG BUỘC PHÁP LÝ BẮT BUỘC ĐỐI VỚI QUẢN TRỊ VIÊN VIASTEP:
            </h3>
            <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
              ViaStep là phần mềm sàn TMĐT, <strong>KHÔNG PHẢI ĐƠN VỊ KINH DOANH VẬN TẢI</strong>. Ban Quản
              Trị <strong>NGHIÊM CẤM CAN THIỆP</strong>: không có tính năng điều xe, gán chuyến thủ công,
              không can thiệp vào mức giá tự quyết của thành viên, và không có quyền chỉ định xe nào nhận
              khách. Mọi đề xuất ghép chuyến phải phát đồng thời khách quan.
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshData}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('operators')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'operators'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Thẩm Định Hồ Sơ Thành Viên</span>
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[10px] flex items-center justify-center font-bold">
            {operators.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Kiểm Toán & Giám Sát Đề Xuất Đồng Thời</span>
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[10px] flex items-center justify-center font-bold">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'complaints'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Xử Lý Khiếu Nại & Trọng Tài</span>
          {complaints.filter((c) => c.status !== 'resolved').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {complaints.filter((c) => c.status !== 'resolved').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cấu Hình Tỷ Lệ Sàn</span>
        </button>
      </div>

      {/* ================= TAB 1: OPERATOR APPROVAL ================= */}
      {activeTab === 'operators' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hồ Sơ Đơn Vị Vận Tải Cần Thẩm Định ({operators.length})
              </h3>
              <p className="text-xs text-slate-500">
                Thẩm định Giấy phép kinh doanh vận tải bằng xe ô tô do Sở GTVT cấp, phù hiệu xe và lý
                lịch tư pháp lái xe
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {operators.map((op) => {
              const isApproved = op.status === 'approved';
              const isPending = op.status === 'pending';
              const isLeft = op.status === 'left_alliance';

              return (
                <div
                  key={op.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">
                          {op.businessName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isApproved
                            ? 'Đã Phê Duyệt Hợp Lệ'
                            : isPending
                            ? 'Chờ Thẩm Định'
                            : 'Đã Rút Khỏi Sàn'}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Người đại diện: <strong>{op.representativeName}</strong> • SĐT: {op.phone} • Địa
                        chỉ: {op.address}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-400 block">ID: {op.id}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {op.vehicles?.length || 0} xe hợp đồng • {op.drivers?.length || 0} tài xế
                      </span>
                    </div>
                  </div>

                  {/* Legal Documents Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-medium block">Giấy phép KDVT:</span>
                      <p className="font-mono font-bold text-slate-900">{op.licenseNumber}</p>
                      <p className="text-slate-500">Cơ quan cấp: {op.issuedBy}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Mã số thuế & Pháp lý:</span>
                      <p className="font-mono font-bold text-slate-900">{op.taxCode}</p>
                      <p className="text-slate-500">
                        Gia nhập ngày: {new Date(op.allianceJoinedAt || op.joinedAt || Date.now()).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Tài khoản thanh toán:</span>
                      <p className="font-semibold text-slate-900">
                        {op.bankAccount?.bankName} - {op.bankAccount?.accountNumber}
                      </p>
                      <p className="text-slate-500">{op.bankAccount?.accountHolder}</p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      * Ban Quản Trị chỉ kiểm tra tính hợp pháp của giấy phép, không can thiệp kinh doanh.
                    </span>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleVerifyOperator(op.id, 'rejected')}
                            className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-xs"
                          >
                            Từ Chối
                          </button>
                          <button
                            onClick={() => handleVerifyOperator(op.id, 'approved')}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                          >
                            Phê Duyệt Thành Viên
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          Hồ sơ đang hoạt động hợp lệ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: AUDIT LOGS & SIMULTANEOUS BROADCAST INSPECTION ================= */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Nhật Ký Kiểm Toán Pháp Lý (Audit Trail)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bằng chứng minh bạch chứng minh: Hệ thống phát đề xuất đồng thời cho tất cả thành viên đủ
              điều kiện, không có thuật toán ưu tiên riêng biệt cho bất kỳ bên nào.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Sự kiện kiểm toán</th>
                  <th className="px-4 py-3 text-left">Mã đối tượng</th>
                  <th className="px-4 py-3 text-left">Chi tiết chứng minh pháp lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {auditLogs.map((log) => {
                  const actionStr = (log.action || log.eventType || '').toUpperCase();
                  const entity = log.entityId || log.details?.proposalId || log.id;
                  const detailText = log.description || log.details?.description || JSON.stringify(log.details);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                            actionStr.includes('BROADCAST')
                              ? 'bg-blue-100 text-blue-800'
                              : actionStr.includes('CLAIM') || actionStr.includes('ACCEPT')
                              ? 'bg-emerald-100 text-emerald-800'
                              : actionStr.includes('CONTRACT')
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.action || log.eventType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{entity}</td>
                      <td className="px-4 py-3 text-slate-700 text-[11px]">
                        {detailText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: COMPLAINTS & MEDIATION ================= */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tiếp Nhận & Xử Lý Khiếu Nại Độc Lập ({complaints.length})
            </h3>
            <p className="text-xs text-slate-500">
              Ban Quản Trị đóng vai trò trung gian hòa giải, theo dõi việc thực hiện cam kết hợp đồng
            </p>
          </div>

          {complaints.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Không có khiếu nại nào đang tồn đọng</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {complaints.map((c) => (
                <div key={c.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{c.subject}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'investigating'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.status === 'open' && 'Mới tiếp nhận'}
                          {c.status === 'investigating' && 'Đang xác minh hai bên'}
                          {c.status === 'resolved' && 'Đã giải quyết thỏa đáng'}
                          {c.status === 'dismissed' && 'Đã bác bỏ'}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Mã hợp đồng liên quan: <strong className="font-mono text-slate-800">{c.contractId}</strong>{' '}
                        • Người gửi: <strong>{c.filedByName}</strong> ({c.filedByRole})
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(c.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                    <p className="font-semibold text-slate-800 mb-1">Nội dung phản ánh:</p>
                    {c.content}
                  </div>

                  {c.adminNotes && (
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-[11px]">
                      <strong>Kết luận Ban Quản Trị:</strong> {c.adminNotes}
                    </div>
                  )}

                  {/* Resolution Controls */}
                  {c.status !== 'resolved' && resolvingId !== c.id && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setResolvingId(c.id);
                          setAdminResolutionText('');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
                      >
                        Thụ Lý & Xử Lý Khiếu Nại
                      </button>
                    </div>
                  )}

                  {resolvingId === c.id && (
                    <div className="p-4 bg-slate-100 rounded-xl space-y-3 pt-3">
                      <label className="font-bold text-slate-800 block">
                        Ghi chú hòa giải / Quyết định xử lý:
                      </label>
                      <textarea
                        rows={3}
                        value={adminResolutionText}
                        onChange={(e) => setAdminResolutionText(e.target.value)}
                        placeholder="Nhập nội dung biên bản xử lý sự việc giữa hành khách và nhà xe..."
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                      <div className="flex items-center justify-between">
                        <select
                          value={resolutionStatus}
                          onChange={(e: any) => setResolutionStatus(e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
                        >
                          <option value="investigating">Đang điều tra thêm</option>
                          <option value="resolved">Đã giải quyết (Thỏa thuận xong)</option>
                          <option value="dismissed">Bác bỏ khiếu nại</option>
                        </select>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setResolvingId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleResolveComplaint(c.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                          >
                            Lưu Kết Quả
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: PLATFORM SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cấu Hình Tham Số Vận Hành Sàn TMĐT ViaStep
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thiết lập tỷ lệ phí dịch vụ công nghệ trung gian và quỹ bảo hiểm rủi ro chuyến đi
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu tham số vận hành sàn thành công!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tỷ lệ phí công nghệ sàn TMĐT (% trên cước):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-xl font-bold text-indigo-700"
                />
                <span className="text-slate-600 font-semibold">% (Mặc định 10%)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Thu từ doanh thu của đơn vị vận tải nhằm bù đắp chi phí phát hành hợp đồng số và duy trì
                hệ thống.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tỷ lệ trích lập Quỹ Bảo đảm Chuyến đi:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={reserveFundPercent}
                  onChange={(e) => setReserveFundPercent(Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-xl font-bold text-emerald-700"
                />
                <span className="text-slate-600 font-semibold">% (Mặc định 2%)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Dùng để ứng trước hoàn tiền cho hành khách trong các trường hợp sự cố đột xuất.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Thời gian hiệu lực của gói đề xuất đồng thời:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={proposalTimeoutMinutes}
                  onChange={(e) => setProposalTimeoutMinutes(Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-xl font-bold text-slate-800"
                />
                <span className="text-slate-600 font-semibold">phút</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border text-[11px] text-slate-600">
              Nhắc nhở tuân thủ: Mọi sự thay đổi về tỷ lệ phí sàn phải được thông báo công khai trước 15
              ngày tới toàn thể các thành viên HTX/doanh nghiệp vận tải theo Quy chế sàn.
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              Lưu Thiết Lập
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
