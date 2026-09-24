import React, { useState } from 'react';
import { Corridor, Operator } from '../../types';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Search,
  CheckCircle2,
  ShieldCheck,
  Star,
  Info,
  Car,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface Props {
  corridors: Corridor[];
  operators: Operator[];
  onRequestCreated: () => void;
}

export const TripBookingForm: React.FC<Props> = ({ corridors, operators, onRequestCreated }) => {
  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [corridorId, setCorridorId] = useState(corridors[0]?.id || 'corridor-hn-hp');
  const [pickupAddress, setPickupAddress] = useState('Số 18 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội');
  const [dropoffAddress, setDropoffAddress] = useState('Số 50 Điện Biên Phủ, Quận Hồng Bàng, Hải Phòng');
  const [travelDate, setTravelDate] = useState('2026-09-24');
  const [preferredTimeStart, setPreferredTimeStart] = useState('07:30');
  const [preferredTimeEnd, setPreferredTimeEnd] = useState('09:30');
  const [seatsRequested, setSeatsRequested] = useState(1);

  // Passenger Info & OTP
  const [passengerName, setPassengerName] = useState('Nguyễn Văn Hùng');
  const [passengerPhone, setPassengerPhone] = useState('0912345678');
  const [otp, setOtp] = useState('123456');

  // Selection Mode: Specific Operator vs Max Price
  const [selectionMode, setSelectionMode] = useState<'specific_operator' | 'max_price'>('max_price');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('op-anbinh');
  const [maxPricePerSeat, setMaxPricePerSeat] = useState<number>(200000);

  const [loading, setLoading] = useState(false);

  const selectedCorridor = corridors.find((c) => c.id === corridorId) || corridors[0];

  // Filter approved operators having pricing for this corridor
  const eligibleOperators = operators
    .filter((op) => op.status === 'approved')
    .map((op: any) => {
      const priceEntry = op.prices?.find((p: any) => p.corridorId === corridorId);
      return {
        ...op,
        pricePerSeat: priceEntry ? priceEntry.pricePerSeat : null,
      };
    })
    .filter((op) => op.pricePerSeat !== null);

  const handleSubmitRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passengerName,
          passengerPhone,
          pickupAddress,
          dropoffAddress,
          corridorId,
          travelDate,
          preferredTimeStart,
          preferredTimeEnd,
          seatsRequested,
          selectionMode,
          targetOperatorId: selectionMode === 'specific_operator' ? selectedOperatorId : undefined,
          maxPricePerSeat: selectionMode === 'max_price' ? maxPricePerSeat : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(
          'Tạo yêu cầu ghép xe thành công!\n\nTrạng thái: "Đang chờ ghép".\nLƯU Ý: ViaStep CHƯA THU BẤT KỲ KHOẢN TIỀN NÀO của quý khách cho đến khi có nhà xe nhận và phát hành Hợp đồng điện tử.'
        );
        onRequestCreated();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Step Indicator Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-slate-800">Chọn lộ trình</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2
                  ? 'bg-indigo-600 text-white'
                  : step > 2
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Chọn Nhà xe & Mức giá
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-slate-800">Xác thực & Gửi yêu cầu</span>
          </div>
        </div>

        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Không thu tiền khi tìm xe
        </span>
      </div>

      <div className="p-6">
        {/* ================= STEP 1: ROUTE & TIME ================= */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Hành lang liên tỉnh:
              </label>
              <select
                value={corridorId}
                onChange={(e) => setCorridorId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.distanceKm} km • ~{c.estimatedHours} giờ)
                  </option>
                ))}
              </select>
            </div>

            {/* Door-to-door addresses (NO fixed bus station) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  Điểm đón tận nơi (Không dùng bến xe cố định):
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Số nhà, ngõ/phố, phường, quận..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Đón tại nhà/cơ quan theo đúng nhu cầu thực tế của quý khách.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  Điểm trả tận nơi:
                </label>
                <input
                  type="text"
                  required
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  placeholder="Địa chỉ trả tại tỉnh đến..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Trả tận nơi theo thỏa thuận ghi trong hợp đồng vận chuyển.
                </p>
              </div>
            </div>

            {/* Travel Date & Flexible Time Window (NO fixed schedule) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  Ngày khởi hành:
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Khung giờ đón mong muốn (Linh hoạt, KHÔNG phải giờ cố định):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={preferredTimeStart}
                    onChange={(e) => setPreferredTimeStart(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-bold">đến</span>
                  <input
                    type="time"
                    value={preferredTimeEnd}
                    onChange={(e) => setPreferredTimeEnd(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Thành viên vận tải nhận yêu cầu trong khung giờ sẵn sàng linh hoạt.
                </p>
              </div>
            </div>

            {/* Seats Requested */}
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                Số lượng chỗ muốn đặt (Phương tiện dưới 8 chỗ):
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSeatsRequested(num)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
                      seatsRequested === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <span className="text-xs text-slate-500 ml-2">chỗ</span>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Xem Danh Sách Nhà Xe Phù Hợp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: OPERATORS & INDIVIDUAL PRICING ================= */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Regulatory Notice Banner */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Quy chế niêm yết giá độc lập:</p>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  Dưới đây là biểu giá do <strong>từng Hợp tác xã/Doanh nghiệp vận tải tự ban hành</strong>.{' '}
                  ViaStep <strong>không làm tròn và không đặt một mức giá chung</strong> thay cho thành viên.
                </p>
              </div>
            </div>

            {/* Operator Selection Cards */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Các đơn vị vận tải có năng lực trên hành lang {selectedCorridor.name}:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {eligibleOperators.map((op: any) => {
                  const isSelected = selectedOperatorId === op.id;
                  return (
                    <div
                      key={op.id}
                      onClick={() => setSelectedOperatorId(op.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected && selectionMode === 'specific_operator'
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Giấy phép KDVT hợp pháp
                          </span>
                          <h5 className="font-bold text-slate-900 text-xs mt-1.5">
                            {op.businessName}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {op.licenseNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-indigo-700 block">
                            {op.pricePerSeat.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">/ 1 chỗ ngồi</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-slate-800">{op.rating}</span>
                          <span className="text-slate-400">({op.completedTripsCount} chuyến)</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Xe Kia Carnival / Staria 7 chỗ
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500 italic">
                        * Giá niêm yết bởi {op.businessName}, ghi vào HĐ điện tử.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selection Mode Choice */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <label className="text-xs font-bold text-slate-900 block">
                Phương thức chọn nhà xe của bạn:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mode A */}
                <div
                  onClick={() => setSelectionMode('specific_operator')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectionMode === 'specific_operator'
                      ? 'border-indigo-600 bg-white shadow-xs'
                      : 'border-slate-200 bg-white/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="selectionMode"
                      checked={selectionMode === 'specific_operator'}
                      onChange={() => setSelectionMode('specific_operator')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-bold text-xs text-slate-900">
                      Cách A: Chọn đích danh 1 nhà xe
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-5">
                    Chỉ gửi đề xuất ghép tới nhà xe bạn đã chọn ở trên với đúng mức giá của họ.
                  </p>
                </div>

                {/* Mode B */}
                <div
                  onClick={() => setSelectionMode('max_price')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectionMode === 'max_price'
                      ? 'border-indigo-600 bg-white shadow-xs'
                      : 'border-slate-200 bg-white/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="selectionMode"
                      checked={selectionMode === 'max_price'}
                      onChange={() => setSelectionMode('max_price')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-bold text-xs text-slate-900">
                      Cách B: Đặt giá trần tối đa X
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-5">
                    Hệ thống sẽ lọc mọi nhà xe có giá ≤ X và phát đề xuất đồng thời cho họ.
                  </p>
                </div>
              </div>

              {/* Threshold input if Mode B */}
              {selectionMode === 'max_price' && (
                <div className="pt-2 pl-1 flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">
                    Mức giá tối đa bạn chấp nhận (X):
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      step={10000}
                      value={maxPricePerSeat}
                      onChange={(e) => setMaxPricePerSeat(Number(e.target.value))}
                      className="px-3 py-1.5 text-xs font-bold text-indigo-700 border border-slate-300 rounded-lg w-36 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-500 ml-2">đ/chỗ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Back & Next */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Tiếp Tục Xác Nhận OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: OTP VERIFICATION & DISPATCH ================= */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Booking Summary Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                Tóm tắt yêu cầu ghép xe:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                <p>
                  <strong>Hành lang:</strong> {selectedCorridor.name}
                </p>
                <p>
                  <strong>Ngày đi:</strong> {travelDate} ({preferredTimeStart} - {preferredTimeEnd})
                </p>
                <p>
                  <strong>Điểm đón:</strong> {pickupAddress}
                </p>
                <p>
                  <strong>Điểm trả:</strong> {dropoffAddress}
                </p>
                <p>
                  <strong>Số chỗ:</strong> {seatsRequested} chỗ
                </p>
                <p>
                  <strong>Chế độ giá:</strong>{' '}
                  {selectionMode === 'specific_operator'
                    ? `Chọn đích danh ${
                        eligibleOperators.find((o) => o.id === selectedOperatorId)?.businessName
                      }`
                    : `Giá không quá ${maxPricePerSeat.toLocaleString('vi-VN')} đ/chỗ`}
                </p>
              </div>
            </div>

            {/* Passenger Contact & OTP Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Họ và tên hành khách:
                  </label>
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Số điện thoại nhận OTP & Hợp đồng:
                  </label>
                  <input
                    type="tel"
                    required
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* OTP Simulation */}
              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Xác thực mã OTP (Môi trường Sandbox):
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mã xác thực đã được gửi tới SĐT của bạn. Nhập <strong>123456</strong> để tiếp tục.
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-28 px-3 py-1.5 text-center text-sm font-mono font-bold tracking-widest border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* CRITICAL TRANSPARENCY NOTICE */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Cam kết tài chính minh bạch:
              </p>
              <p className="text-[11px] text-amber-800 leading-normal">
                Bấm "Gửi yêu cầu" sẽ đưa chuyến của bạn vào trạng thái <strong>"Đang chờ ghép"</strong>.{' '}
                <strong>Hệ thống TUYỆT ĐỐI KHÔNG thu tiền ở bước này.</strong> Bạn chỉ thanh toán khi có
                nhà xe xác nhận và Hợp đồng vận chuyển điện tử được phát hành với đúng giá của nhà xe đó.
              </p>
            </div>

            {/* Back & Submit */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={loading || otp !== '123456'}
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Ghép Xe (Miễn Phí)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
