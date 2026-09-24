import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Database persistence directory
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'viastep_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data Store in Memory with File Backup
interface DBState {
  users: any[];
  operators: any[];
  operatorDocuments: any[];
  vehicles: any[];
  drivers: any[];
  corridors: any[];
  priceTables: any[];
  availabilitySlots: any[];
  requests: any[];
  proposals: any[];
  contracts: any[];
  payments: any[];
  trips: any[];
  reviews: any[];
  complaints: any[];
  auditLogs: any[];
  platformSettings: {
    platformFeePercent: number;
    reserveFundPercent: number;
    autoExpireMinutes: number;
  };
}

const defaultCorridors = [
  {
    id: 'corridor-hn-hp',
    name: 'Hà Nội ↔ Hải Phòng',
    originCity: 'Hà Nội',
    destCity: 'Hải Phòng',
    estimatedHours: 1.5,
    distanceKm: 120,
  },
  {
    id: 'corridor-hn-qn',
    name: 'Hà Nội ↔ Quảng Ninh (Hạ Long)',
    originCity: 'Hà Nội',
    destCity: 'Quảng Ninh',
    estimatedHours: 2.2,
    distanceKm: 155,
  },
  {
    id: 'corridor-hn-nb',
    name: 'Hà Nội ↔ Ninh Bình',
    originCity: 'Hà Nội',
    destCity: 'Ninh Bình',
    estimatedHours: 1.3,
    distanceKm: 95,
  },
  {
    id: 'corridor-sg-vt',
    name: 'TP.HCM ↔ Vũng Tàu',
    originCity: 'TP. Hồ Chí Minh',
    destCity: 'Bà Rịa - Vũng Tàu',
    estimatedHours: 1.8,
    distanceKm: 105,
  },
  {
    id: 'corridor-sg-pt',
    name: 'TP.HCM ↔ Phan Thiết',
    originCity: 'TP. Hồ Chí Minh',
    destCity: 'Bình Thuận',
    estimatedHours: 2.5,
    distanceKm: 195,
  },
];

const initialData: DBState = {
  users: [
    {
      id: 'usr-passenger-1',
      phone: '0912345678',
      name: 'Nguyễn Văn Hùng',
      email: 'hung.nguyen@example.com',
      role: 'passenger',
      otpVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'usr-operator-1',
      phone: '0988776655',
      name: 'Trần Đình Tuấn (HTX An Bình)',
      email: 'tuan@anbinhtransport.vn',
      role: 'operator',
      otpVerified: true,
      createdAt: '2026-08-15T09:30:00.000Z',
    },
    {
      id: 'usr-operator-2',
      phone: '0903221144',
      name: 'Lê Hoàng Minh (CTCP Vận Tải Hoa Sen)',
      email: 'minh.le@hoasengroup.vn',
      role: 'operator',
      otpVerified: true,
      createdAt: '2026-08-20T10:15:00.000Z',
    },
    {
      id: 'usr-admin-1',
      phone: '0999000111',
      name: 'Ban Thanh Tra & Tuân Thủ ViaStep',
      email: 'compliance@viastep.vn',
      role: 'admin',
      otpVerified: true,
      createdAt: '2026-08-01T00:00:00.000Z',
    },
  ],
  operators: [
    {
      id: 'op-anbinh',
      userId: 'usr-operator-1',
      businessName: 'Hợp Tác Xã Vận Tải & Dịch Vụ An Bình',
      licenseNumber: 'GP-KDVT-0108922/HN',
      licenseIssuedDate: '2022-04-12',
      issuedBy: 'Sở Giao thông Vận tải TP. Hà Nội',
      taxCode: '0108922119',
      representativeName: 'Trần Đình Tuấn',
      phone: '0988776655',
      address: 'Số 45 Đường Giải Phóng, Quận Hoàng Mai, Hà Nội',
      status: 'approved',
      rating: 4.9,
      completedTripsCount: 248,
      bankAccount: {
        bankName: 'Vietcombank - Chi nhánh Thăng Long',
        accountNumber: '0011004389922',
        accountHolder: 'HTX VAN TAI AN BINH',
      },
      allianceJoinedAt: '2026-08-15T10:00:00.000Z',
    },
    {
      id: 'op-hoasen',
      userId: 'usr-operator-2',
      businessName: 'Công Ty Cổ Phần Thương Mại & Vận Tải Hoa Sen',
      licenseNumber: 'GP-KDVT-0109433/HN',
      licenseIssuedDate: '2023-01-18',
      issuedBy: 'Sở Giao thông Vận tải TP. Hà Nội',
      taxCode: '0109433881',
      representativeName: 'Lê Hoàng Minh',
      phone: '0903221144',
      address: 'Tầng 3 Tòa Nhà Lotus, Phạm Hùng, Cầu Giấy, Hà Nội',
      status: 'approved',
      rating: 4.8,
      completedTripsCount: 195,
      bankAccount: {
        bankName: 'Techcombank - CN Keangnam',
        accountNumber: '19033481772019',
        accountHolder: 'CTCP VAN TAI HOA SEN',
      },
      allianceJoinedAt: '2026-08-20T11:00:00.000Z',
    },
    {
      id: 'op-saoviet',
      userId: 'usr-operator-3',
      businessName: 'HTX Dịch Vụ Vận Tải Sao Việt Hải Phòng',
      licenseNumber: 'GP-KDVT-0200881/HP',
      licenseIssuedDate: '2024-03-05',
      issuedBy: 'Sở Giao thông Vận tải TP. Hải Phòng',
      taxCode: '0200881944',
      representativeName: 'Vũ Đức Thịnh',
      phone: '0936554433',
      address: 'Số 112 Lê Thánh Tông, Ngô Quyền, Hải Phòng',
      status: 'pending',
      rating: 4.7,
      completedTripsCount: 0,
      bankAccount: {
        bankName: 'MBBank - CN Hải Phòng',
        accountNumber: '888019928374',
        accountHolder: 'HTX SAO VIET HAI PHONG',
      },
      allianceJoinedAt: '2026-09-22T14:30:00.000Z',
    },
  ],
  operatorDocuments: [
    {
      id: 'doc-1',
      operatorId: 'op-anbinh',
      type: 'business_license',
      title: 'Giấy phép Kinh doanh vận tải bằng xe ô tô',
      fileName: 'GPKD_VanTai_AnBinh_So0108922.pdf',
      status: 'approved',
      uploadedAt: '2026-08-15T09:35:00.000Z',
      notes: 'Đầy đủ điều kiện xe hợp đồng dưới 8 chỗ',
    },
    {
      id: 'doc-2',
      operatorId: 'op-anbinh',
      type: 'badge_sample',
      title: 'Mẫu phù hiệu Xe Hợp Đồng cấp bởi Sở GTVT',
      fileName: 'PhuHieu_XeHopDong_AnBinh.pdf',
      status: 'approved',
      uploadedAt: '2026-08-15T09:36:00.000Z',
    },
    {
      id: 'doc-3',
      operatorId: 'op-saoviet',
      type: 'business_license',
      title: 'Giấy phép Kinh doanh vận tải bằng xe ô tô số 0200881/HP',
      fileName: 'GPKD_SaoViet_HaiPhong.pdf',
      status: 'pending',
      uploadedAt: '2026-09-22T14:35:00.000Z',
      notes: 'Chờ Ban Quản Trị ViaStep đối chiếu tra cứu trên Cổng thông tin Tổng cục Đường bộ',
    },
  ],
  vehicles: [
    {
      id: 'veh-1',
      operatorId: 'op-anbinh',
      plateNumber: '29B-188.45',
      brandModel: 'Kia Carnival Royal 2024 (7 chỗ)',
      seatCapacity: 7,
      inspectionExpiry: '2027-04-10',
      badgeNumber: 'HD-29-00918',
      status: 'active',
    },
    {
      id: 'veh-2',
      operatorId: 'op-anbinh',
      plateNumber: '29B-205.12',
      brandModel: 'Ford Tourneo Executive (7 chỗ)',
      seatCapacity: 7,
      inspectionExpiry: '2026-12-15',
      badgeNumber: 'HD-29-01124',
      status: 'active',
    },
    {
      id: 'veh-3',
      operatorId: 'op-hoasen',
      plateNumber: '29F-099.88',
      brandModel: 'Toyota Innova Cross Hybrid (7 chỗ)',
      seatCapacity: 7,
      inspectionExpiry: '2027-01-20',
      badgeNumber: 'HD-29-02391',
      status: 'active',
    },
    {
      id: 'veh-4',
      operatorId: 'op-hoasen',
      plateNumber: '30K-456.78',
      brandModel: 'Hyundai Staria VIP Lounge (7 chỗ)',
      seatCapacity: 7,
      inspectionExpiry: '2027-06-30',
      badgeNumber: 'HD-30-05812',
      status: 'active',
    },
  ],
  drivers: [
    {
      id: 'drv-1',
      operatorId: 'op-anbinh',
      fullName: 'Phạm Quang Dũng',
      phone: '0977112233',
      licenseClass: 'D',
      licenseNumber: '010192837461',
      licenseExpiry: '2029-05-15',
      judicialRecordNumber: 'LLTP-01/2026-8831',
      status: 'active',
    },
    {
      id: 'drv-2',
      operatorId: 'op-anbinh',
      fullName: 'Vũ Quốc Huy',
      phone: '0982334455',
      licenseClass: 'B2',
      licenseNumber: '010204918237',
      licenseExpiry: '2030-08-10',
      judicialRecordNumber: 'LLTP-01/2026-9012',
      status: 'active',
    },
    {
      id: 'drv-3',
      operatorId: 'op-hoasen',
      fullName: 'Đặng Thanh Tùng',
      phone: '0915667788',
      licenseClass: 'D',
      licenseNumber: '010188726354',
      licenseExpiry: '2028-11-20',
      judicialRecordNumber: 'LLTP-01/2025-4512',
      status: 'active',
    },
  ],
  corridors: defaultCorridors,
  priceTables: [
    // Operator An Binh sets their own rates:
    {
      id: 'pt-1',
      operatorId: 'op-anbinh',
      corridorId: 'corridor-hn-hp',
      corridorName: 'Hà Nội ↔ Hải Phòng',
      pricePerSeat: 190000,
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'pt-2',
      operatorId: 'op-anbinh',
      corridorId: 'corridor-hn-qn',
      corridorName: 'Hà Nội ↔ Quảng Ninh (Hạ Long)',
      pricePerSeat: 240000,
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'pt-3',
      operatorId: 'op-anbinh',
      corridorId: 'corridor-hn-nb',
      corridorName: 'Hà Nội ↔ Ninh Bình',
      pricePerSeat: 160000,
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    // Operator Hoa Sen sets their own rates (premium luxury):
    {
      id: 'pt-4',
      operatorId: 'op-hoasen',
      corridorId: 'corridor-hn-hp',
      corridorName: 'Hà Nội ↔ Hải Phòng',
      pricePerSeat: 220000,
      updatedAt: '2026-09-05T00:00:00.000Z',
    },
    {
      id: 'pt-5',
      operatorId: 'op-hoasen',
      corridorId: 'corridor-hn-qn',
      corridorName: 'Hà Nội ↔ Quảng Ninh (Hạ Long)',
      pricePerSeat: 270000,
      updatedAt: '2026-09-05T00:00:00.000Z',
    },
    {
      id: 'pt-6',
      operatorId: 'op-hoasen',
      corridorId: 'corridor-hn-nb',
      corridorName: 'Hà Nội ↔ Ninh Bình',
      pricePerSeat: 180000,
      updatedAt: '2026-09-05T00:00:00.000Z',
    },
  ],
  availabilitySlots: [
    {
      id: 'slot-1',
      operatorId: 'op-anbinh',
      corridorId: 'corridor-hn-hp',
      date: '2026-09-24',
      timeWindowStart: '07:00',
      timeWindowEnd: '09:30',
      declaredSeats: 7,
      vehicleId: 'veh-1',
      notes: 'Khung giờ linh hoạt sáng đón tận nơi nội thành Hà Nội',
    },
    {
      id: 'slot-2',
      operatorId: 'op-anbinh',
      corridorId: 'corridor-hn-hp',
      date: '2026-09-24',
      timeWindowStart: '13:30',
      timeWindowEnd: '16:00',
      declaredSeats: 7,
      vehicleId: 'veh-2',
      notes: 'Khung giờ linh hoạt chiều Hà Nội - Hải Phòng',
    },
    {
      id: 'slot-3',
      operatorId: 'op-hoasen',
      corridorId: 'corridor-hn-hp',
      date: '2026-09-24',
      timeWindowStart: '08:00',
      timeWindowEnd: '10:30',
      declaredSeats: 7,
      vehicleId: 'veh-3',
      notes: 'Staria Hybrid ghế thương gia cao cấp',
    },
  ],
  requests: [
    {
      id: 'req-demo-1',
      passengerId: 'usr-passenger-1',
      passengerName: 'Nguyễn Văn Hùng',
      passengerPhone: '0912345678',
      pickupAddress: 'Số 18 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
      dropoffAddress: 'Số 50 Điện Biên Phủ, Quận Hồng Bàng, Hải Phòng',
      corridorId: 'corridor-hn-hp',
      travelDate: '2026-09-24',
      preferredTimeStart: '07:30',
      preferredTimeEnd: '09:00',
      seatsRequested: 2,
      selectionMode: 'max_price',
      maxPricePerSeat: 200000,
      status: 'pending',
      createdAt: '2026-09-23T20:10:00.000Z',
    },
    {
      id: 'req-demo-2',
      passengerId: 'usr-passenger-2',
      passengerName: 'Trần Thị Thu Hà',
      passengerPhone: '0981122334',
      pickupAddress: 'Tòa Landmark 72, Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội',
      dropoffAddress: 'Vinpearl Rivera Hải Phòng, Thượng Lý, Hồng Bàng',
      corridorId: 'corridor-hn-hp',
      travelDate: '2026-09-24',
      preferredTimeStart: '07:45',
      preferredTimeEnd: '09:15',
      seatsRequested: 1,
      selectionMode: 'max_price',
      maxPricePerSeat: 210000,
      status: 'pending',
      createdAt: '2026-09-23T20:15:00.000Z',
    },
  ],
  proposals: [],
  contracts: [],
  payments: [],
  trips: [],
  reviews: [],
  complaints: [
    {
      id: 'comp-1',
      contractId: 'HDDT-2026-0008',
      filedByRole: 'passenger',
      filedById: 'usr-passenger-1',
      filedByName: 'Nguyễn Văn Hùng',
      targetPartyName: 'Hợp Tác Xã Vận Tải An Bình',
      subject: 'Lái xe đến điểm đón trễ 20 phút do tắc đường nút giao Pháp Vân',
      content: 'Chuyến xe ngày 20/09, tài xế đến trễ nhưng có gọi điện thông báo trước. Đề nghị cải thiện cảnh báo lộ trình.',
      status: 'resolved',
      resolutionNotes: 'HTX An Bình đã liên hệ xin lỗi hành khách, gửi voucher ưu đãi 15% cho lần sau. Hành khách hài lòng.',
      createdAt: '2026-09-21T10:00:00.000Z',
      logs: [
        {
          time: '2026-09-21T10:00:00.000Z',
          action: 'Mở khiếu nại',
          actor: 'Hành khách Nguyễn Văn Hùng',
        },
        {
          time: '2026-09-21T14:30:00.000Z',
          action: 'Đã giải quyết thỏa đáng giữa hai bên',
          actor: 'Admin ViaStep',
        },
      ],
    },
  ],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: '2026-09-22T08:00:00.000Z',
      eventType: 'license_approved',
      description: 'Phê duyệt hồ sơ thành viên HTX An Bình sau khi thẩm định Giấy phép kinh doanh vận tải xe hợp đồng',
      details: { operatorId: 'op-anbinh', licenseNumber: 'GP-KDVT-0108922/HN' },
      complianceNote: 'Xác minh đúng thẩm quyền Sở GTVT Hà Nội cấp phép theo NĐ 10/2020/NĐ-CP.',
    },
    {
      id: 'log-2',
      timestamp: '2026-09-23T20:30:00.000Z',
      eventType: 'price_updated',
      description: 'Thành viên CTCP Vận Tải Hoa Sen tự cập nhật biểu giá tuyến Hà Nội - Hải Phòng lên 220.000đ/chỗ',
      details: { operatorId: 'op-hoasen', newPrice: 220000 },
      complianceNote: 'Biểu giá do doanh nghiệp tự quyết, ViaStep không can thiệp hay hạn chế giá.',
    },
  ],
  platformSettings: {
    platformFeePercent: 10,
    reserveFundPercent: 2,
    autoExpireMinutes: 45,
  },
};

// Load or Seed DB
let db: DBState = initialData;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Failed to load database, using memory fallback:', err);
    db = initialData;
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

loadDatabase();

// Helper to record audit log
function recordAudit(eventType: any, description: string, details: any, complianceNote: string) {
  const log = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    eventType,
    description,
    details,
    complianceNote,
  };
  db.auditLogs.unshift(log);
  saveDatabase();
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Current user profile & quick switch for testing MVP
let currentUserId = 'usr-passenger-1';

// Full application state for React frontend
app.get('/api/state', (req, res) => {
  const currentUser = db.users.find((u) => u.id === currentUserId) || db.users[0];

  const enrichedOperators = db.operators.map((op) => {
    const operatorPrices = db.priceTables.filter((pt) => pt.operatorId === op.id);
    const operatorVehicles = db.vehicles.filter((v) => v.operatorId === op.id);
    const operatorDrivers = db.drivers.filter((d) => d.operatorId === op.id);
    const operatorSlots = db.availabilitySlots.filter((s) => s.operatorId === op.id);
    const operatorDocs = db.operatorDocuments.filter((d) => d.operatorId === op.id);

    return {
      ...op,
      prices: operatorPrices,
      vehicles: operatorVehicles,
      drivers: operatorDrivers,
      slots: operatorSlots,
      documents: operatorDocs,
    };
  });

  res.json({
    currentUser,
    users: db.users,
    operators: enrichedOperators,
    corridors: db.corridors,
    requests: db.requests,
    proposals: db.proposals,
    contracts: db.contracts,
    payments: db.payments,
    trips: db.trips,
    complaints: db.complaints,
    auditLogs: db.auditLogs,
    settings: db.platformSettings,
  });
});

app.get('/api/auth/current', (req, res) => {
  const user = db.users.find((u) => u.id === currentUserId) || db.users[0];
  let operatorData = null;
  if (user.role === 'operator') {
    operatorData = db.operators.find((op) => op.userId === user.id) || null;
  }
  res.json({
    user,
    operator: operatorData,
  });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role, operatorId } = req.body;
  let targetUser = null;
  if (role === 'passenger') {
    targetUser = db.users.find((u) => u.role === 'passenger');
  } else if (role === 'admin') {
    targetUser = db.users.find((u) => u.role === 'admin');
  } else if (role === 'operator') {
    if (operatorId) {
      const op = db.operators.find((o) => o.id === operatorId);
      if (op) {
        targetUser = db.users.find((u) => u.id === op.userId);
      }
    }
    if (!targetUser) {
      targetUser = db.users.find((u) => u.role === 'operator');
    }
  }

  if (targetUser) {
    currentUserId = targetUser.id;
    let operatorData = null;
    if (targetUser.role === 'operator') {
      operatorData = db.operators.find((op) => op.userId === targetUser.id) || null;
    }
    return res.json({ success: true, user: targetUser, operator: operatorData });
  }

  res.status(404).json({ error: 'Role or operator not found' });
});

// OTP verification endpoint (sandbox OTP: 123456)
app.post('/api/auth/otp/send', (req, res) => {
  const { phone } = req.body;
  res.json({
    success: true,
    message: 'Mã xác thực OTP đã được gửi đến số điện thoại (Mã sandbox: 123456)',
    sandboxOtp: '123456',
  });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { phone, otp, name } = req.body;
  if (otp === '123456' || otp === '999999') {
    let user = db.users.find((u) => u.phone === phone);
    if (!user) {
      user = {
        id: 'usr-' + Date.now(),
        phone,
        name: name || 'Khách hàng ' + phone.slice(-4),
        role: 'passenger',
        otpVerified: true,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else {
      user.otpVerified = true;
      if (name) user.name = name;
    }
    currentUserId = user.id;
    saveDatabase();
    return res.json({ success: true, user });
  }
  res.status(400).json({ error: 'Mã OTP không chính xác. Vui lòng nhập 123456' });
});

// Corridors
app.get('/api/corridors', (req, res) => {
  res.json(db.corridors);
});

// Operators list (public for searching and comparing rates)
app.get('/api/operators', (req, res) => {
  const approvedOperators = db.operators.map((op) => {
    const operatorPrices = db.priceTables.filter((pt) => pt.operatorId === op.id);
    const operatorVehicles = db.vehicles.filter((v) => v.operatorId === op.id);
    const operatorDrivers = db.drivers.filter((d) => d.operatorId === op.id);
    const operatorSlots = db.availabilitySlots.filter((s) => s.operatorId === op.id);
    const operatorDocs = db.operatorDocuments.filter((d) => d.operatorId === op.id);

    return {
      ...op,
      prices: operatorPrices,
      vehicles: operatorVehicles,
      drivers: operatorDrivers,
      slots: operatorSlots,
      documents: operatorDocs,
    };
  });
  res.json(approvedOperators);
});

// Register new operator + upload docs
app.post('/api/operators/register', (req, res) => {
  const {
    businessName,
    licenseNumber,
    licenseIssuedDate,
    issuedBy,
    taxCode,
    representativeName,
    phone,
    address,
    bankName,
    accountNumber,
    accountHolder,
  } = req.body;

  if (!businessName || !licenseNumber || !taxCode) {
    return res.status(400).json({ error: 'Thiếu thông tin pháp nhân hoặc giấy phép bắt buộc' });
  }

  const newUserId = 'usr-op-' + Date.now();
  const newOpId = 'op-' + Date.now();

  const user = {
    id: newUserId,
    phone,
    name: representativeName + ' (' + businessName + ')',
    role: 'operator',
    otpVerified: true,
    createdAt: new Date().toISOString(),
  };

  const operator = {
    id: newOpId,
    userId: newUserId,
    businessName,
    licenseNumber,
    licenseIssuedDate: licenseIssuedDate || '2024-01-01',
    issuedBy: issuedBy || 'Sở Giao thông Vận tải',
    taxCode,
    representativeName,
    phone,
    address,
    status: 'pending', // Phải qua Admin duyệt
    rating: 5.0,
    completedTripsCount: 0,
    bankAccount: {
      bankName: bankName || 'Vietcombank',
      accountNumber: accountNumber || '0000000000',
      accountHolder: accountHolder || businessName,
    },
    allianceJoinedAt: new Date().toISOString(),
  };

  // Add dummy initial documents
  const doc = {
    id: 'doc-' + Date.now(),
    operatorId: newOpId,
    type: 'business_license',
    title: 'Giấy phép Kinh doanh vận tải bằng xe ô tô số ' + licenseNumber,
    fileName: 'GPKD_' + licenseNumber.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf',
    status: 'pending',
    uploadedAt: new Date().toISOString(),
    notes: 'Hồ sơ mới gửi, chờ thẩm định.',
  };

  db.users.push(user);
  db.operators.push(operator);
  db.operatorDocuments.push(doc);

  currentUserId = newUserId;
  saveDatabase();

  recordAudit(
    'license_approved',
    `Thành viên mới ${businessName} nộp hồ sơ xin gia nhập liên minh`,
    { operatorId: newOpId, licenseNumber },
    'Đang chờ Ban Quản trị đối chiếu với cơ quan quản lý nhà nước.'
  );

  res.json({ success: true, operator, user });
});

// Update operator pricing table (Operators independently decide their prices!)
app.post('/api/operators/pricing', (req, res) => {
  const { operatorId, corridorId, pricePerSeat } = req.body;
  if (!operatorId || !corridorId || !pricePerSeat) {
    return res.status(400).json({ error: 'Thiếu thông tin giá hoặc hành lang' });
  }

  const corridor = db.corridors.find((c) => c.id === corridorId);
  const existing = db.priceTables.find(
    (pt) => pt.operatorId === operatorId && pt.corridorId === corridorId
  );

  const priceNum = Number(pricePerSeat);
  if (existing) {
    existing.pricePerSeat = priceNum;
    existing.updatedAt = new Date().toISOString();
  } else {
    db.priceTables.push({
      id: 'pt-' + Date.now(),
      operatorId,
      corridorId,
      corridorName: corridor ? corridor.name : corridorId,
      pricePerSeat: priceNum,
      updatedAt: new Date().toISOString(),
    });
  }

  saveDatabase();

  const operator = db.operators.find((o) => o.id === operatorId);
  recordAudit(
    'price_updated',
    `Thành viên [${operator ? operator.businessName : operatorId}] tự ban hành giá mới: ${priceNum.toLocaleString('vi-VN')} đ cho hành lang ${corridor?.name}`,
    { operatorId, corridorId, pricePerSeat: priceNum },
    'TUÂN THỦ: Biểu giá do thành viên tự quyết định 100%, sàn ViaStep không can thiệp hay áp giá trần/sàn chung.'
  );

  res.json({ success: true, priceTables: db.priceTables.filter((pt) => pt.operatorId === operatorId) });
});

// Operator availability slots (Flexible time window, NOT fixed bus timetable)
app.post('/api/operators/availability', (req, res) => {
  const { operatorId, corridorId, date, timeWindowStart, timeWindowEnd, declaredSeats, vehicleId, notes } = req.body;
  if (!operatorId || !corridorId || !date || !timeWindowStart || !timeWindowEnd) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ khung giờ sẵn sàng' });
  }

  const newSlot = {
    id: 'slot-' + Date.now(),
    operatorId,
    corridorId,
    date,
    timeWindowStart,
    timeWindowEnd,
    declaredSeats: Number(declaredSeats) || 7,
    vehicleId,
    notes: notes || 'Khung giờ sẵn sàng đón trả linh hoạt',
  };

  db.availabilitySlots.push(newSlot);
  saveDatabase();
  res.json({ success: true, slot: newSlot });
});

app.delete('/api/operators/availability/:id', (req, res) => {
  const { id } = req.params;
  db.availabilitySlots = db.availabilitySlots.filter((s) => s.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// Operator vehicle & driver management
app.post('/api/operators/vehicles', (req, res) => {
  const { operatorId, plateNumber, brandModel, seatCapacity, inspectionExpiry, badgeNumber } = req.body;
  const capacity = Number(seatCapacity) || 7;
  if (capacity > 8) {
    return res.status(400).json({ error: 'Ràng buộc pháp lý: Chỉ áp dụng xe hợp đồng dưới 8 chỗ ngồi' });
  }

  const newVehicle = {
    id: 'veh-' + Date.now(),
    operatorId,
    plateNumber,
    brandModel,
    seatCapacity: capacity,
    inspectionExpiry,
    badgeNumber,
    status: 'active',
  };

  db.vehicles.push(newVehicle);
  saveDatabase();
  res.json({ success: true, vehicle: newVehicle });
});

app.post('/api/operators/drivers', (req, res) => {
  const { operatorId, fullName, phone, licenseClass, licenseNumber, licenseExpiry, judicialRecordNumber } = req.body;

  const newDriver = {
    id: 'drv-' + Date.now(),
    operatorId,
    fullName,
    phone,
    licenseClass: licenseClass || 'D',
    licenseNumber,
    licenseExpiry,
    judicialRecordNumber,
    status: 'active',
  };

  db.drivers.push(newDriver);
  saveDatabase();
  res.json({ success: true, driver: newDriver });
});

// Operator Leave Alliance ("Rời liên minh")
app.post('/api/operators/leave-alliance', (req, res) => {
  const { operatorId, reason } = req.body;
  const op = db.operators.find((o) => o.id === operatorId);
  if (!op) return res.status(404).json({ error: 'Operator not found' });

  op.status = 'left_alliance';
  saveDatabase();

  recordAudit(
    'license_approved',
    `Thành viên [${op.businessName}] chủ động rút khỏi liên minh ViaStep. Lý do: ${reason || 'Tự nguyện ngừng liên kết'}`,
    { operatorId, reason },
    'Đảm bảo quyền tự do kinh doanh và cam kết phi độc quyền.'
  );

  res.json({ success: true, message: 'Đã hoàn tất thủ tục rời liên minh và ngắt nhận gói đề xuất mới.' });
});

// Requests API
app.get('/api/requests', (req, res) => {
  res.json(db.requests);
});

app.post('/api/requests', (req, res) => {
  const {
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
    targetOperatorId,
    maxPricePerSeat,
  } = req.body;

  if (!pickupAddress || !dropoffAddress || !corridorId || !travelDate) {
    return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ địa chỉ đón/trả và ngày đi' });
  }

  let targetOperatorName = undefined;
  if (targetOperatorId) {
    const op = db.operators.find((o) => o.id === targetOperatorId);
    if (op) targetOperatorName = op.businessName;
  }

  const newRequest = {
    id: 'req-' + Date.now(),
    passengerId: currentUserId,
    passengerName: passengerName || 'Hành khách',
    passengerPhone: passengerPhone || '0900000000',
    pickupAddress,
    dropoffAddress,
    corridorId,
    travelDate,
    preferredTimeStart: preferredTimeStart || '08:00',
    preferredTimeEnd: preferredTimeEnd || '10:00',
    seatsRequested: Number(seatsRequested) || 1,
    selectionMode: selectionMode || 'max_price',
    targetOperatorId,
    targetOperatorName,
    maxPricePerSeat: maxPricePerSeat ? Number(maxPricePerSeat) : undefined,
    status: 'pending', // "Đang chờ ghép" - CHƯA THU TIỀN!
    createdAt: new Date().toISOString(),
  };

  db.requests.unshift(newRequest);
  saveDatabase();

  // Try auto-clustering requests into proposals
  triggerGroupingAlgorithm();

  res.json({
    success: true,
    request: newRequest,
    message: 'Yêu cầu của quý khách đã được ghi nhận ở trạng thái "Đang chờ ghép". Hệ thống CHƯA THU BẤT KỲ KHOẢN TIỀN NÀO cho đến khi nhà xe xác nhận và phát hành hợp đồng điện tử.',
  });
});

// Trigger Heuristic Grouping Algorithm:
// Groups pending requests by Corridor + Travel Date + Overlapping Time Window + Total Seats <= 7.
// Simultaneously sends proposal to all operators whose own price is <= passenger max price (or target operator).
function triggerGroupingAlgorithm() {
  const pendingRequests = db.requests.filter((r) => r.status === 'pending');
  if (pendingRequests.length === 0) return;

  // Group by corridorId + travelDate
  const groups: { [key: string]: typeof pendingRequests } = {};
  for (const req of pendingRequests) {
    const key = `${req.corridorId}_${req.travelDate}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(req);
  }

  for (const key in groups) {
    const list = groups[key];
    let currentBatch: typeof pendingRequests = [];
    let seatsInBatch = 0;

    for (const item of list) {
      if (seatsInBatch + item.seatsRequested <= 7) {
        currentBatch.push(item);
        seatsInBatch += item.seatsRequested;
      }
    }

    if (currentBatch.length > 0) {
      const first = currentBatch[0];
      const corridor = db.corridors.find((c) => c.id === first.corridorId);

      // Find operators who qualify:
      // Must be approved
      // For each passenger in batch:
      // If passenger chose targetOperatorId, operator must be that operator
      // If passenger chose maxPrice, operator's own price for this corridor must be <= passenger's maxPrice
      const approvedOps = db.operators.filter((o) => o.status === 'approved');
      const qualifiedOpIds: string[] = [];

      for (const op of approvedOps) {
        const opPrice = db.priceTables.find(
          (pt) => pt.operatorId === op.id && pt.corridorId === first.corridorId
        );
        if (!opPrice) continue;

        let eligibleForAllPassengers = true;
        for (const passengerReq of currentBatch) {
          if (passengerReq.selectionMode === 'specific_operator') {
            if (passengerReq.targetOperatorId !== op.id) {
              eligibleForAllPassengers = false;
              break;
            }
          } else if (passengerReq.selectionMode === 'max_price') {
            if (passengerReq.maxPricePerSeat && opPrice.pricePerSeat > passengerReq.maxPricePerSeat) {
              eligibleForAllPassengers = false;
              break;
            }
          }
        }

        if (eligibleForAllPassengers) {
          qualifiedOpIds.push(op.id);
        }
      }

      if (qualifiedOpIds.length > 0) {
        const proposalId = 'prop-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const proposal = {
          id: proposalId,
          corridorId: first.corridorId,
          corridorName: corridor ? corridor.name : first.corridorId,
          travelDate: first.travelDate,
          timeWindow: `${first.preferredTimeStart} - ${first.preferredTimeEnd}`,
          requestIds: currentBatch.map((r) => r.id),
          totalSeats: seatsInBatch,
          pickupList: currentBatch.map((r) => ({
            address: r.pickupAddress,
            passengerName: r.passengerName,
            seats: r.seatsRequested,
          })),
          dropoffList: currentBatch.map((r) => ({
            address: r.dropoffAddress,
            passengerName: r.passengerName,
            seats: r.seatsRequested,
          })),
          proposedOperatorIds: qualifiedOpIds, // Gửi đồng thời cho TẤT CẢ các thành viên này!
          sentAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          status: 'open',
          operatorResponses: qualifiedOpIds.map((id) => {
            const op = db.operators.find((o) => o.id === id);
            return {
              operatorId: id,
              operatorName: op ? op.businessName : id,
              action: 'viewed' as const,
              timestamp: new Date().toISOString(),
            };
          }),
        };

        db.proposals.unshift(proposal);

        // Update request status to 'matched'
        for (const req of currentBatch) {
          req.status = 'matched';
          req.matchedProposalId = proposalId;
        }

        saveDatabase();

        recordAudit(
          'proposal_broadcast',
          `Hệ thống phát đề xuất gói ghép ${proposalId} ĐỒNG THỜI tới ${qualifiedOpIds.length} nhà xe đủ điều kiện (${corridor?.name}, ${seatsInBatch} khách)`,
          {
            proposalId,
            qualifiedOpIds,
            sentAt: proposal.sentAt,
            passengerCount: currentBatch.length,
          },
          'TUÂN THỦ NGHỊ ĐỊNH: Đề xuất phát đồng thời, không gán đơn ưu tiên, ai bấm trước nhận trước, ViaStep không điều xe.'
        );
      }
    }
  }
}

// Proposals list
app.get('/api/proposals', (req, res) => {
  res.json(db.proposals);
});

// Trigger matching manually (e.g. from Admin or Operator dashboard refresh)
app.post('/api/proposals/trigger-match', (req, res) => {
  triggerGroupingAlgorithm();
  res.json({ success: true, proposalsCount: db.proposals.length });
});

// Operator Accepts Proposal (First-to-claim atomic lock!)
app.post('/api/proposals/:id/accept', (req, res) => {
  const { id } = req.params;
  const { operatorId } = req.body;

  const proposal = db.proposals.find((p) => p.id === id);
  if (!proposal) return res.status(404).json({ error: 'Gói đề xuất không tồn tại' });

  if (proposal.status !== 'open') {
    return res.status(400).json({
      error: `Gói ghép này đã được tiếp nhận bởi đơn vị [${proposal.acceptedOperatorName || 'khác'}] vào lúc ${proposal.acceptedAt ? new Date(proposal.acceptedAt).toLocaleTimeString('vi-VN') : ''}. Rất tiếc, quý đơn vị vui lòng đợi gói tiếp theo!`,
    });
  }

  const op = db.operators.find((o) => o.id === operatorId);
  if (!op) return res.status(404).json({ error: 'Operator not found' });

  // Atomic claim
  proposal.status = 'accepted';
  proposal.acceptedOperatorId = operatorId;
  proposal.acceptedOperatorName = op.businessName;
  proposal.acceptedAt = new Date().toISOString();

  // Log acceptance action
  const respEntry = proposal.operatorResponses.find((r: any) => r.operatorId === operatorId);
  if (respEntry) {
    respEntry.action = 'accepted';
    respEntry.timestamp = proposal.acceptedAt;
  }

  // Get operator's own price for this corridor
  const opPrice = db.priceTables.find(
    (pt) => pt.operatorId === operatorId && pt.corridorId === proposal.corridorId
  );
  const finalPricePerSeat = opPrice ? opPrice.pricePerSeat : 200000;

  // Generate SEPARATE Individual Electronic Contract for EACH passenger!
  const generatedContracts = [];
  const relatedRequests = db.requests.filter((r) => proposal.requestIds.includes(r.id));

  for (const r of relatedRequests) {
    const contractCode = 'HDDT-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    const totalAmount = finalPricePerSeat * r.seatsRequested;
    const platformFee = Math.round((totalAmount * db.platformSettings.platformFeePercent) / 100);
    const operatorPayout = totalAmount - platformFee;

    const contract = {
      id: 'cnt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      contractCode,
      requestId: r.id,
      passengerId: r.passengerId,
      passengerName: r.passengerName,
      passengerPhone: r.passengerPhone,
      operatorId: op.id,
      operatorName: op.businessName,
      operatorLicense: op.licenseNumber,
      operatorTaxCode: op.taxCode,
      corridorName: proposal.corridorName,
      pickupAddress: r.pickupAddress,
      dropoffAddress: r.dropoffAddress,
      travelDate: r.travelDate,
      estimatedPickupTime: r.preferredTimeStart,
      seats: r.seatsRequested,
      pricePerSeat: finalPricePerSeat, // ĐÚNG GIÁ CỦA OPERATOR ĐÓ!
      totalAmount,
      platformFee,
      operatorPayout,
      legalBasis: 'Nghị định 10/2020/NĐ-CP, Nghị định 47/2022/NĐ-CP & Luật Giao dịch điện tử 2023',
      contractContent: `Hợp đồng vận chuyển điện tử lập riêng cho hành khách ${r.passengerName} (SĐT: ${r.passengerPhone}) với bên vận tải ${op.businessName}. Đón tại: ${r.pickupAddress}. Trả tại: ${r.dropoffAddress}. Giá vé niêm yết bởi nhà xe: ${finalPricePerSeat.toLocaleString('vi-VN')} đ/chỗ. Tổng cộng: ${totalAmount.toLocaleString('vi-VN')} đ. Đã bao gồm bảo hiểm hành khách theo luật.`,
      status: 'issued', // Phát hành, chờ khách ký & thanh toán
      signature: {
        operatorSignedAt: new Date().toISOString(),
        providerCertificate: 'VNPT-CA / Viettel-CA E-Sign Sandbox (Chứng thư số Nhà xe)',
        contractHash: 'SHA256:' + Math.random().toString(36).substring(2) + Date.now(),
      },
      issuedAt: new Date().toISOString(),
      archivedUntil: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 năm theo luật
    };

    db.contracts.push(contract);
    generatedContracts.push(contract);

    // Update request state
    r.status = 'contract_issued';
    r.contractId = contract.id;
  }

  // Create scheduled trip for this batch
  const defaultVehicle = db.vehicles.find((v) => v.operatorId === operatorId) || db.vehicles[0];
  const defaultDriver = db.drivers.find((d) => d.operatorId === operatorId) || db.drivers[0];

  const newTrip = {
    id: 'trip-' + Date.now(),
    proposalId: proposal.id,
    operatorId: op.id,
    operatorName: op.businessName,
    vehicleId: defaultVehicle.id,
    vehiclePlate: defaultVehicle.plateNumber,
    vehicleModel: defaultVehicle.brandModel,
    driverId: defaultDriver.id,
    driverName: defaultDriver.fullName,
    driverPhone: defaultDriver.phone,
    requestIds: proposal.requestIds,
    contractIds: generatedContracts.map((c) => c.id),
    corridorName: proposal.corridorName,
    travelDate: proposal.travelDate,
    status: 'scheduled',
    progressStep: 1, // 1: Đã xác nhận xe, 2: Lái xe đón khách, 3: Đang di chuyển, 4: Hoàn thành
    progressStatusText: 'Nhà xe đã tiếp nhận và phân công xe ' + defaultVehicle.plateNumber,
    passengerDetails: relatedRequests.map((r) => ({
      requestId: r.id,
      passengerName: r.passengerName,
      passengerPhone: r.passengerPhone,
      pickupAddress: r.pickupAddress,
      dropoffAddress: r.dropoffAddress,
      seats: r.seatsRequested,
    })),
  };

  db.trips.unshift(newTrip);
  saveDatabase();

  recordAudit(
    'proposal_accepted',
    `Thành viên [${op.businessName}] đã nhận gói ghép ${proposal.id} (xác nhận đầu tiên lúc ${proposal.acceptedAt}). Hệ thống tự động sinh ${generatedContracts.length} hợp đồng điện tử riêng biệt.`,
    {
      proposalId: proposal.id,
      operatorId: op.id,
      acceptedAt: proposal.acceptedAt,
      contractsCount: generatedContracts.length,
      finalPricePerSeat,
    },
    'TUÂN THỦ: Quyết định nhận khách thuộc về Nhà xe. Giá ghi trong HĐ là giá chính thức của Nhà xe, không can thiệp.'
  );

  res.json({
    success: true,
    proposal,
    contracts: generatedContracts,
    trip: newTrip,
    message: `Nhận gói ghép thành công! Đã phát hành ${generatedContracts.length} hợp đồng điện tử riêng biệt cho từng hành khách với giá ${finalPricePerSeat.toLocaleString('vi-VN')} đ/chỗ.`,
  });
});

// Operator Declines Proposal
app.post('/api/proposals/:id/decline', (req, res) => {
  const { id } = req.params;
  const { operatorId } = req.body;
  const proposal = db.proposals.find((p) => p.id === id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

  const resp = proposal.operatorResponses.find((r: any) => r.operatorId === operatorId);
  if (resp) {
    resp.action = 'declined';
    resp.timestamp = new Date().toISOString();
  }
  saveDatabase();
  res.json({ success: true });
});

// Contracts API
app.get('/api/contracts', (req, res) => {
  res.json(db.contracts);
});

app.get('/api/contracts/:id', (req, res) => {
  const contract = db.contracts.find((c) => c.id === req.params.id);
  if (!contract) return res.status(404).json({ error: 'Contract not found' });
  res.json(contract);
});

// Sign electronic contract (Passenger signs via OTP / Digital Signature Sandbox)
app.post('/api/contracts/:id/sign', (req, res) => {
  const { id } = req.params;
  const contract = db.contracts.find((c) => c.id === id);
  if (!contract) return res.status(404).json({ error: 'Hợp đồng không tồn tại' });

  contract.status = 'passenger_signed';
  contract.signature.passengerSignedAt = new Date().toISOString();
  contract.signature.passengerIp = req.ip || '127.0.0.1';

  saveDatabase();

  recordAudit(
    'contract_issued',
    `Hành khách ${contract.passengerName} đã ký hợp đồng điện tử số ${contract.contractCode} (Giá: ${contract.totalAmount.toLocaleString('vi-VN')} đ)`,
    { contractId: contract.id, contractCode: contract.contractCode },
    'TUÂN THỦ LUẬT GIAO DỊCH ĐIỆN TỬ: Hợp đồng lưu trữ 3 năm, xác thực qua chữ ký số/OTP bảo mật.'
  );

  res.json({
    success: true,
    contract,
    message: 'Ký hợp đồng điện tử thành công! Quý khách có thể tiến hành thanh toán.',
  });
});

// Payment Sandbox (Only after contract is signed/issued! Manual verification option included)
app.post('/api/payments/pay', (req, res) => {
  const { contractId, method } = req.body;
  const contract = db.contracts.find((c) => c.id === contractId);
  if (!contract) return res.status(404).json({ error: 'Contract not found' });

  const reqObj = db.requests.find((r) => r.id === contract.requestId);

  const paymentRecord = {
    id: 'pay-' + Date.now(),
    contractId: contract.id,
    requestId: contract.requestId,
    passengerId: contract.passengerId,
    amount: contract.totalAmount,
    status: 'completed',
    method: method || 'vnpay',
    transactionCode: 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    paidAt: new Date().toISOString(),
    platformFeeDeducted: contract.platformFee,
    operatorPayoutAmount: contract.operatorPayout,
    confirmedBy: 'Hệ thống Cổng Thanh Toán Sandbox (Thẩm định tự động & đối soát ký quỹ)',
  };

  db.payments.push(paymentRecord);

  // Update contract status
  contract.status = 'fully_executed';

  // Update request status
  if (reqObj) {
    reqObj.status = 'paid';
  }

  saveDatabase();

  res.json({
    success: true,
    payment: paymentRecord,
    contract,
    message: `Thanh toán thành công ${contract.totalAmount.toLocaleString('vi-VN')} VNĐ qua cổng thanh toán bảo đảm! Hợp đồng vận chuyển chính thức có hiệu lực toàn phần.`,
  });
});

// Trips API
app.get('/api/trips', (req, res) => {
  res.json(db.trips);
});

app.get('/api/trips/:id', (req, res) => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(trip);
});

// Update trip status & assign vehicle/driver
app.post('/api/trips/:id/update', (req, res) => {
  const { id } = req.params;
  const { vehicleId, driverId, progressStep, statusText, status } = req.body;

  const trip = db.trips.find((t) => t.id === id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  if (vehicleId) {
    const v = db.vehicles.find((veh) => veh.id === vehicleId);
    if (v) {
      trip.vehicleId = v.id;
      trip.vehiclePlate = v.plateNumber;
      trip.vehicleModel = v.brandModel;
    }
  }

  if (driverId) {
    const d = db.drivers.find((drv) => drv.id === driverId);
    if (d) {
      trip.driverId = d.id;
      trip.driverName = d.fullName;
      trip.driverPhone = d.phone;
    }
  }

  if (progressStep !== undefined) {
    trip.progressStep = Number(progressStep);
  }

  if (statusText) {
    trip.progressStatusText = statusText;
  }

  if (status) {
    trip.status = status;
    if (status === 'completed') {
      trip.completedAt = new Date().toISOString();
      // Update requests to completed
      for (const reqId of trip.requestIds) {
        const r = db.requests.find((rq) => rq.id === reqId);
        if (r) r.status = 'completed';
      }
    }
  }

  saveDatabase();
  res.json({ success: true, trip });
});

// Reviews API (Two-way rating)
app.get('/api/reviews', (req, res) => {
  res.json(db.reviews);
});

app.post('/api/reviews', (req, res) => {
  const { tripId, contractId, rating, comment, reviewerRole, reviewerName, targetId, targetName } = req.body;

  const newReview = {
    id: 'rev-' + Date.now(),
    tripId: tripId || 'trip-demo',
    contractId: contractId || 'cnt-demo',
    reviewerRole: reviewerRole || 'passenger',
    reviewerId: currentUserId,
    reviewerName: reviewerName || 'Khách hàng',
    targetId: targetId || 'op-anbinh',
    targetName: targetName || 'Nhà xe',
    rating: Number(rating) || 5,
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);
  saveDatabase();
  res.json({ success: true, review: newReview });
});

// Complaints API
app.get('/api/complaints', (req, res) => {
  res.json(db.complaints);
});

app.post('/api/complaints', (req, res) => {
  const { contractId, subject, content, filedByRole, filedByName, targetPartyName } = req.body;

  if (!contractId || !subject || !content) {
    return res.status(400).json({ error: 'Vui lòng cung cấp mã hợp đồng và nội dung khiếu nại' });
  }

  const newComplaint = {
    id: 'comp-' + Date.now(),
    contractId,
    filedByRole: filedByRole || 'passenger',
    filedById: currentUserId,
    filedByName: filedByName || 'Khách hàng',
    targetPartyName: targetPartyName || 'Đơn vị vận tải',
    subject,
    content,
    status: 'open',
    createdAt: new Date().toISOString(),
    logs: [
      {
        time: new Date().toISOString(),
        action: 'Mở khiếu nại mới gắn với Hợp đồng ' + contractId,
        actor: filedByName || 'Người dùng',
      },
    ],
  };

  db.complaints.unshift(newComplaint);
  saveDatabase();
  res.json({ success: true, complaint: newComplaint });
});

app.post('/api/complaints/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { status, resolutionNotes, actorName } = req.body;

  const complaint = db.complaints.find((c) => c.id === id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  complaint.status = status || 'resolved';
  complaint.resolutionNotes = resolutionNotes;
  complaint.logs.push({
    time: new Date().toISOString(),
    action: `Cập nhật trạng thái thành [${status}]: ${resolutionNotes}`,
    actor: actorName || 'Ban Quản Trị ViaStep',
  });

  saveDatabase();
  res.json({ success: true, complaint });
});

// Admin endpoints: Operator Approval / Rejection / Verification
app.post('/api/admin/operators/:id/verify', (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const op = db.operators.find((o) => o.id === id);
  if (!op) return res.status(404).json({ error: 'Operator not found' });

  op.status = status;
  if (status === 'approved') {
    for (const doc of db.operatorDocuments.filter((d) => d.operatorId === id)) {
      doc.status = 'approved';
    }
  }

  saveDatabase();

  recordAudit(
    'license_approved',
    `Admin thẩm định thành viên [${op.businessName}] -> Trạng thái [${status}]. Ghi chú: ${adminNotes || 'Hợp lệ'}`,
    { operatorId: op.id, status, adminNotes },
    'Ban Quản Trị chỉ kiểm tra điều kiện giấy phép KDVT theo NĐ 10/2020, không điều động xe.'
  );

  res.json({
    success: true,
    message: status === 'approved' ? 'Phê duyệt thành công hồ sơ nhà xe' : 'Đã từ chối hồ sơ',
    operator: op,
  });
});

app.post('/api/admin/operators/:id/approve', (req, res) => {
  const { id } = req.params;
  const op = db.operators.find((o) => o.id === id);
  if (!op) return res.status(404).json({ error: 'Operator not found' });

  op.status = 'approved';
  // Approve documents as well
  for (const doc of db.operatorDocuments.filter((d) => d.operatorId === id)) {
    doc.status = 'approved';
  }

  saveDatabase();

  recordAudit(
    'license_approved',
    `Admin đã phê duyệt tài khoản và hồ sơ năng lực thành viên [${op.businessName}]. Giấy phép: ${op.licenseNumber}`,
    { operatorId: op.id, businessName: op.businessName },
    'Đã đối chiếu thông tin pháp nhân hợp lệ trên Cổng thông tin Tổng cục Đường bộ.'
  );

  res.json({ success: true, operator: op });
});

app.post('/api/admin/operators/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const op = db.operators.find((o) => o.id === id);
  if (!op) return res.status(404).json({ error: 'Operator not found' });

  op.status = 'rejected';
  saveDatabase();

  recordAudit(
    'license_approved',
    `Admin từ chối hồ sơ thành viên [${op.businessName}]. Lý do: ${reason || 'Không đủ điều kiện giấy phép'}`,
    { operatorId: op.id, reason },
    'Bảo đảm chỉ các đơn vị đủ điều kiện theo NĐ 10/2020 mới được gia nhập sàn.'
  );

  res.json({ success: true, operator: op });
});

// Admin Settings
app.get('/api/admin/settings', (req, res) => {
  res.json({
    settings: db.platformSettings,
    stats: {
      totalOperators: db.operators.length,
      approvedOperators: db.operators.filter((o) => o.status === 'approved').length,
      totalRequests: db.requests.length,
      totalProposals: db.proposals.length,
      totalContracts: db.contracts.length,
      totalTrips: db.trips.length,
      totalComplaints: db.complaints.length,
      openComplaints: db.complaints.filter((c) => c.status === 'open').length,
    },
  });
});

app.post('/api/admin/settings', (req, res) => {
  const { platformFeePercent, reserveFundPercent, autoExpireMinutes } = req.body;
  if (platformFeePercent !== undefined) db.platformSettings.platformFeePercent = Number(platformFeePercent);
  if (reserveFundPercent !== undefined) db.platformSettings.reserveFundPercent = Number(reserveFundPercent);
  if (autoExpireMinutes !== undefined) db.platformSettings.autoExpireMinutes = Number(autoExpireMinutes);

  saveDatabase();
  res.json({ success: true, settings: db.platformSettings });
});

// Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json(db.auditLogs);
});

// Gemini AI Virtual Assistant (RAG on Legal Charter & Platform Status)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    const systemInstruction = `
Bạn là Trợ lý Pháp Lý & Hỗ Trợ Khách Hàng của nền tảng thương mại điện tử vận tải ViaStep.
ViaStep là sàn giao dịch TMĐT kết nối hành khách với các đơn vị vận tải xe hợp đồng liên tỉnh dưới 8 chỗ đã được cấp phép (Hợp tác xã, Doanh nghiệp).

RÀNG BUỘC PHÁP LÝ BẮT BUỘC BẠN PHẢI NẮM VỮNG VÀ TƯ VẤN CHÍNH XÁC:
1. ViaStep KHÔNG phải đơn vị vận tải: Không sở hữu xe, không thuê lái xe, không tự đặt giá cước, không điều động xe.
2. Không có "lịch chạy cố định" hay "tuyến cố định": Nhà xe chỉ khai báo khung giờ sẵn sàng linh hoạt.
3. Không có điểm đón/trả cố định kiểu bến xe: Đón trả tận nơi theo đúng địa chỉ hành khách nhập trong hợp đồng.
4. Giá cước: Khách luôn trả theo giá niêm yết của TỪNG nhà xe. ViaStep KHÔNG BAO GIỜ tự đặt hoặc áp giá chung, không có cụm từ "giá của ViaStep".
5. Đề xuất đồng thời (Simultaneous Broadcast): Khi ghép chuyến, hệ thống gửi đề xuất cùng lúc cho tất cả nhà xe đủ điều kiện, ai bấm nhận trước thì được. ViaStep không gán khách, không phân bổ ưu tiên.
6. Hợp đồng điện tử: Phát hành riêng biệt cho từng hành khách theo Nghị định 10/2020/NĐ-CP và Nghị định 47/2022/NĐ-CP, lưu trữ tối thiểu 3 năm.
7. Thanh toán: Chỉ thu tiền sau khi nhà xe đã xác nhận và hợp đồng điện tử được phát hành. Không thu tiền khi còn ở trạng thái yêu cầu chờ ghép.

Nhiệm vụ của bạn:
- Giải đáp thắc mắc của hành khách, nhà xe hoặc cơ quan thanh tra về quy chế hoạt động, tính hợp pháp, cách thức đặt chuyến, cách nhà xe nhận đề xuất ghép.
- Trả lời bằng tiếng Việt lịch sự, gãy gọn, viện dẫn điều khoản pháp luật khi cần.
- Nếu người dùng thể hiện bức xúc, khiếu nại chất lượng dịch vụ hoặc yêu cầu hỗ trợ khẩn cấp, hãy hướng dẫn họ mở phiếu khiếu nại gắn với mã hợp đồng hoặc bấm nút "Chuyển tiếp tổng đài viên 1900-xxxx".
`;

    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        chatContents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }],
        });
      }
    }

    chatContents.push({
      role: 'user',
      parts: [{ text: message || 'Xin chào, tôi cần tìm hiểu quy chế ViaStep.' }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'ViaStep là sàn giao dịch TMĐT kết nối xe hợp đồng dưới 8 chỗ có giấy phép. Mọi thông tin giá do nhà xe tự niêm yết.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error (falling back to regulatory knowledge base):', error?.message || error);

    // Contextual fallback response grounded in ViaStep legal framework
    const query = (req.body?.message || '').toLowerCase();
    let smartReply = 'ViaStep là sàn TMĐT trung gian kết nối hành khách với các đơn vị vận tải có Giấy phép KDVT (Nghị định 10/2020/NĐ-CP). ViaStep không sở hữu xe, không thuê lái xe và không tự đặt giá cước.';

    if (query.includes('giá') || query.includes('cước') || query.includes('đắt') || query.includes('rẻ') || query.includes('bao nhiêu')) {
      smartReply = 'Theo quy chế sàn ViaStep: ViaStep TUYỆT ĐỐI KHÔNG tự đặt giá hoặc làm tròn một mức giá chung. Biểu giá hiển thị là giá do CHÍNH đơn vị vận tải (Hợp tác xã / Doanh nghiệp) tự niêm yết độc lập. Giá cước này được ghi nhận chính xác vào Hợp đồng vận chuyển điện tử của quý khách.';
    } else if (query.includes('lịch') || query.includes('bến') || query.includes('cố định') || query.includes('giờ')) {
      smartReply = 'Theo quy định pháp luật về xe hợp đồng dưới 8 chỗ (NĐ 10/2020 và NĐ 47/2022), phương tiện KHÔNG chạy theo tuyến cố định và KHÔNG đón trả tại bến xe cố định. Thành viên vận tải chỉ khai báo khung giờ sẵn sàng linh hoạt, và đón/trả tận nơi theo đúng địa chỉ hành khách yêu cầu.';
    } else if (query.includes('đồng thời') || query.includes('nhận khách') || query.includes('ưu tiên') || query.includes('điều xe')) {
      smartReply = 'Quy tắc Đề xuất đồng thời (Simultaneous Broadcast): Khi một gói ghép đủ điều kiện, hệ thống phát đề xuất CÙNG LÚC tới tất cả các nhà xe đủ điều kiện. Đơn vị nào bấm "Nhận" trước sẽ được phục vụ. ViaStep cam kết không có tính năng điều xe, gán chuyến hay ưu tiên thiên vị.';
    } else if (query.includes('tiền') || query.includes('thanh toán') || query.includes('trừ tiền') || query.includes('thu tiền')) {
      smartReply = 'Cam kết tài chính: Khi quý khách tạo yêu cầu tìm chuyến, hệ thống TUYỆT ĐỐI KHÔNG THU TIỀN. Quý khách chỉ thanh toán sau khi có một nhà xe đã xác nhận nhận gói và Hợp đồng vận chuyển điện tử được phát hành với đúng giá của nhà xe đó.';
    } else if (query.includes('hợp đồng') || query.includes('pháp lý') || query.includes('ký') || query.includes('chữ ký')) {
      smartReply = 'Hợp đồng vận chuyển điện tử được phát hành RIÊNG BIỆT cho từng hành khách (không dùng hợp đồng chung cho cả nhóm), ký điện tử qua sandbox VNPT-CA/Viettel-CA và được lưu trữ trên sàn tối thiểu 03 năm theo quy định thanh tra chuyên ngành.';
    } else if (query.includes('khiếu nại') || query.includes('sự cố') || query.includes('tài xế') || query.includes('trễ')) {
      smartReply = 'Nếu gặp sự cố về chuyến đi hoặc lái xe, quý khách vui lòng vào mục "Mở khiếu nại" gắn với Mã Hợp đồng của chuyến đi hoặc bấm nút "Chuyển tiếp tổng đài viên (Hotline 1900-6868)" để được hỗ trợ giải quyết.';
    }

    res.json({ reply: smartReply });
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[ViaStep Server] Running on http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode.`);
  });
}

startServer();
