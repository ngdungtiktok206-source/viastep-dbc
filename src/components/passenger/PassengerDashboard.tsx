import React, { useState } from 'react';
import {
  PassengerRequest,
  ElectronicContract,
  Trip,
  Corridor,
  Operator,
} from '../../types';
import { TripBookingForm } from './TripBookingForm';
import { ContractViewModal } from './ContractViewModal';
import { PaymentModal } from './PaymentModal';
import { ComplaintModal } from './ComplaintModal';
import {
  Car,
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share2,
  Star,
  MapPin,
  ShieldCheck,
  Send,
  Phone,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

interface Props {
  requests: PassengerRequest[];
  contracts: ElectronicContract[];
  trips: Trip[];
  corridors: Corridor[];
  operators: Operator[];
  onRefreshData: () => void;
}

export const PassengerDashboard: React.FC<Props> = ({
  requests,
  contracts,
  trips,
  corridors,
  operators,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'requests' | 'contracts' | 'trips'>('book');

  // Modals state
  const [selectedContract, setSelectedContract] = useState<ElectronicContract | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const [paymentContract, setPaymentContract] = useState<ElectronicContract | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Filter requests belonging to passenger
  const myRequests = requests;

  // Contracts for passenger
  const myContracts = contracts;

  // Trips involving passenger
  const myTrips = trips;

  const handleOpenContract = (c: ElectronicContract) => {
    setSelectedContract(c);
    setIsContractModalOpen(true);
  };

  const handleSignContract = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProceedToPayment = (contract: ElectronicContract) => {
    setIsContractModalOpen(false);
    setPaymentContract(contract);
    setIsPaymentModalOpen(true);
  };

  const handleReviewSubmit = async (trip: Trip, contractId: string) => {
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          contractId,
          reviewerRole: 'passenger',
          reviewerName: 'Hành khách Nguyễn Văn Hùng',
          targetId: trip.operatorId,
          targetName: trip.operatorName,
          rating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Cảm ơn bạn đã đánh giá chất lượng chuyến đi!');
        setReviewComment('');
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleShareJourney = (trip: Trip) => {
    const url = `${window.location.origin}/track-journey/${trip.id}?code=VIA-${trip.id.slice(-6)}`;
    navigator.clipboard?.writeText(url);
    alert(
      `Đã sao chép link chia sẻ hành trình an toàn cho người thân:\n\n${url}\n\nNgười thân có thể xem biển số xe, tên tài xế và trạng thái di chuyển theo thời gian thực.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Passenger Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'book'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Đặt Chuyến Ghép</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Yêu Cầu Của Tôi</span>
            {myRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                {myRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'contracts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Hợp Đồng & Thanh Toán</span>
            {myContracts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                {myContracts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'trips'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Theo Dõi Chuyến Đi</span>
          </button>
        </div>

        <button
          onClick={() => setIsComplaintModalOpen(true)}
          className="text-xs text-rose-700 hover:text-rose-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span className="hidden sm:inline">Mở Khiếu Nại</span>
        </button>
      </div>

      {/* ================= TAB: BOOKING FORM ================= */}
      {activeTab === 'book' && (
        <TripBookingForm
          corridors={corridors}
          operators={operators}
          onRequestCreated={() => {
            onRefreshData();
            setActiveTab('requests');
          }}
        />
      )}

      {/* ================= TAB: MY REQUESTS ================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Danh sách Yêu cầu Ghép xe ({myRequests.length})
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi tiến độ ghép xe tự động và trạng thái xác nhận từ các nhà xe
              </p>
            </div>
            <button
              onClick={() => setActiveTab('book')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              + Tạo yêu cầu mới
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Chưa có yêu cầu ghép xe nào</p>
              <p className="text-xs text-slate-500 mt-1">
                Hãy nhập điểm đón và trả để tìm kiếm nhà xe có khung giờ phù hợp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {myRequests.map((req) => {
                const corridor = corridors.find((c) => c.id === req.corridorId);
                const hasContract = myContracts.find((c) => c.requestId === req.id);

                return (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {corridor ? corridor.name : req.corridorId}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : req.status === 'matched'
                                ? 'bg-blue-100 text-blue-800'
                                : req.status === 'contract_issued'
                                ? 'bg-purple-100 text-purple-800'
                                : req.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {req.status === 'pending' && 'Đang chờ ghép (Chưa thu tiền)'}
                            {req.status === 'matched' && 'Đã đề xuất tới các nhà xe'}
                            {req.status === 'contract_issued' && 'Nhà xe đã nhận • Chờ ký HĐ & thanh toán'}
                            {req.status === 'paid' && 'Đã ký HĐ & Thanh toán'}
                            {req.status === 'completed' && 'Chuyến đi hoàn tất'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          Ngày đi: <strong>{req.travelDate}</strong> | Khung giờ mong muốn:{' '}
                          <strong>
                            {req.preferredTimeStart} - {req.preferredTimeEnd}
                          </strong>{' '}
                          | Số chỗ: <strong>{req.seatsRequested}</strong> chỗ
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-mono text-slate-400 block">{req.id}</span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {req.selectionMode === 'specific_operator'
                            ? `Đích danh: ${req.targetOperatorName || 'Nhà xe'}`
                            : `Giá trần: ${req.maxPricePerSeat?.toLocaleString('vi-VN')} đ/chỗ`}
                        </span>
                      </div>
                    </div>

                    {/* Door-to-door details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Đón tận nơi:</span>
                          <span className="font-semibold text-slate-900">{req.pickupAddress}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Trả tận nơi:</span>
                          <span className="font-semibold text-slate-900">{req.dropoffAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-500 italic">
                        {req.status === 'pending' &&
                          '* Hệ thống đang ghép bạn với các hành khách cùng hành lang để phát đề xuất đồng thời cho nhà xe.'}
                        {req.status === 'contract_issued' &&
                          '* Đã có nhà xe nhận yêu cầu của bạn! Vui lòng kiểm tra và ký Hợp đồng điện tử.'}
                      </div>

                      {hasContract && (
                        <button
                          onClick={() => handleOpenContract(hasContract)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Xem Hợp Đồng Điện Tử ({hasContract.contractCode})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: CONTRACTS & PAYMENTS ================= */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hợp Đồng Vận Chuyển Điện Tử Riêng Biệt ({myContracts.length})
              </h3>
              <p className="text-xs text-slate-500">
                Mỗi hành khách có 01 hợp đồng riêng biệt ký với Bên vận tải theo Nghị định 10/2020/NĐ-CP
              </p>
            </div>
          </div>

          {myContracts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Chưa có hợp đồng nào được phát hành</p>
              <p className="text-xs text-slate-500 mt-1">
                Hợp đồng điện tử sẽ tự động phát hành ngay khi có một đơn vị vận tải xác nhận tiếp nhận
                gói ghép.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myContracts.map((cnt) => {
                const isPaid = cnt.status === 'fully_executed';
                const isPassengerSigned =
                  cnt.status === 'passenger_signed' || cnt.status === 'fully_executed';

                return (
                  <div
                    key={cnt.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-indigo-900">
                              {cnt.contractCode}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPassengerSigned
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isPaid
                                ? 'Đã hoàn tất (Đã ký & Đã thanh toán)'
                                : isPassengerSigned
                                ? 'Đã ký • Chờ thanh toán'
                                : 'Chờ hành khách ký'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold mt-1">
                            Bên vận tải (Bên A): {cnt.operatorName} (GP: {cnt.operatorLicense})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Hành lang: {cnt.corridorName} | Ngày đi: {cnt.travelDate}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-slate-900 block">
                          {cnt.totalAmount.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({cnt.pricePerSeat.toLocaleString('vi-VN')} đ x {cnt.seats} chỗ)
                        </span>
                        <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          Đúng giá niêm yết của {cnt.operatorName}
                        </p>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="p-3 bg-slate-50 rounded-xl text-xs grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Địa chỉ đón khách:
                        </span>
                        <span className="font-semibold text-slate-900">{cnt.pickupAddress}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Địa chỉ trả khách:
                        </span>
                        <span className="font-semibold text-slate-900">{cnt.dropoffAddress}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-mono">
                        Lưu trữ hệ thống 3 năm • {cnt.signature.providerCertificate}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenContract(cnt)}
                          className="px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold text-xs rounded-xl transition-all"
                        >
                          Xem Chi Tiết Hợp Đồng
                        </button>

                        {!isPassengerSigned ? (
                          <button
                            onClick={() => handleOpenContract(cnt)}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Ký Hợp Đồng Điện Tử</span>
                          </button>
                        ) : !isPaid ? (
                          <button
                            onClick={() => handleProceedToPayment(cnt)}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Thanh Toán ({cnt.totalAmount.toLocaleString('vi-VN')} đ)</span>
                          </button>
                        ) : (
                          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Đã thanh toán
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: LIVE TRIP TRACKING & REVIEW ================= */}
      {activeTab === 'trips' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Theo Dõi Chuyến Đi & Đánh Giá Chất Lượng ({myTrips.length})
            </h3>
            <p className="text-xs text-slate-500">
              Thông tin phương tiện, tài xế phục vụ và chia sẻ hành trình trực tiếp
            </p>
          </div>

          {myTrips.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Chưa có chuyến đi nào đang hoạt động</p>
              <p className="text-xs text-slate-500 mt-1">
                Khi nhà xe nhận gói và bạn thanh toán hợp đồng, hành trình chuyến đi sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {myTrips.map((trip) => {
                const contract = myContracts.find((c) => trip.contractIds.includes(c.id));

                return (
                  <div
                    key={trip.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">
                            {trip.corridorName}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {trip.travelDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Đơn vị vận tải phục vụ:{' '}
                          <strong className="text-indigo-900">{trip.operatorName}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => handleShareJourney(trip)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Chia sẻ hành trình cho người thân</span>
                      </button>
                    </div>

                    {/* Vehicle & Driver Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Phương tiện phân công:
                        </span>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-indigo-600" />
                          <span className="font-extrabold text-slate-900 text-sm">
                            {trip.vehiclePlate}
                          </span>
                          <span className="text-slate-600">({trip.vehicleModel})</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Xe hợp đồng dưới 8 chỗ • Có phù hiệu và bảo hiểm đầy đủ
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Lái xe phụ trách:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{trip.driverName}</span>
                          <a
                            href={`tel:${trip.driverPhone}`}
                            className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hover:bg-emerald-100"
                          >
                            <Phone className="w-3 h-3" />
                            {trip.driverPhone}
                          </a>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Đã thẩm định GPLX và Phiếu lý lịch tư pháp số 2
                        </p>
                      </div>
                    </div>

                    {/* Journey Progress Steps */}
                    <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-slate-800 block">
                        Trạng thái hành trình trực tiếp:
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        {[
                          { step: 1, title: 'Đã xếp xe', desc: 'Nhà xe chuẩn bị xe' },
                          { step: 2, title: 'Đón khách', desc: 'Lái xe đón tận nơi' },
                          { step: 3, title: 'Đang di chuyển', desc: 'Đang trên hành lang' },
                          { step: 4, title: 'Hoàn tất', desc: 'Đã trả khách tận nơi' },
                        ].map((s) => (
                          <div
                            key={s.step}
                            className={`p-2.5 rounded-xl border transition-all ${
                              trip.progressStep >= s.step
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] bg-white border">
                              {trip.progressStep > s.step ? '✓' : s.step}
                            </div>
                            <p className="text-[11px]">{s.title}</p>
                            <p className="text-[9px] text-slate-500 hidden sm:block">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-indigo-700 bg-indigo-50/70 p-2 rounded-lg font-medium">
                        • Ghi chú vận hành: {trip.progressStatusText}
                      </p>
                    </div>

                    {/* Post-trip Two-Way Review Box */}
                    {trip.progressStep === 4 && (
                      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                        <span className="text-xs font-bold text-slate-900 block">
                          Đánh giá dịch vụ 2 chiều sau chuyến đi:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-700">Chấm điểm:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="text-amber-500 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    rating >= star ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-800 ml-2">{rating}/5 sao</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nhận xét về lái xe, độ đúng giờ, xe sạch sẽ..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleReviewSubmit(trip, contract ? contract.id : '')}
                            disabled={reviewSubmitting}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
                          >
                            {reviewSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Contract Viewer Modal */}
      <ContractViewModal
        contract={selectedContract}
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onSignContract={handleSignContract}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* Payment Gateway Modal */}
      <PaymentModal
        contract={paymentContract}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={onRefreshData}
      />

      {/* Complaint Modal */}
      <ComplaintModal
        contracts={myContracts}
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onComplaintSubmitted={onRefreshData}
      />
    </div>
  );
};
