export type UserRole = 'passenger' | 'operator' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  otpVerified: boolean;
  avatar?: string;
  createdAt: string;
}

export type OperatorStatus = 'pending' | 'approved' | 'rejected' | 'left_alliance';

export interface OperatorDocument {
  id: string;
  operatorId: string;
  type: 'business_license' | 'badge_sample' | 'insurance_policy' | 'tax_code';
  title: string;
  fileName: string;
  fileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  notes?: string;
}

export interface Operator {
  id: string;
  userId: string;
  businessName: string; // Tên HTX hoặc Doanh nghiệp
  licenseNumber: string; // Số Giấy phép kinh doanh vận tải bằng xe ô tô
  licenseIssuedDate: string;
  issuedBy: string; // Sở GTVT cấp
  taxCode: string;
  representativeName: string;
  phone: string;
  address: string;
  status: OperatorStatus;
  rating: number;
  completedTripsCount: number;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  allianceJoinedAt: string;
  joinedAt?: string;
  documents?: OperatorDocument[];
  vehicles?: Vehicle[];
  drivers?: Driver[];
  slots?: AvailabilitySlot[];
  prices?: PriceTableEntry[];
}

export interface Vehicle {
  id: string;
  operatorId: string;
  plateNumber: string; // Biển số xe (ví dụ: 29B-123.45)
  brandModel: string; // Ví dụ: Kia Carnival 2024, Ford Transit Limousine
  seatCapacity: number; // Tối đa 7-8 chỗ theo quy định xe hợp đồng dưới 8 chỗ
  inspectionExpiry: string; // Hạn đăng kiểm
  badgeNumber: string; // Phù hiệu "XE HỢP ĐỒNG" cấp bởi Sở GTVT
  status: 'active' | 'in_trip' | 'maintenance';
}

export interface Driver {
  id: string;
  operatorId: string;
  fullName: string;
  phone: string;
  licenseClass: 'B2' | 'D' | 'E'; // Hạng GPLX
  licenseNumber: string;
  licenseExpiry: string;
  judicialRecordNumber: string; // Phiếu Lý lịch tư pháp số 2
  status: 'active' | 'assigned';
}

export interface Corridor {
  id: string;
  name: string; // e.g. "Hà Nội ↔ Hải Phòng"
  originCity: string;
  destCity: string;
  estimatedHours: number;
  distanceKm: number;
}

export interface PriceTableEntry {
  id: string;
  operatorId: string;
  corridorId: string;
  corridorName: string;
  pricePerSeat: number; // Giá cước do chính Nhà xe/HTX tự quyết định (VND)
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: string;
  operatorId: string;
  corridorId: string;
  date: string; // YYYY-MM-DD
  timeWindowStart: string; // HH:mm (Khung giờ sẵn sàng linh hoạt, KHÔNG phải giờ cố định)
  timeWindowEnd: string;
  declaredSeats: number;
  vehicleId?: string;
  notes?: string;
}

export type RequestStatus =
  | 'pending' // Đang chờ ghép
  | 'matched' // Đã ghép vào gói đề xuất
  | 'accepted' // Có nhà xe nhận, phát hành HĐ
  | 'contract_issued'
  | 'paid'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface PassengerRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  pickupAddress: string; // Đón tận nơi
  dropoffAddress: string; // Trả tận nơi
  corridorId: string;
  travelDate: string; // YYYY-MM-DD
  preferredTimeStart: string; // HH:mm
  preferredTimeEnd: string;
  seatsRequested: number;
  selectionMode: 'specific_operator' | 'max_price';
  targetOperatorId?: string; // Nếu chọn đích danh
  targetOperatorName?: string;
  maxPricePerSeat?: number; // Nếu chọn giá trần
  status: RequestStatus;
  createdAt: string;
  matchedProposalId?: string;
  contractId?: string;
}

export interface MatchProposal {
  id: string;
  corridorId: string;
  corridorName: string;
  travelDate: string;
  timeWindow: string;
  requestIds: string[];
  totalSeats: number;
  pickupList: { address: string; passengerName: string; seats: number }[];
  dropoffList: { address: string; passengerName: string; seats: number }[];
  proposedOperatorIds: string[]; // Gửi đồng thời cho tất cả operators này
  sentAt: string;
  expiresAt: string;
  status: 'open' | 'accepted' | 'expired';
  acceptedOperatorId?: string;
  acceptedOperatorName?: string;
  acceptedAt?: string;
  operatorResponses: {
    operatorId: string;
    operatorName: string;
    action: 'viewed' | 'accepted' | 'declined';
    timestamp: string;
  }[];
}

export interface DigitalSignature {
  passengerSignedAt?: string;
  passengerIp?: string;
  operatorSignedAt?: string;
  providerCertificate: string; // "VNPT-CA / Viettel-CA E-Sign Sandbox"
  contractHash: string;
}

export interface ElectronicContract {
  id: string;
  contractCode: string; // HDDT-2026-xxxxx
  requestId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  operatorId: string;
  operatorName: string;
  operatorLicense: string;
  operatorTaxCode: string;
  corridorName: string;
  pickupAddress: string;
  dropoffAddress: string;
  travelDate: string;
  estimatedPickupTime: string;
  seats: number;
  pricePerSeat: number; // Đúng giá của Operator đó
  totalAmount: number;
  platformFee: number; // Trích từ phần Operator
  operatorPayout: number;
  legalBasis: string; // Căn cứ Nghị định 10/2020/NĐ-CP & Nghị định 47/2022/NĐ-CP
  contractContent: string;
  status: 'issued' | 'passenger_signed' | 'fully_executed' | 'cancelled';
  signature: DigitalSignature;
  issuedAt: string;
  archivedUntil: string; // Tối thiểu 3 năm theo luật
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;
}

export interface PaymentRecord {
  id: string;
  contractId: string;
  requestId: string;
  passengerId: string;
  amount: number;
  status: 'unpaid' | 'pending_verification' | 'completed' | 'refunded';
  method: 'vnpay' | 'momo' | 'bank_transfer_qr';
  transactionCode: string;
  paidAt?: string;
  platformFeeDeducted: number;
  operatorPayoutAmount: number;
  confirmedBy?: string;
}

export interface Trip {
  id: string;
  proposalId: string;
  operatorId: string;
  operatorName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  requestIds: string[];
  contractIds: string[];
  corridorName: string;
  travelDate: string;
  status: 'scheduled' | 'en_route_pickup' | 'in_transit' | 'completed';
  progressStep: number;
  progressStatusText: string;
  departureTime?: string;
  completedAt?: string;
  passengerDetails: {
    requestId: string;
    passengerName: string;
    passengerPhone: string;
    pickupAddress: string;
    dropoffAddress: string;
    seats: number;
  }[];
}

export interface Review {
  id: string;
  tripId: string;
  contractId: string;
  reviewerRole: 'passenger' | 'operator';
  reviewerId: string;
  reviewerName: string;
  targetId: string;
  targetName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  contractId: string;
  tripId?: string;
  filedByRole: 'passenger' | 'operator';
  filedById: string;
  filedByName: string;
  targetPartyName: string;
  subject: string;
  content: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolutionNotes?: string;
  adminNotes?: string;
  createdAt: string;
  logs: {
    time: string;
    action: string;
    actor: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: 'proposal_broadcast' | 'proposal_accepted' | 'contract_issued' | 'price_updated' | 'license_approved';
  action?: string;
  entityId?: string;
  description: string;
  details: Record<string, any>;
  complianceNote: string; // Chứng minh ViaStep không can thiệp giá/điều xe
}

export interface PlatformSettings {
  platformFeePercent: number; // Mặc định 10%
  reserveFundPercent: number; // Mặc định 2%
  autoExpireMinutes: number; // Mặc định 45 phút
  totalTransactionsVolume: number;
}

export interface AppState {
  currentUser: User;
  users: User[];
  operators: Operator[];
  corridors: Corridor[];
  requests: PassengerRequest[];
  proposals: MatchProposal[];
  contracts: ElectronicContract[];
  payments: PaymentRecord[];
  trips: Trip[];
  complaints: Complaint[];
  auditLogs: AuditLog[];
  settings: PlatformSettings;
}
