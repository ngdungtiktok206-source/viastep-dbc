/**
 * QUY CHẾ VẬN HÀNH & BẢO ĐẢM PHÁP LÝ NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ VIASTEP
 * Tuân thủ Nghị định 10/2020/NĐ-CP, Nghị định 47/2022/NĐ-CP, Nghị định 52/2013/NĐ-CP,
 * và các quy định về Giao kết Hợp đồng Điện tử trong vận tải hành khách theo hợp đồng.
 */

export const LEGAL_FRAMEWORK = {
  platformName: 'ViaStep',
  platformType: 'Sàn giao dịch thương mại điện tử kết nối vận tải xe hợp đồng',
  applicableLaws: [
    'Nghị định số 10/2020/NĐ-CP quy định về kinh doanh và điều kiện kinh doanh vận tải bằng xe ô tô',
    'Nghị định số 47/2022/NĐ-CP sửa đổi, bổ sung một số điều của Nghị định 10/2020/NĐ-CP',
    'Nghị định số 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP về Thương mại điện tử',
    'Luật Giao dịch điện tử số 20/2023/QH15 về giá trị pháp lý của Hợp đồng điện tử',
  ],
  corePrinciples: [
    {
      title: '1. ViaStep KHÔNG phải đơn vị kinh doanh vận tải',
      content:
        'ViaStep không sở hữu phương tiện, không thuê lái xe, không trực tiếp vận hành hoặc điều hành vận tải. ViaStep chỉ cung cấp giải pháp công nghệ trung gian kết nối nhu cầu hành khách với Hợp tác xã/Doanh nghiệp vận tải đã được Sở GTVT cấp Giấy phép kinh doanh vận tải hành khách bằng xe hợp đồng dưới 8 chỗ.',
    },
    {
      title: '2. Tôn trọng quyền tự định giá của Thành viên vận tải',
      content:
        'ViaStep TUYỆT ĐỐI KHÔNG tự đặt giá cước, không áp đặt giá sàn/giá trần chung, không làm tròn giá. Mọi mức giá hiển thị trên sàn là giá niêm yết trực tiếp của từng Thành viên vận tải theo biểu giá do đơn vị tự ban hành.',
    },
    {
      title: '3. Không có lịch chạy cố định & Không có bến đón/trả cố định',
      content:
        'Thành viên chỉ khai báo khung giờ sẵn sàng linh hoạt theo năng lực phương tiện. Hành khách nhập địa chỉ đón và trả tận nơi theo nhu cầu thực tế. Địa chỉ này được ghi nhận trực tiếp vào Hợp đồng vận chuyển điện tử của từng cá nhân.',
    },
    {
      title: '4. Cơ chế Đề xuất Đồng thời (Simultaneous Broadcast)',
      content:
        'Khi một nhóm yêu cầu thỏa mãn điều kiện ghép (cùng hành lang, cùng khung thời gian, giá thành viên ≤ mức giá trần của hành khách), hệ thống phát đề xuất ĐỒNG THỜI và MINH BẠCH cho toàn bộ Thành viên đủ điều kiện. Thành viên nào bấm nhận trước sẽ được tiếp nhận gói vận chuyển. ViaStep không can thiệp, không ưu tiên.',
    },
    {
      title: '5. Hợp đồng điện tử cá nhân hóa riêng biệt',
      content:
        'Mỗi hành khách khi được xác nhận dịch vụ sẽ được cấp một Hợp đồng vận chuyển điện tử riêng biệt ký giữa Hành khách và Thành viên vận tải được cấp phép, có chữ ký số điện tử hợp chuẩn và lưu trữ tối thiểu 03 năm theo quy định thanh tra chuyên ngành.',
    },
    {
      title: '6. Minh bạch tài chính & Không thu tiền trước khi có xe nhận',
      content:
        'Hệ thống không thu bất kỳ khoản tiền nào khi yêu cầu đang ở trạng thái tìm kiếm/chờ ghép. Chỉ khi Thành viên vận tải xác nhận và phát hành hợp đồng, hành khách mới tiến hành thanh toán qua cổng thanh toán trung gian an toàn.',
    },
  ],
};

export const CONTRACT_SAMPLE_TEMPLATE = (params: {
  contractCode: string;
  passengerName: string;
  passengerPhone: string;
  operatorName: string;
  operatorLicense: string;
  operatorTaxCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  travelDate: string;
  seats: number;
  pricePerSeat: number;
  totalAmount: number;
}) => `
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-----------------------------
HỢP ĐỒNG VẬN CHUYỂN HÀNH KHÁCH BẰNG XE Ô TÔ
(Hợp đồng điện tử theo Nghị định 10/2020/NĐ-CP & Nghị định 47/2022/NĐ-CP)
Mã số hợp đồng: ${params.contractCode}
Ngày phát hành: ${new Date().toLocaleDateString('vi-VN')}

BÊN A (BÊN VẬN TẢI - ĐƠN VỊ CÓ GIẤY PHÉP):
- Tên đơn vị: ${params.operatorName}
- Giấy phép KDVT số: ${params.operatorLicense} (Cấp bởi Sở Giao thông vận tải)
- Mã số thuế: ${params.operatorTaxCode}
- Đại diện theo pháp luật hoặc người được ủy quyền hợp lệ

BÊN B (BÊN THUÊ VẬN CHUYỂN - HÀNH KHÁCH):
- Họ và tên: ${params.passengerName}
- Số điện thoại liên hệ: ${params.passengerPhone}
- Địa chỉ đón yêu cầu: ${params.pickupAddress}
- Địa chỉ trả yêu cầu: ${params.dropoffAddress}

ĐIỀU 1: NỘI DUNG VẬN CHUYỂN
1.1. Bên A nhận vận chuyển Bên B cùng hành lý kèm theo từ điểm đón đến điểm trả nêu trên.
1.2. Ngày khởi hành: ${params.travelDate}. Thời gian đón dự kiến theo thông báo trên ứng dụng.
1.3. Số lượng chỗ ngồi thỏa thuận: ${params.seats} chỗ (phương tiện dưới 08 chỗ ngồi, có phù hiệu XE HỢP ĐỒNG).

ĐIỀU 2: GIÁ CƯỚC VÀ PHƯƠNG THỨC THANH TOÁN
2.1. Đơn giá cước do Bên A niêm yết: ${params.pricePerSeat.toLocaleString('vi-VN')} VNĐ/chỗ.
2.2. Tổng cước vận chuyển (đã bao gồm thuế, phí cầu đường, bảo hiểm trách nhiệm dân sự hành khách): ${params.totalAmount.toLocaleString('vi-VN')} VNĐ.
2.3. Thanh toán qua cổng thanh toán bảo đảm tích hợp trên Sàn TMĐT ViaStep.

ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
3.1. Bên A có trách nhiệm bố trí xe đủ điều kiện an toàn kỹ thuật, lái xe có GPLX phù hợp và lý lịch tư pháp rõ ràng, chấp hành đúng lộ trình và địa chỉ đón/trả của Bên B.
3.2. Bên B có mặt đúng giờ tại điểm đón đã đăng ký, chấp hành quy định an toàn khi tham gia giao thông.
3.3. ViaStep là đơn vị cung cấp hạ tầng sàn TMĐT công nghệ trung gian, không trực tiếp can thiệp điều hành xe hay thỏa thuận giá ngoài quy chế niêm yết.

ĐIỀU 4: HIỆU LỰC HỢP ĐỒNG
Hợp đồng này được xác lập dưới dạng thông điệp dữ liệu điện tử, có giá trị pháp lý như văn bản gốc và được lưu trữ trên hệ thống tối thiểu 03 (ba) năm để phục vụ thanh tra, kiểm tra chuyên ngành.
`;
