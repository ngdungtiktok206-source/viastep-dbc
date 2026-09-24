import React, { useState, useEffect } from 'react';
import {
  Operator,
  MatchProposal,
  ElectronicContract,
  Trip,
  Corridor,
  Vehicle,
  Driver,
  PriceTableEntry,
  AvailabilitySlot,
} from '../../types';
import {
  Inbox,
  DollarSign,
  Clock,
  Car,
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  LogOut,
  Building2,
  Calendar,
  MapPin,
  RefreshCw,
  Phone,
} from 'lucide-react';

interface Props {
  currentOperator: Operator | null;
  proposals: MatchProposal[];
  contracts: ElectronicContract[];
  trips: Trip[];
  corridors: Corridor[];
  onRefreshData: () => void;
  onSwitchOperator: (opId: string) => void;
}

export const OperatorDashboard: React.FC<Props> = ({
  currentOperator,
  proposals,
  contracts,
  trips,
  corridors,
  onRefreshData,
  onSwitchOperator,
}) => {
  const [activeTab, setActiveTab] = useState<
    'inbox' | 'pricing' | 'slots' | 'fleet' | 'trips' | 'finance' | 'register'
  >('inbox');

  const opId = currentOperator?.id || 'op-anbinh';

  // State for Price Table
  const [operatorPrices, setOperatorPrices] = useState<PriceTableEntry[]>(
    (currentOperator as any)?.prices || []
  );
  const [editingCorridorId, setEditingCorridorId] = useState(corridors[0]?.id || '');
  const [editingPrice, setEditingPrice] = useState<number>(190000);
  const [priceSaving, setPriceSaving] = useState(false);

  // State for Availability Slot
  const [slotDate, setSlotDate] = useState('2026-09-24');
  const [slotCorridorId, setSlotCorridorId] = useState(corridors[0]?.id || '');
  const [slotTimeStart, setSlotTimeStart] = useState('07:00');
  const [slotTimeEnd, setSlotTimeEnd] = useState('09:30');
  const [slotSeats, setSlotSeats] = useState(7);
  const [slotNotes, setSlotNotes] = useState('Khung giờ sẵn sàng linh hoạt');

  // State for Vehicles & Drivers
  const [newPlate, setNewPlate] = useState('29B-998.22');
  const [newModel, setNewModel] = useState('Kia Carnival 2025 (7 chỗ)');
  const [newBadge, setNewBadge] = useState('HD-29-09881');

  const [newDriverName, setNewDriverName] = useState('Nguyễn Thế Hùng');
  const [newDriverPhone, setNewDriverPhone] = useState('0971223344');
  const [newDriverClass, setNewDriverClass] = useState<'B2' | 'D' | 'E'>('D');
  const [newDriverRecord, setNewDriverRecord] = useState('LLTP-01/2026-9812');

  // Registration form state for new operator
  const [regName, setRegName] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regTax, setRegTax] = useState('');
  const [regRep, setRegRep] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Quit alliance confirmation
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Filter operator-specific data
  const myProposals = proposals.filter(
    (p) => p.proposedOperatorIds.includes(opId) || p.acceptedOperatorId === opId
  );
  const myContracts = contracts.filter((c) => c.operatorId === opId);
  const myTrips = trips.filter((t) => t.operatorId === opId);
  const myVehicles: Vehicle[] = (currentOperator as any)?.vehicles || [];
  const myDrivers: Driver[] = (currentOperator as any)?.drivers || [];
  const mySlots: AvailabilitySlot[] = (currentOperator as any)?.slots || [];

  // Update local price table when operator changes
  useEffect(() => {
    if (currentOperator) {
      setOperatorPrices((currentOperator as any).prices || []);
    }
  }, [currentOperator]);

  // Handle Accept Proposal (First-to-claim atomic lock)
  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId: opId }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        onRefreshData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi nhận gói ghép.');
    }
  };

  // Handle Decline Proposal
  const handleDeclineProposal = async (proposalId: string) => {
    try {
      await fetch(`/api/proposals/${proposalId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId: opId }),
      });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save Price for Corridor
  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setPriceSaving(true);
    try {
      const res = await fetch('/api/operators/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: opId,
          corridorId: editingCorridorId,
          pricePerSeat: editingPrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(
          `Cập nhật giá thành công! Biểu giá do ${currentOperator?.businessName} tự ban hành đã được áp dụng.`
        );
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
      alert('Không thể lưu giá.');
    } finally {
      setPriceSaving(false);
    }
  };

  // Add Availability Slot
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operators/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: opId,
          corridorId: slotCorridorId,
          date: slotDate,
          timeWindowStart: slotTimeStart,
          timeWindowEnd: slotTimeEnd,
          declaredSeats: slotSeats,
          notes: slotNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Khai báo khung giờ sẵn sàng linh hoạt thành công!');
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operators/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: opId,
          plateNumber: newPlate,
          brandModel: newModel,
          seatCapacity: 7,
          inspectionExpiry: '2027-06-30',
          badgeNumber: newBadge,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Thêm phương tiện xe hợp đồng thành công!');
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Driver
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operators/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: opId,
          fullName: newDriverName,
          phone: newDriverPhone,
          licenseClass: newDriverClass,
          licenseNumber: '01019928374',
          licenseExpiry: '2030-01-01',
          judicialRecordNumber: newDriverRecord,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Thêm lái xe và cập nhật lý lịch tư pháp thành công!');
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Register New Operator
  const handleRegisterNewOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operators/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: regName,
          licenseNumber: regLicense,
          taxCode: regTax,
          representativeName: regRep,
          phone: regPhone,
          address: regAddress,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(
          'Đăng ký hồ sơ thành viên thành công! Hồ sơ đã được gửi tới Ban Quản Trị ViaStep thẩm định giấy phép.'
        );
        onRefreshData();
        onSwitchOperator(data.operator.id);
        setActiveTab('inbox');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi đăng ký hồ sơ.');
    }
  };

  // Leave Alliance
  const handleLeaveAlliance = async () => {
    try {
      const res = await fetch('/api/operators/leave-alliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: opId,
          reason: 'Đơn vị tạm ngừng kinh doanh hoặc rút khỏi sàn theo nguyện vọng',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setShowQuitModal(false);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Advance Trip Status
  const handleAdvanceTrip = async (tripId: string, currentStep: number) => {
    const nextStep = currentStep + 1;
    let statusText = '';
    let status = 'in_transit';

    if (nextStep === 2) {
      statusText = 'Lái xe đang trên đường đón khách tại địa chỉ yêu cầu';
    } else if (nextStep === 3) {
      statusText = 'Đã đón đủ khách, đang di chuyển trên cao tốc/quốc lộ';
    } else if (nextStep === 4) {
      statusText = 'Chuyến đi đã hoàn tất, đã trả khách tận nơi';
      status = 'completed';
    }

    try {
      await fetch(`/api/trips/${tripId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressStep: nextStep,
          statusText,
          status,
        }),
      });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Financial metrics
  const totalGrossRevenue = myContracts
    .filter((c) => c.status === 'fully_executed')
    .reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPlatformFees = myContracts
    .filter((c) => c.status === 'fully_executed')
    .reduce((sum, c) => sum + c.platformFee, 0);
  const totalNetPayout = totalGrossRevenue - totalPlatformFees;

  return (
    <div className="space-y-6">
      {/* Operator Info Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm shrink-0">
            <Building2 className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold">
                {currentOperator?.businessName || 'Hợp Tác Xã Vận Tải An Bình'}
              </h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  currentOperator?.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : currentOperator?.status === 'left_alliance'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {currentOperator?.status === 'approved'
                  ? 'Đã Thẩm Định Giấy Phép'
                  : currentOperator?.status === 'left_alliance'
                  ? 'Đã Rút Khỏi Liên Minh'
                  : 'Đang Chờ Admin Duyệt'}
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1 font-mono">
              Số GPKD Vận tải: <strong>{currentOperator?.licenseNumber}</strong> • Cấp bởi:{' '}
              {currentOperator?.issuedBy}
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Mã số thuế: {currentOperator?.taxCode} • Người đại diện: {currentOperator?.representativeName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => setShowQuitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Rời Liên Minh</span>
          </button>
        </div>
      </div>

      {/* Operator Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'inbox'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Hộp Thư Đề Xuất Gói Ghép</span>
          {myProposals.filter((p) => p.status === 'open').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {myProposals.filter((p) => p.status === 'open').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Bảng Giá Tự Quyết</span>
        </button>

        <button
          onClick={() => setActiveTab('slots')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'slots'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Khung Giờ Sẵn Sàng</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'fleet'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Đội Xe & Lái Xe</span>
        </button>

        <button
          onClick={() => setActiveTab('trips')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'trips'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Chuyến Đi & Hợp Đồng (Lưu 3 năm)</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'finance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Đối Soát Doanh Thu</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'register'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Đăng Ký Hồ Sơ Mới</span>
        </button>
      </div>

      {/* ================= TAB 1: INBOX PROPOSALS ================= */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Regulatory explanation banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Quy tắc Đề Xuất Đồng Thời (Simultaneous Broadcast):</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Các gói ghép được gửi <strong>đồng thời tới tất cả các thành viên đủ điều kiện</strong>{' '}
                (giá thành viên ≤ mức giá trần khách chọn). <strong>Đơn vị nào bấm "Nhận" trước sẽ được nhận gói.</strong>{' '}
                ViaStep hoàn toàn không phân bổ ưu tiên hay can thiệp vào quyết định nhận/từ chối của quý đơn vị.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Gói Ghép Đang Mở Đề Xuất ({myProposals.length})
            </h3>
            <span className="text-xs text-slate-500">
              Biểu giá tính theo bảng giá của chính đơn vị bạn
            </span>
          </div>

          {myProposals.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Hiện chưa có gói đề xuất nào mới</p>
              <p className="text-xs text-slate-500 mt-1">
                Khi có hành khách tạo yêu cầu trên các hành lang bạn đã đăng ký khung giờ sẵn sàng, đề
                xuất sẽ hiển thị tức thì.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myProposals.map((prop) => {
                const isOpen = prop.status === 'open';
                const isAcceptedByMe = prop.acceptedOperatorId === opId;
                const isAcceptedByOther = prop.status === 'accepted' && !isAcceptedByMe;

                // Look up operator's own price
                const opPrice = operatorPrices.find((p) => p.corridorId === prop.corridorId);
                const unitPrice = opPrice ? opPrice.pricePerSeat : 190000;
                const estimatedRevenue = unitPrice * prop.totalSeats;

                return (
                  <div
                    key={prop.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isOpen
                        ? 'border-indigo-300 bg-white shadow-sm'
                        : isAcceptedByMe
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-slate-200 bg-slate-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">
                            {prop.corridorName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOpen
                                ? 'bg-amber-100 text-amber-800'
                                : isAcceptedByMe
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isOpen
                              ? 'ĐANG MỞ ĐỀ XUẤT (Ai bấm trước được)'
                              : isAcceptedByMe
                              ? 'ĐƠN VỊ BẠN ĐÃ NHẬN'
                              : `ĐÃ NHẬN BỞI [${prop.acceptedOperatorName || 'Đơn vị khác'}]`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Ngày đi: <strong>{prop.travelDate}</strong> | Khung giờ gom:{' '}
                          <strong>{prop.timeWindow}</strong> | Tổng khách:{' '}
                          <strong className="text-indigo-900">{prop.totalSeats} chỗ</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-mono block">Mã: {prop.id}</span>
                        <span className="text-sm font-extrabold text-indigo-700 block">
                          Doanh thu dự kiến: {estimatedRevenue.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (Dựa trên giá {unitPrice.toLocaleString('vi-VN')} đ/chỗ của bạn)
                        </span>
                      </div>
                    </div>

                    {/* Pickup & Dropoff merged plan */}
                    <div className="mt-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                      <span className="text-[11px] font-bold text-slate-800 uppercase block">
                        Lộ trình đón/trả gộp của các hành khách trong gói:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-indigo-600 font-semibold block mb-1">
                            Danh sách điểm đón:
                          </span>
                          <ul className="space-y-1 text-slate-700">
                            {prop.pickupList.map((p, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="font-bold text-slate-500">•</span>
                                <span>
                                  <strong>{p.passengerName}</strong> ({p.seats} chỗ): {p.address}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-[10px] text-rose-600 font-semibold block mb-1">
                            Danh sách điểm trả:
                          </span>
                          <ul className="space-y-1 text-slate-700">
                            {prop.dropoffList.map((p, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="font-bold text-slate-500">•</span>
                                <span>
                                  <strong>{p.passengerName}</strong>: {p.address}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Phát đồng thời tới {prop.proposedOperatorIds.length} nhà xe đủ điều kiện lúc{' '}
                        {new Date(prop.sentAt).toLocaleTimeString('vi-VN')}
                      </span>

                      {isOpen ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeclineProposal(prop.id)}
                            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                          >
                            Từ Chối
                          </button>
                          <button
                            onClick={() => handleAcceptProposal(prop.id)}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Nhận Gói Ghép Này (Ai Bấm Trước Được)</span>
                          </button>
                        </div>
                      ) : isAcceptedByMe ? (
                        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Đã Nhận • Hợp Đồng Đã Tự Động Sinh
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          Đã tiếp nhận bởi thành viên khác
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PRICING CONFIG ================= */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quản Lý Bảng Giá Tự Quyết Định Của Đơn Vị
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pháp luật bảo đảm: Đơn vị vận tải hoàn toàn tự chủ trong việc ban hành biểu giá cước cho
              từng hành lang. ViaStep không can thiệp hay áp giá trần/sàn chung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form to update pricing */}
            <form onSubmit={handleSavePrice} className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 uppercase block">Cập nhật biểu giá:</span>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Hành lang vận chuyển:</label>
                <select
                  value={editingCorridorId}
                  onChange={(e) => setEditingCorridorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.distanceKm} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Giá cước niêm yết của đơn vị bạn (VNĐ/chỗ):
                </label>
                <input
                  type="number"
                  step={5000}
                  required
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Mức giá này sẽ được hiển thị công khai tới khách hàng kèm tên đơn vị và ghi trực tiếp
                  vào Hợp đồng điện tử.
                </p>
              </div>

              <button
                type="submit"
                disabled={priceSaving}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                <span>{priceSaving ? 'Đang lưu...' : 'Ban Hành Giá Mới'}</span>
              </button>
            </form>

            {/* Current Pricing Table */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Biểu giá đang áp dụng của {currentOperator?.businessName}:
              </span>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Hành lang</th>
                      <th className="px-4 py-2.5 text-right">Đơn giá niêm yết</th>
                      <th className="px-4 py-2.5 text-left">Cập nhật lần cuối</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {operatorPrices.length > 0 ? (
                      operatorPrices.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3 font-semibold text-slate-900">{p.corridorName}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-indigo-700">
                            {p.pricePerSeat.toLocaleString('vi-VN')} đ/chỗ
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                            {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                          Chưa thiết lập biểu giá nào. Vui lòng thêm mức giá bên cạnh.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: AVAILABILITY SLOTS ================= */}
      {activeTab === 'slots' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Khai Báo Khung Giờ Sẵn Sàng (Linh Hoạt, KHÔNG Lịch Cố Định)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ràng buộc pháp lý: Xe hợp đồng không chạy theo tuyến cố định và không có lịch giờ lặp lại
              cố định. Thành viên chỉ khai báo khung giờ sẵn sàng theo từng ngày.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slot Add Form */}
            <form onSubmit={handleAddSlot} className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 uppercase block">Khai báo năng lực:</span>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Ngày sẵn sàng:</label>
                <input
                  type="date"
                  required
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Hành lang:</label>
                <select
                  value={slotCorridorId}
                  onChange={(e) => setSlotCorridorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Khung giờ sẵn sàng linh hoạt:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slotTimeStart}
                    onChange={(e) => setSlotTimeStart(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={slotTimeEnd}
                    onChange={(e) => setSlotTimeEnd(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Số chỗ xe sẵn sàng:</label>
                <input
                  type="number"
                  max={8}
                  min={1}
                  value={slotSeats}
                  onChange={(e) => setSlotSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Khai Báo Khung Giờ</span>
              </button>
            </form>

            {/* List of active availability slots */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Khung giờ sẵn sàng đã khai báo:
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {mySlots.map((slot) => {
                  const corridor = corridors.find((c) => c.id === slot.corridorId);
                  return (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm">
                          {corridor ? corridor.name : slot.corridorId}
                        </span>
                        <p className="text-slate-600 mt-0.5">
                          Ngày: <strong>{slot.date}</strong> | Khung giờ:{' '}
                          <strong className="text-indigo-700">
                            {slot.timeWindowStart} - {slot.timeWindowEnd}
                          </strong>{' '}
                          | Sẵn sàng: <strong>{slot.declaredSeats} chỗ</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{slot.notes}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đang mở nhận gom
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: FLEET & DRIVERS ================= */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          {/* Vehicles Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Phương Tiện Xe Hợp Đồng Dưới 8 Chỗ ({myVehicles.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Tuân thủ quy định đăng kiểm và phù hiệu Xe Hợp Đồng do Sở GTVT cấp
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myVehicles.map((v) => (
                <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{v.plateNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {v.seatCapacity} chỗ
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">{v.brandModel}</p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-0.5 font-mono">
                    <p>Phù hiệu: {v.badgeNumber}</p>
                    <p>Hạn đăng kiểm: {v.inspectionExpiry}</p>
                  </div>
                </div>
              ))}

              {/* Add Vehicle Card */}
              <form onSubmit={handleAddVehicle} className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">+ Thêm phương tiện mới:</span>
                <input
                  type="text"
                  placeholder="Biển số (VD: 29B-998.22)"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Mẫu xe (VD: Kia Carnival 7 chỗ)"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Số phù hiệu Sở GTVT"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                >
                  Lưu Phương Tiện
                </button>
              </form>
            </div>
          </div>

          {/* Drivers Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Lái Xe Đã Được Thẩm Định Lý Lịch & GPLX ({myDrivers.length})
              </h3>
              <p className="text-xs text-slate-500">
                Bảo đảm lái xe có Giấy phép lái xe hạng phù hợp và Phiếu lý lịch tư pháp số 2 rõ ràng
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myDrivers.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{d.fullName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      GPLX Hạng {d.licenseClass}
                    </span>
                  </div>
                  <p className="text-slate-600 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {d.phone}
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-0.5">
                    <p className="font-mono">Số GPLX: {d.licenseNumber}</p>
                    <p className="text-emerald-700 font-medium">Lý lịch TP: {d.judicialRecordNumber}</p>
                  </div>
                </div>
              ))}

              {/* Add Driver Card */}
              <form onSubmit={handleAddDriver} className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">+ Thêm lái xe mới:</span>
                <input
                  type="text"
                  placeholder="Họ tên lái xe"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Số phiếu Lý lịch tư pháp số 2"
                  value={newDriverRecord}
                  onChange={(e) => setNewDriverRecord(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                >
                  Lưu Hồ Sơ Lái Xe
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: TRIPS & CONTRACTS (ARCHIVED 3 YEARS) ================= */}
      {activeTab === 'trips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Điều Hành Chuyến Đi & Lưu Trữ Hợp Đồng Điện Tử (Tối thiểu 3 năm)
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật tiến trình đón/trả và lưu trữ hợp đồng để phục vụ cơ quan thanh tra
              </p>
            </div>
          </div>

          {myTrips.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Chưa có chuyến đi nào đang xử lý</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myTrips.map((trip) => {
                const tripContracts = myContracts.filter((c) => trip.contractIds.includes(c.id));

                return (
                  <div key={trip.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{trip.corridorName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                            Ngày: {trip.travelDate}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          Xe phân công: <strong>{trip.vehiclePlate}</strong> ({trip.vehicleModel}) | Lái xe:{' '}
                          <strong>{trip.driverName}</strong> ({trip.driverPhone})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700 block">
                          Trạng thái: {trip.progressStatusText}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Bước {trip.progressStep}/4</span>
                      </div>
                    </div>

                    {/* Passenger List in this Trip */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                      <span className="font-bold text-slate-800 text-[11px] block">
                        Danh sách hành khách & Hợp đồng điện tử kèm theo:
                      </span>
                      {trip.passengerDetails.map((p, idx) => {
                        const cnt = tripContracts.find((c) => c.requestId === p.requestId);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] py-1 border-b border-slate-200 last:border-0"
                          >
                            <div>
                              <strong>{p.passengerName}</strong> ({p.passengerPhone}) • {p.seats} chỗ
                              <p className="text-[10px] text-slate-500">
                                Đón: {p.pickupAddress} ➔ Trả: {p.dropoffAddress}
                              </p>
                            </div>
                            <div className="text-right font-mono">
                              <span className="font-semibold text-indigo-700">
                                {cnt ? cnt.contractCode : 'HĐ Điện tử'}
                              </span>
                              <p className="text-[10px] text-slate-400">Lưu trữ đến 2029</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Operational controls for driver */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        * Mọi dữ liệu vị trí và tiến trình được đồng bộ tự động tới hành khách.
                      </span>

                      {trip.progressStep < 4 ? (
                        <button
                          onClick={() => handleAdvanceTrip(trip.id, trip.progressStep)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          {trip.progressStep === 1 && 'Bắt Đầu Đón Khách (Bước 2)'}
                          {trip.progressStep === 2 && 'Đã Đón Xong • Bắt Đầu Di Chuyển (Bước 3)'}
                          {trip.progressStep === 3 && 'Hoàn Tất Chuyến Đi & Trả Khách (Bước 4)'}
                        </button>
                      ) : (
                        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl">
                          Chuyến Đi Đã Hoàn Tất Toàn Phần
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: FINANCIAL RECONCILIATION ================= */}
      {activeTab === 'finance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Đối Soát Doanh Thu & Quyết Toán Hợp Đồng
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tài khoản thụ hưởng: {currentOperator?.bankAccount?.bankName} - STK:{' '}
              {currentOperator?.bankAccount?.accountNumber} ({currentOperator?.bankAccount?.accountHolder})
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-bold block">
                Tổng giá trị cước vận chuyển (Gross)
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {totalGrossRevenue.toLocaleString('vi-VN')} VNĐ
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Căn cứ theo biểu giá tự ban hành</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-bold block">
                Phí sàn TMĐT ViaStep (10%)
              </span>
              <span className="text-xl font-extrabold text-amber-700 mt-1 block">
                - {totalPlatformFees.toLocaleString('vi-VN')} VNĐ
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Chi phí hạ tầng công nghệ và hợp đồng số</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 uppercase font-bold block">
                Thực nhận của đơn vị vận tải (Net 90%)
              </span>
              <span className="text-xl font-extrabold text-emerald-900 mt-1 block">
                {totalNetPayout.toLocaleString('vi-VN')} VNĐ
              </span>
              <p className="text-[10px] text-emerald-700 mt-1">Chuyển khoản tự động theo chu kỳ đối soát</p>
            </div>
          </div>

          {/* Export action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                const dataStr =
                  'data:text/json;charset=utf-8,' +
                  encodeURIComponent(JSON.stringify(myContracts, null, 2));
                const dl = document.createElement('a');
                dl.setAttribute('href', dataStr);
                dl.setAttribute('download', `danh_sach_khach_hang_${opId}.json`);
                dl.click();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Dữ Liệu Khách Hàng Của Mình (CSV/JSON)</span>
            </button>
            <span className="text-xs text-slate-500">
              Thành viên sở hữu toàn bộ dữ liệu khách hàng theo quy định liên minh
            </span>
          </div>
        </div>
      )}

      {/* ================= TAB 7: REGISTER NEW OPERATOR ================= */}
      {activeTab === 'register' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Đăng Ký Hồ Sơ Thành Viên Vận Tải Mới
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dành cho các Hợp tác xã / Doanh nghiệp vận tải có Giấy phép kinh doanh xe hợp đồng
            </p>
          </div>

          <form onSubmit={handleRegisterNewOperator} className="max-w-2xl space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tên pháp nhân (Hợp tác xã / Doanh nghiệp):
              </label>
              <input
                type="text"
                required
                placeholder="VD: Hợp Tác Xã Vận Tải Hải Vân"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Số Giấy phép kinh doanh vận tải bằng xe ô tô:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: GP-KDVT-0109988/HN"
                  value={regLicense}
                  onChange={(e) => setRegLicense(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Mã số thuế:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 0109988123"
                  value={regTax}
                  onChange={(e) => setRegTax(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Họ tên người đại diện pháp luật:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={regRep}
                  onChange={(e) => setRegRep(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Số điện thoại liên hệ:</label>
                <input
                  type="tel"
                  required
                  placeholder="0912xxxxxx"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Địa chỉ trụ sở chính:</label>
              <input
                type="text"
                required
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border text-[11px] text-slate-600">
              Hồ sơ đăng ký kèm bản mềm Giấy phép KDVT sẽ được gửi cho Ban Quản Trị ViaStep để tra cứu
              đối chiếu với dữ liệu Tổng cục Đường bộ Việt Nam trước khi kích hoạt tài khoản.
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              Gửi Hồ Sơ Xét Duyệt
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Modal: Leave Alliance */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <LogOut className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">Xác nhận Rời Liên Minh ViaStep?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn rút đơn vị{' '}
              <strong>{currentOperator?.businessName}</strong> khỏi sàn ViaStep? Sau khi rút, bạn sẽ
              ngừng nhận các gói đề xuất ghép xe mới. Toàn bộ dữ liệu khách hàng và lịch sử hợp đồng
              vẫn được bảo lưu và bạn có thể tải về bất cứ lúc nào.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowQuitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleLeaveAlliance}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Xác Nhận Rời Liên Minh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
