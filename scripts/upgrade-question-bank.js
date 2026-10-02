const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../database/local_store.json');
const curPath = path.join(__dirname, '../database/curriculum-data.json');

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(curPath, 'utf8'));

const lessonMap = new Map();
curriculum.lessons.forEach(l => lessonMap.set(l.id, l));

function getSubjectKnowledge(lesson, reqText) {
  const combined = `${lesson.title} ${reqText}`.toLowerCase();
  const grade = lesson.grade;

  // 1. Đo lường (KHTN 6)
  if (combined.includes('chiều dài') || combined.includes('thước')) {
    return {
      mcq: {
        text: 'Giới hạn đo (GHĐ) của một cây thước kẻ là gì?',
        options: [
          { key: 'A', text: 'Khoảng cách giữa hai vạch chia liên tiếp trên thước.' },
          { key: 'B', text: 'Độ dài lớn nhất ghi trên thước.' },
          { key: 'C', text: 'Độ dài nhỏ nhất mà thước có thể đo được.' },
          { key: 'D', text: 'Chiều dày của thân thước.' }
        ],
        ans: 'B',
        exp: 'Giới hạn đo (GHĐ) của thước là độ dài lớn nhất ghi trên thước.'
      },
      tf: {
        text: 'Trong giờ thực hành, nhóm học sinh dùng các loại thước để đo kích thước các vật. Xét tính Đúng hoặc Sai:',
        options: [
          { key: 'a', text: 'Để đo đường kính trong của miệng cốc thủy tinh, nên dùng thước kẹp.', isCorrect: true },
          { key: 'b', text: 'Khi đo chiều dài bàn học, nên dùng thước kẻ 20 cm để đo nhiều lần thay vì dùng thước cuộn.', isCorrect: false },
          { key: 'c', text: 'Cần ước lượng chiều dài trước khi đo để chọn thước có GHĐ và ĐCNN thích hợp.', isCorrect: true },
          { key: 'd', text: 'Khi đặt thước đo cần đặt thước xiên một góc 45 độ so với chiều dài cần đo.', isCorrect: false }
        ],
        ans: JSON.stringify({ a: true, b: false, c: true, d: false }),
        exp: 'Ý a, c đúng quy tắc đo. Ý b sai vì đo nhiều lần gây sai số lớn. Ý d sai vì phải đặt thước dọc theo chiều dài cần đo.'
      },
      sa: {
        text: 'Đơn vị chuẩn đo độ dài trong hệ đo lường quốc tế (SI) là gì? (Ghi tên đầy đủ hoặc kí hiệu)',
        ans: 'mét (m)',
        exp: 'Đơn vị đo độ dài hợp pháp của nước ta là mét (m).'
      },
      essay: {
        text: '1. Nêu các bước cơ bản khi tiến hành đo chiều dài một vật bằng thước kẻ.\n2. Vì sao cần phải ước lượng chiều dài của vật trước khi chọn dụng cụ đo?',
        ans: '1. Ước lượng chiều dài, chọn thước có GHĐ và ĐCNN phù hợp, đặt thước dọc theo chiều dài cần đo, đặt mắt nhìn vuông góc với vạch chia, đọc và ghi kết quả (0.5đ).\n2. Ước lượng giúp chọn thước có GHĐ lớn hơn độ dài cần đo và ĐCNN thích hợp để giảm thiểu sai số đo (0.5đ).',
        exp: 'Học sinh trình bày đúng quy trình 5 bước đo độ dài và giải thích vai trò của việc ước lượng.'
      }
    };
  }

  if (combined.includes('khối lượng') || combined.includes('cân')) {
    return {
      mcq: {
        text: 'Đơn vị đo khối lượng hợp pháp trong hệ thống đo lường của nước ta (SI) là',
        options: [
          { key: 'A', text: 'gam (g).' },
          { key: 'B', text: 'kilôgam (kg).' },
          { key: 'C', text: 'tấn (t).' },
          { key: 'D', text: 'tạ.' }
        ],
        ans: 'B',
        exp: 'Trong hệ đo lường quốc tế SI, kilôgam (kg) là đơn vị đo khối lượng chính thức.'
      },
      tf: {
        text: 'Một học sinh sử dụng cân điện tử trong phòng thực hành KHTN để cân khối lượng các hóa chất. Xét tính Đúng hoặc Sai:',
        options: [
          { key: 'a', text: 'Cần hiệu chỉnh cân về chỉ số 0 trước khi đặt vật cần cân lên đĩa cân.', isCorrect: true },
          { key: 'b', text: 'Khối lượng của vật không phụ thuộc vào vị trí đặt vật trên Trái Đất.', isCorrect: true },
          { key: 'c', text: 'Có thể đặt trực tiếp vật ẩm ướt hoặc hóa chất ăn mòn lên mặt đĩa cân mà không cần khay đựng.', isCorrect: false },
          { key: 'd', text: 'Đơn vị đo khối lượng càng nhỏ thì độ chính xác của phép đo càng giảm.', isCorrect: false }
        ],
        ans: JSON.stringify({ a: true, b: true, c: false, d: false }),
        exp: 'Ý a, b đúng. Ý c sai vì làm hỏng cân. Ý d sai vì ĐCNN càng nhỏ thì phép đo càng chính xác.'
      },
      sa: {
        text: 'Một vật có khối lượng 650 g. Hãy đổi khối lượng này sang đơn vị kilôgam (kg):',
        ans: '0,65 kg (hoặc 0.65)',
        exp: '1 kg = 1000 g nên 650 g = 0,65 kg.'
      },
      essay: {
        text: '1. Nêu sự khác nhau cơ bản giữa khối lượng và trọng lượng của một vật thể.\n2. Một túi đường có khối lượng ghi trên bao bì là 1 kg. Trọng lượng của túi đường này trên mặt đất xấp xỉ bằng bao nhiêu Newton?',
        ans: '1. Khối lượng chỉ lượng chất chứa trong vật (đơn vị kg), không đổi theo vị trí. Trọng lượng là độ lớn của lực hút Trái Đất tác dụng lên vật (đơn vị N), phụ thuộc vị trí (0.6đ).\n2. Trọng lượng P = 10 . m = 10 . 1 = 10 N (0.4đ).',
        exp: 'Phân biệt rõ khối lượng và trọng lượng; tính đúng P = 10 N.'
      }
    };
  }

  if (combined.includes('nhiệt độ') || combined.includes('nhiệt kế')) {
    return {
      mcq: {
        text: 'Nhiệt kế y tế hoạt động dựa trên hiện tượng vật lí nào sau đây?',
        options: [
          { key: 'A', text: 'Sự co dãn vì nhiệt của chất lỏng.' },
          { key: 'B', text: 'Sự bay hơi của chất lỏng.' },
          { key: 'C', text: 'Sự nóng chảy của chất rắn.' },
          { key: 'D', text: 'Sự ngưng tụ của chất khí.' }
        ],
        ans: 'A',
        exp: 'Nhiệt kế chất lỏng hoạt động dựa trên hiện tượng dãn nở vì nhiệt của chất lỏng.'
      },
      tf: {
        text: 'Học sinh dùng nhiệt kế để theo dõi nhiệt độ trong một thí nghiệm đun nóng nước đá. Xét tính Đúng hoặc Sai:',
        options: [
          { key: 'a', text: 'Nhiệt độ của nước đá đang tan trong điều kiện tiêu chuẩn là 0°C.', isCorrect: true },
          { key: 'b', text: 'Nhiệt độ của nước đang sôi ở áp suất khí quyển chuẩn là 100°C.', isCorrect: true },
          { key: 'c', text: 'Trong suốt thời gian nước sôi, nhiệt độ của nước vẫn liên tục tăng cao hơn 100°C.', isCorrect: false },
          { key: 'd', text: 'Có thể dùng nhiệt kế y tế (GHĐ 42°C) để đo nhiệt độ nước đang sôi.', isCorrect: false }
        ],
        ans: JSON.stringify({ a: true, b: true, c: false, d: false }),
        exp: 'Ý a, b đúng. Ý c sai vì khi đang sôi nhiệt độ chất lỏng giữ nguyên. Ý d sai vì làm nổ vỡ bầu nhiệt kế.'
      },
      sa: {
        text: 'Nhiệt độ cơ thể của người bình thường khỏe mạnh xấp xỉ bằng bao nhiêu độ Celsius (°C)?',
        ans: '37°C (hoặc 37)',
        exp: 'Thân nhiệt người bình thường ở trạng thái ổn định khoảng 36,5°C - 37°C.'
      },
      essay: {
        text: '1. Nêu cấu tạo và nguyên tắc hoạt động của nhiệt kế thủy ngân.\n2. Vì sao nhiệt kế y tế thủy ngân lại có đoạn ống quản bị thắt lại ở gần bầu đựng thủy ngân?',
        ans: '1. Gồm bầu đựng chất lỏng, ống quản và thang chia độ. Hoạt động dựa trên sự nở vì nhiệt của chất lỏng (0.5đ).\n2. Đoạn thắt ngăn không cho thủy ngân tự động tụt xuống bầu khi đưa nhiệt kế ra khỏi cơ thể, giúp người đọc quan sát chính xác kết quả đo (0.5đ).',
        exp: 'Trình bày đúng cấu tạo, nguyên tắc và vai trò của chỗ thắt ở nhiệt kế y tế.'
      }
    };
  }

  // 2. Kính lúp & Kính hiển vi, Tế bào (KHTN 6)
  if (combined.includes('kính lúp') || combined.includes('kính hiển vi') || combined.includes('tế bào') || combined.includes('lục lạp')) {
    return {
      mcq: {
        text: 'Thành phần nào sau đây có ở tế bào thực vật nhưng KHÔNG có ở tế bào động vật?',
        options: [
          { key: 'A', text: 'Màng tế bào và chất tế bào.' },
          { key: 'B', text: 'Nhân tế bào.' },
          { key: 'C', text: 'Thành tế bào và lục lạp.' },
          { key: 'D', text: 'Ti thể.' }
        ],
        ans: 'C',
        exp: 'Tế bào thực vật có thành tế bào bằng cellulose và lục lạp chứa diệp lục, tế bào động vật không có hai thành phần này.'
      },
      tf: {
        text: 'Trong giờ thực hành, học sinh làm tiêu bản tế bào biểu bì vảy hành và tế bào niêm mạc khoang miệng để soi dưới kính hiển vi quang học. Xét tính Đúng hoặc Sai:',
        options: [
          { key: 'a', text: 'Tế bào vảy hành thuộc tế bào thực vật, tế bào niêm mạc miệng thuộc tế bào động vật.', isCorrect: true },
          { key: 'b', text: 'Cả hai loại tế bào đều có màng sinh chất, tế bào chất và nhân tế bào.', isCorrect: true },
          { key: 'c', text: 'Tế bào niêm mạc miệng có hình dạng cố định nhờ có thành tế bào bao bọc bên ngoài.', isCorrect: false },
          { key: 'd', text: 'Chỉ cần dùng kính lúp cầm tay có độ phóng đại 10 lần là quan sát rõ cấu trúc nhân của tế bào.', isCorrect: false }
        ],
        ans: JSON.stringify({ a: true, b: true, c: false, d: false }),
        exp: 'Ý a, b đúng. Ý c sai vì tế bào động vật không có thành tế bào. Ý d sai vì tế bào có kích thước hiển vi cần kính hiển vi (100x - 400x).'
      },
      sa: {
        text: 'Tên gọi của bào quan chứa chất diệp lục có chức năng quang hợp ở tế bào thực vật là gì?',
        ans: 'Lục lạp',
        exp: 'Lục lạp là bào quan quang hợp đặc trưng ở thực vật.'
      },
      essay: {
        text: '1. Trình bày cấu tạo gồm 3 thành phần chính của một tế bào nhân thực.\n2. Nêu vai trò của nhân tế bào đối với sự sống và hoạt động của tế bào.',
        ans: '1. Ba thành phần chính: Màng sinh chất (bảo vệ, kiểm soát trao đổi chất), Tế bào chất (chứa bào quan, nơi diễn ra chuyển hóa), Nhân tế bào (chứa vật chất di truyền) (0.6đ).\n2. Nhân là trung tâm điều khiển mọi hoạt động sống và lưu trữ thông tin di truyền của tế bào (0.4đ).',
        exp: 'Trình bày đủ 3 thành phần chính và nêu rõ chức năng điều khiển của nhân tế bào.'
      }
    };
  }

  // 3. Chất, Thể, Oxygen và Không khí (KHTN 6)
  if (combined.includes('chất') || combined.includes('oxygen') || combined.includes('không khí') || combined.includes('chuyển thể')) {
    return {
      mcq: {
        text: 'Chất khí nào chiếm tỉ lệ thể tích lớn nhất trong thành phần không khí khô (khoảng 78%)?',
        options: [
          { key: 'A', text: 'Khí oxygen.' },
          { key: 'B', text: 'Khí nitrogen.' },
          { key: 'C', text: 'Khí carbon dioxide.' },
          { key: 'D', text: 'Khí hydrogen.' }
        ],
        ans: 'B',
        exp: 'Không khí khô gồm khoảng 78% nitrogen, 21% oxygen và 1% các khí khác.'
      },
      tf: {
        text: 'Khảo sát các tính chất và vai trò của oxygen và các thể của chất trong tự nhiên. Xét tính Đúng hoặc Sai:',
        options: [
          { key: 'a', text: 'Oxygen là chất khí không màu, không mùi, nặng hơn không khí và ít tan trong nước.', isCorrect: true },
          { key: 'b', text: 'Khí oxygen cần thiết cho quá trình hô hấp của con người và duy trì sự cháy.', isCorrect: true },
          { key: 'c', text: 'Quá trình nước đá chuyển thành nước lỏng ở nhiệt độ trên 0°C gọi là sự đông đặc.', isCorrect: false },
          { key: 'd', text: 'Trong bình chữa cháy CO2, người ta dùng khí oxygen để dập tắt ngọn lửa.', isCorrect: false }
        ],
        ans: JSON.stringify({ a: true, b: true, c: false, d: false }),
        exp: 'Ý a, b đúng tính chất oxygen. Ý c sai vì đó là sự nóng chảy. Ý d sai vì oxygen duy trì sự cháy, không dùng chữa cháy.'
      },
      sa: {
        text: 'Tỉ lệ phần trăm thể tích của khí oxygen trong không khí khô xấp xỉ bằng bao nhiêu phần trăm (%)?',
        ans: '21% (hoặc 21)',
        exp: 'Oxygen chiếm khoảng 21% thể tích không khí.'
      },
      essay: {
        text: '1. Nêu vai trò quan trọng của khí oxygen đối với sự sống và sự cháy trong đời sống.\n2. Để bảo vệ bầu không khí trong lành, mỗi học sinh cần thực hiện những hành động thiết thực nào?',
        ans: '1. Oxygen cần thiết cho hô hấp của sinh vật và duy trì sự cháy của các nhiên liệu (0.5đ).\n2. Trồng nhiều cây xanh, đi bộ hoặc xe đạp, không vứt rác bừa bãi, tắt thiết bị điện khi không dùng (0.5đ).',
        exp: 'Nêu rõ vai trò của oxygen và đề xuất các giải pháp bảo vệ môi trường không khí khả thi.'
      }
    };
  }

  // 4. Nguyên tử, Bảng tuần hoàn, Tốc độ (KHTN 7)
  if (grade === 7) {
    if (combined.includes('nguyên tử') || combined.includes('electron') || combined.includes('proton') || combined.includes('bảng tuần hoàn')) {
      return {
        mcq: {
          text: 'Trong nguyên tử, loại hạt nào sau đây mang điện tích âm và quay xung quanh hạt nhân?',
          options: [
            { key: 'A', text: 'Proton.' },
            { key: 'B', text: 'Neutron.' },
            { key: 'C', text: 'Electron.' },
            { key: 'D', text: 'Hạt nhân.' }
          ],
          ans: 'C',
          exp: 'Electron mang điện tích âm (-), chuyển động xung quanh hạt nhân.'
        },
        tf: {
          text: 'Khảo sát mô hình cấu tạo nguyên tử của nguyên tố Carbon (có 6 proton). Xét tính Đúng hoặc Sai:',
          options: [
            { key: 'a', text: 'Nguyên tử carbon trung hòa về điện nên có số electron ở vỏ bằng 6.', isCorrect: true },
            { key: 'b', text: 'Hạt nhân nguyên tử carbon gồm các hạt proton và neutron.', isCorrect: true },
            { key: 'c', text: 'Khối lượng của nguyên tử tập trung chủ yếu ở các electron lớp vỏ.', isCorrect: false },
            { key: 'd', text: 'Hạt neutron mang điện tích dương bằng điện tích của hạt proton.', isCorrect: false }
          ],
          ans: JSON.stringify({ a: true, b: true, c: false, d: false }),
          exp: 'Ý a, b đúng. Ý c sai vì khối lượng tập trung ở hạt nhân (khối lượng e rất nhỏ). Ý d sai vì neutron không mang điện.'
        },
        sa: {
          text: 'Nguyên tử nguyên tố Sodium (Na) có 11 proton trong hạt nhân. Số hạt electron của nguyên tử này là bao nhiêu?',
          ans: '11',
          exp: 'Trong nguyên tử trung hòa về điện, số electron bằng số proton (số e = 11).'
        },
        essay: {
          text: '1. Mô tả cấu tạo của nguyên tử theo mô hình Rutherford - Bohr.\n2. Vì sao khối lượng của nguyên tử được coi xấp xỉ bằng khối lượng của hạt nhân?',
          ans: '1. Gồm hạt nhân ở tâm (chứa proton và neutron) và vỏ nguyên tử chứa các electron chuyển động quanh hạt nhân (0.5đ).\n2. Khối lượng electron rất nhỏ bé (khoảng 1/1836 khối lượng proton) nên khối lượng nguyên tử tập trung hầu hết ở hạt nhân (0.5đ).',
          exp: 'Mô tả đúng cấu tạo 2 phần của nguyên tử và giải thích được khối lượng tập trung ở hạt nhân.'
        }
      };
    }

    if (combined.includes('tốc độ') || combined.includes('quãng đường') || combined.includes('thời gian')) {
      return {
        mcq: {
          text: 'Công thức tính tốc độ chuyển động của một vật theo quãng đường s và thời gian t là',
          options: [
            { key: 'A', text: 'v = s . t' },
            { key: 'B', text: 'v = s / t' },
            { key: 'C', text: 'v = t / s' },
            { key: 'D', text: 'v = s + t' }
          ],
          ans: 'B',
          exp: 'Tốc độ v = s / t.'
        },
        tf: {
          text: 'Một xe máy chuyển động đều trên quãng đường thẳng dài 30 km hết thời gian 45 phút (0,75 giờ). Xét tính Đúng hoặc Sai:',
          options: [
            { key: 'a', text: 'Tốc độ của xe máy trên đoạn đường đó là 40 km/h.', isCorrect: true },
            { key: 'b', text: 'Nếu xe giữ nguyên tốc độ đó thì sau 1,5 giờ xe sẽ đi được 60 km.', isCorrect: true },
            { key: 'c', text: 'Đơn vị đo tốc độ hợp pháp trong hệ đo lường quốc tế (SI) là km/h.', isCorrect: false },
            { key: 'd', text: 'Thiết bị bắn tốc độ của cảnh sát giao thông dùng để đo quãng đường đi của xe.', isCorrect: false }
          ],
          ans: JSON.stringify({ a: true, b: true, c: false, d: false }),
          exp: 'Ý a, b đúng (v = 30 / 0.75 = 40 km/h; s = 40 . 1.5 = 60 km). Ý c sai vì đơn vị SI là m/s. Ý d sai vì súng bắn tốc độ đo tốc độ tức thời.'
        },
        sa: {
          text: 'Một người đi bộ với tốc độ 4 km/h trên đoạn đường dài 6 km. Thời gian đi hết quãng đường là bao nhiêu giờ?',
          ans: '1,5 giờ (hoặc 1.5)',
          exp: 'Thời gian t = s / v = 6 / 4 = 1,5 giờ.'
        },
        essay: {
          text: '1. Nêu ý nghĩa của tốc độ chuyển động trong đời sống và giao thông.\n2. Vì sao người tham gia giao thông cần phải tuân thủ nghiêm ngặt quy định về tốc độ tối đa cho phép trên từng đoạn đường?',
          ans: '1. Tốc độ cho biết mức độ chuyển động nhanh hay chậm của vật trên quãng đường trong một đơn vị thời gian (0.4đ).\n2. Giúp người lái xe làm chủ tay lái, xử lý kịp thời các tình huống bất ngờ và giảm thiểu nguy cơ tai nạn giao thông nghiêm trọng (0.6đ).',
          exp: 'Trình bày đúng ý nghĩa tốc độ và liên hệ an toàn giao thông đường bộ.'
        }
      };
    }
  }

  // 5. KHTN 8 (Phản ứng hóa học, ĐL bảo toàn khối lượng, Acid, Base, Áp suất)
  if (grade === 8) {
    if (combined.includes('phản ứng') || combined.includes('khối lượng') || combined.includes('acid') || combined.includes('base') || combined.includes('ph')) {
      return {
        mcq: {
          text: 'Dung dịch có giá trị pH nào sau đây làm đổi màu giấy quỳ tím sang màu đỏ?',
          options: [
            { key: 'A', text: 'pH = 7 (nước cất).' },
            { key: 'B', text: 'pH = 3 (dung dịch acid).' },
            { key: 'C', text: 'pH = 9 (dung dịch base).' },
            { key: 'D', text: 'pH = 12 (nước vôi trong).' }
          ],
          ans: 'B',
          exp: 'Dung dịch acid có pH < 7 làm quỳ tím hóa đỏ.'
        },
        tf: {
          text: 'Cho viên kẽm (Zn) phản ứng hoàn toàn với dung dịch acid hydrochloric (HCl) trong cốc hở. Xét tính Đúng hoặc Sai:',
          options: [
            { key: 'a', text: 'Hiện tượng quan sát được là có bọt khí không màu thoát ra và kẽm tan dần.', isCorrect: true },
            { key: 'b', text: 'Phản ứng sinh ra muối zinc chloride (ZnCl2) và khí hydrogen (H2).', isCorrect: true },
            { key: 'c', text: 'Tổng khối lượng chất lỏng trong cốc hở sau phản ứng lớn hơn khối lượng ban đầu.', isCorrect: false },
            { key: 'd', text: 'Nếu đun nóng cốc thì tốc độ phản ứng thoát khí sẽ bị chậm lại.', isCorrect: false }
          ],
          ans: JSON.stringify({ a: true, b: true, c: false, d: false }),
          exp: 'Ý a, b đúng (Zn + 2HCl -> ZnCl2 + H2↑). Ý c sai vì khí H2 bay đi làm khối lượng giảm. Ý d sai vì tăng nhiệt độ làm tăng tốc độ phản ứng.'
        },
        sa: {
          text: 'Nung 50 gam đá vôi (CaCO3) thu được 28 gam vôi sống (CaO) và khí CO2. Khối lượng khí CO2 tạo thành là bao nhiêu gam?',
          ans: '22 g (hoặc 22)',
          exp: 'Theo ĐL bảo toàn khối lượng: m(CO2) = m(CaCO3) - m(CaO) = 50 - 28 = 22 g.'
        },
        essay: {
          text: '1. Phát biểu định luật bảo toàn khối lượng trong phản ứng hoá học.\n2. Giải thích vì sao khi đốt cháy một thanh củi, khối lượng tro than còn lại lại nhỏ hơn khối lượng thanh củi ban đầu?',
          ans: '1. Trong một phản ứng hoá học, tổng khối lượng của các chất sản phẩm bằng tổng khối lượng của các chất tham gia phản ứng (0.5đ).\n2. Khi củi cháy, một phần lớn khối lượng đã biến thành khí carbon dioxide (CO2) và hơi nước (H2O) bay vào không khí, chỉ còn lại lượng tro không cháy (0.5đ).',
          exp: 'Phát biểu chính xác định luật và giải thích thỏa đáng sự hao hụt khối lượng khi cháy trong hệ hở.'
        }
      };
    }
  }

  // 6. KHTN 9 (Kim loại, Cơ năng, Khúc xạ, Di truyền)
  if (grade === 9) {
    if (combined.includes('kim loại') || combined.includes('dãy hoạt động')) {
      return {
        mcq: {
          text: 'Kim loại nào sau đây có tính dẫn điện và dẫn nhiệt tốt nhất trong tất cả các kim loại?',
          options: [
            { key: 'A', text: 'Đồng (Cu).' },
            { key: 'B', text: 'Nhôm (Al).' },
            { key: 'C', text: 'Bạc (Ag).' },
            { key: 'D', text: 'Sắt (Fe).' }
          ],
          ans: 'C',
          exp: 'Bạc (Ag) dẫn điện, dẫn nhiệt tốt nhất, tiếp theo là đồng (Cu), vàng (Au), nhôm (Al).'
        },
        tf: {
          text: 'Thả một đinh sắt (Fe) sạch vào ống nghiệm chứa dung dịch copper(II) sulfate (CuSO4) màu xanh lam. Xét tính Đúng hoặc Sai:',
          options: [
            { key: 'a', text: 'Sắt hoạt động hóa học mạnh hơn đồng nên đẩy được đồng ra khỏi dung dịch muối.', isCorrect: true },
            { key: 'b', text: 'Có lớp kim loại màu đỏ (đồng) bám ngoài bề mặt đinh sắt.', isCorrect: true },
            { key: 'c', text: 'Màu xanh lam của dung dịch đậm dần sau phản ứng.', isCorrect: false },
            { key: 'd', text: 'Phản ứng trên thuộc loại phản ứng trùng hợp tạo polymer.', isCorrect: false }
          ],
          ans: JSON.stringify({ a: true, b: true, c: false, d: false }),
          exp: 'Ý a, b đúng (Fe + CuSO4 -> FeSO4 + Cu). Ý c sai vì dung dịch nhạt màu dần thành xanh nhạt của FeSO4. Ý d sai vì đây là phản ứng thế.'
        },
        sa: {
          text: 'Kí hiệu hóa học của nguyên tố kim loại Sắt trong bảng tuần hoàn là gì?',
          ans: 'Fe',
          exp: 'Sắt có kí hiệu hóa học là Fe.'
        },
        essay: {
          text: '1. Nêu 4 tính chất vật lí chung của kim loại và ứng dụng tương ứng của từng tính chất trong đời sống.\n2. Vì sao người ta thường dùng nhôm và đồng để làm lõi dây dẫn điện thay vì dùng bạc?',
          ans: '1. Tính dẻo (rèn, dát mỏng), dẫn điện (làm dây dẫn), dẫn nhiệt (nồi xoong), ánh kim (đồ trang sức) (0.6đ).\n2. Bạc tuy dẫn điện tốt hơn nhưng có giá thành rất đắt và khan hiếm, nhôm và đồng có độ dẫn điện tốt, giá thành rẻ hơn nhiều và trữ lượng dồi dào (0.4đ).',
          exp: 'Trình bày đủ 4 tính chất vật lí chung và giải thích tính kinh tế kỹ thuật của việc dùng đồng/nhôm.'
        }
      };
    }
  }

  // Generic Curriculum Grounded Fallback
  return {
    mcq: {
      text: `Nội dung nào sau đây phản ánh đúng yêu cầu cần đạt của bài học "${lesson.title}"?`,
      options: [
        { key: 'A', text: reqText },
        { key: 'B', text: 'Quá trình diễn ra tự phát và không tuân theo các quy luật tự nhiên.' },
        { key: 'C', text: 'Hiện tượng chỉ quan sát được trong điều kiện nhân tạo lý tưởng.' },
        { key: 'D', text: 'Mọi vật thể tham gia đều giữ nguyên tuyệt đối cấu trúc ban đầu.' }
      ],
      ans: 'A',
      exp: `Phương án A là nội dung chuẩn xác theo SGK KHTN ${grade} bài ${lesson.title}.`
    },
    tf: {
      text: `Dựa trên kiến thức bài học "${lesson.title}" (${reqText}), xét tính Đúng hoặc Sai:`,
      options: [
        { key: 'a', text: `Nội dung cốt lõi của bài học phù hợp với quan sát thực nghiệm: ${reqText.slice(0, 90)}.`, isCorrect: true },
        { key: 'b', text: `Quá trình diễn ra độc lập mà không chịu tác động của điều kiện môi trường.`, isCorrect: false },
        { key: 'c', text: `Kiến thức này được ứng dụng vào giải thích hiện tượng tự nhiên và đời sống.`, isCorrect: true },
        { key: 'd', text: `Kết luận của bài học chỉ đúng trong phòng thí nghiệm mà không có ý nghĩa thực tế.`, isCorrect: false }
      ],
      ans: JSON.stringify({ a: true, b: false, c: true, d: false }),
      exp: 'Ý a, c đúng chuẩn kiến thức SGK. Ý b, d sai.'
    },
    sa: {
      text: `Một vật chuyển động đều trên quãng đường 20 km trong thời gian 1 giờ. Tốc độ chuyển động của vật là bao nhiêu km/h?`,
      ans: '20 km/h (hoặc 20)',
      exp: 'Áp dụng công thức v = s / t = 20 / 1 = 20 km/h.'
    },
    essay: {
      text: `Vận dụng kiến thức bài học "${lesson.title}":\n1. Trình bày nội dung khoa học cốt lõi: "${reqText}".\n2. Nêu một ví dụ thực tế minh họa và đề xuất biện pháp ứng dụng hoặc an toàn.`,
      ans: '1. Nêu đúng định nghĩa, bản chất khoa học theo SGK (0.5đ).\n2. Nêu đúng ví dụ thực tế và đề xuất giải pháp ứng dụng hợp lí (0.5đ).',
      exp: 'Trình bày đủ kiến thức và liên hệ thực tế.'
    }
  };
}

console.log('Upgrading questionBank in local_store.json...');

let upgradedBankCount = 0;
store.questionBank = (store.questionBank || []).map((q, idx) => {
  const lesson = lessonMap.get(q.lessonId) || { grade: q.grade, title: q.topic || 'Khoa học tự nhiên' };
  const reqText = q.learningRequirementText || q.topic || '';
  const kn = getSubjectKnowledge(lesson, reqText);

  if (q.questionType === 'MCQ') {
    q.questionText = kn.mcq.text;
    q.options = kn.mcq.options;
    q.correctAnswer = kn.mcq.ans;
    q.explanation = kn.mcq.exp;
    // Strip rigid table from context
    if (q.contextMetadata && q.contextMetadata.stimulus) {
      q.contextMetadata.stimulus.type = 'TEXT';
      delete q.contextMetadata.stimulus.dataHeaders;
      delete q.contextMetadata.stimulus.dataRows;
    }
    upgradedBankCount++;
  } else if (q.questionType === 'TRUE_FALSE') {
    q.questionText = kn.tf.text;
    q.options = kn.tf.options;
    q.correctAnswer = kn.tf.ans;
    q.explanation = kn.tf.exp;
    upgradedBankCount++;
  } else if (q.questionType === 'SHORT_ANSWER') {
    q.questionText = kn.sa.text;
    q.correctAnswer = kn.sa.ans;
    q.explanation = kn.sa.exp;
    upgradedBankCount++;
  } else if (q.questionType === 'ESSAY') {
    q.questionText = kn.essay.text;
    q.correctAnswer = kn.essay.ans;
    q.explanation = kn.essay.exp;
    upgradedBankCount++;
  }

  // Remove mismatched solar panel context from Grade 6/7/8 or lab intro
  if (JSON.stringify(q.contextMetadata || {}).includes('giàn pin mặt trời') && q.grade !== 9) {
    q.contextMetadata = undefined;
  }

  return q;
});

console.log(`Upgraded ${upgradedBankCount} questions in questionBank.`);

// Now upgrade all 10 tests in store.tests
console.log('Upgrading tests with sequential numbering and authentic questions...');

store.tests = (store.tests || []).map(test => {
  // Determine term
  const grade = test.grade || 6;
  const termLabel = test.semester === 'HK2' ? 'GIỮA HK2' : 'GIỮA HK1';
  test.title = `ĐỀ KIỂM TRA ${termLabel} - KHOA HỌC TỰ NHIÊN ${grade}`;

  const mcqQuestions = [];
  const tfQuestions = [];
  const saQuestions = [];
  const esQuestions = [];

  // Flatten and upgrade questions
  (test.parts || []).forEach(part => {
    (part.questions || []).forEach(tq => {
      const q = tq.question;
      const lesson = lessonMap.get(q.lessonId) || { grade: test.grade, title: q.topic || 'Khoa học tự nhiên' };
      const reqText = q.learningRequirementText || q.topic || '';
      const kn = getSubjectKnowledge(lesson, reqText);

      if (q.questionType === 'MCQ') {
        q.questionText = kn.mcq.text;
        q.options = kn.mcq.options;
        q.correctAnswer = kn.mcq.ans;
        q.explanation = kn.mcq.exp;
        if (q.contextMetadata && q.contextMetadata.stimulus) {
          q.contextMetadata.stimulus.type = 'TEXT';
          delete q.contextMetadata.stimulus.dataHeaders;
          delete q.contextMetadata.stimulus.dataRows;
        }
        mcqQuestions.push(tq);
      } else if (q.questionType === 'TRUE_FALSE') {
        q.questionText = kn.tf.text;
        q.options = kn.tf.options;
        q.correctAnswer = kn.tf.ans;
        q.explanation = kn.tf.exp;
        tfQuestions.push(tq);
      } else if (q.questionType === 'SHORT_ANSWER') {
        q.questionText = kn.sa.text;
        q.correctAnswer = kn.sa.ans;
        q.explanation = kn.sa.exp;
        saQuestions.push(tq);
      } else {
        q.questionText = kn.essay.text;
        q.correctAnswer = kn.essay.ans;
        q.explanation = kn.essay.exp;
        esQuestions.push(tq);
      }

      // Remove mismatched solar panel context
      if (JSON.stringify(q.contextMetadata || {}).includes('giàn pin mặt trời') && test.grade !== 9) {
        q.contextMetadata = undefined;
      }
    });
  });

  // Strictly sequential continuous numbering 1..N
  let runningOrder = 1;
  mcqQuestions.forEach((tq, idx) => {
    tq.orderInPart = idx + 1;
    tq.globalOrderIndex = runningOrder++;
  });
  tfQuestions.forEach((tq, idx) => {
    tq.orderInPart = idx + 1;
    tq.globalOrderIndex = runningOrder++;
  });
  saQuestions.forEach((tq, idx) => {
    tq.orderInPart = idx + 1;
    tq.globalOrderIndex = runningOrder++;
  });
  esQuestions.forEach((tq, idx) => {
    tq.orderInPart = idx + 1;
    tq.globalOrderIndex = runningOrder++;
  });

  const mcqEnd = mcqQuestions.length;
  const tfStart = mcqEnd + 1;
  const tfEnd = tfStart + tfQuestions.length - 1;
  const saStart = tfEnd + 1;
  const saEnd = saStart + saQuestions.length - 1;
  const esStart = saEnd + 1;
  const esEnd = esStart + esQuestions.length - 1;

  test.parts = [
    {
      partNumber: 1,
      partName: 'PHẦN I. Câu trắc nghiệm nhiều lựa chọn',
      questionType: 'MCQ',
      instructions: `Thí sinh trả lời từ câu 1 đến câu ${mcqEnd}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`,
      totalScore: Math.round(mcqQuestions.reduce((s, q) => s + q.assignedScore, 0) * 100) / 100,
      questions: mcqQuestions
    },
    {
      partNumber: 2,
      partName: 'PHẦN II. Câu trắc nghiệm Đúng/Sai',
      questionType: 'TRUE_FALSE',
      instructions: `Thí sinh trả lời từ câu ${tfStart} đến câu ${tfEnd}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.`,
      totalScore: Math.round(tfQuestions.reduce((s, q) => s + q.assignedScore, 0) * 100) / 100,
      questions: tfQuestions
    },
    {
      partNumber: 3,
      partName: 'PHẦN III. Câu trắc nghiệm trả lời ngắn',
      questionType: 'SHORT_ANSWER',
      instructions: `Thí sinh trả lời từ câu ${saStart} đến câu ${saEnd}. Điền câu trả lời ngắn gọn (thuật ngữ, tên chất hoặc kết quả tính toán). Mỗi câu trả lời đúng được 0.5 điểm.`,
      totalScore: Math.round(saQuestions.reduce((s, q) => s + q.assignedScore, 0) * 100) / 100,
      questions: saQuestions
    },
    {
      partNumber: 4,
      partName: 'PHẦN IV. Tự luận',
      questionType: 'ESSAY',
      instructions: `Thí sinh trả lời từ câu ${esStart} đến câu ${esEnd}. Trình bày chi tiết lời giải, bài tập hoặc lập luận khoa học vào giấy làm bài.`,
      totalScore: Math.round(esQuestions.reduce((s, q) => s + q.assignedScore, 0) * 100) / 100,
      questions: esQuestions
    }
  ].filter(p => p.questions.length > 0);

  // Re-sync Answer Keys
  test.answerKeys = [];
  test.scoringGuide = {
    id: `guide-${test.id}`,
    testId: test.id,
    totalScore: 10.0,
    rubrics: [],
    instructions: [
      'Học sinh làm đúng đến bước nào cho điểm bước đó.',
      'Đối với câu trắc nghiệm nhiều lựa chọn: mỗi câu đúng 0.25đ.',
      'Đối với câu Đúng/Sai: mỗi ý đúng 0.25đ.',
      'Đối với câu trả lời ngắn: điền đúng đáp số hoặc thuật ngữ được 0.5đ.',
      'Đối với câu tự luận: chấm theo biểu điểm chi tiết (Rubric).'
    ]
  };

  test.parts.forEach(part => {
    part.questions.forEach(tq => {
      test.answerKeys.push({
        questionNumber: tq.globalOrderIndex,
        partNumber: part.partNumber,
        questionType: tq.question.questionType,
        correctAnswer: tq.question.correctAnswer || '',
        score: tq.assignedScore,
        explanation: tq.question.explanation || ''
      });

      if (tq.question.questionType === 'ESSAY') {
        test.scoringGuide.rubrics.push({
          questionNumber: tq.globalOrderIndex,
          partNumber: part.partNumber,
          criterion: tq.question.correctAnswer || tq.question.explanation || 'Hướng dẫn chấm tự luận',
          score: tq.assignedScore
        });
      }
    });
  });

  return test;
});

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Successfully updated local_store.json!');
