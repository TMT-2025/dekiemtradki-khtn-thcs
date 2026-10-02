import { CognitiveLevel, QuestionType, Lesson } from '@/types/curriculum';
import { QuestionOption } from '@/types/question';

export interface SynthesizedQuestionResult {
  question_text: string;
  options?: QuestionOption[];
  correct_answer: string;
  explanation: string;
  rationale: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  contextSnippet?: string;
}

export class CurriculumSynthesizer {
  /**
   * Synthesizes authentic, pedagogically robust questions tailored to the exact curriculum lesson
   */
  public static synthesize(
    lesson: Lesson | any,
    reqText: string,
    cognitiveLevel: CognitiveLevel,
    questionType: QuestionType,
    score: number
  ): SynthesizedQuestionResult {
    const title = lesson.title || 'Khoa học tự nhiên';
    const grade = lesson.grade || 6;
    const lowTitle = title.toLowerCase();
    const lowReq = reqText.toLowerCase();
    const combined = `${lowTitle} ${lowReq}`;

    if (questionType === 'MCQ') {
      return this.synthesizeMCQ(lesson, reqText, cognitiveLevel, combined);
    }

    if (questionType === 'TRUE_FALSE') {
      return this.synthesizeTrueFalse(lesson, reqText, cognitiveLevel, combined);
    }

    if (questionType === 'SHORT_ANSWER') {
      return this.synthesizeShortAnswer(lesson, reqText, cognitiveLevel, combined);
    }

    // Default: ESSAY
    return this.synthesizeEssay(lesson, reqText, cognitiveLevel, score, combined);
  }

  // ==========================================
  // 1. PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN (MCQ)
  // ==========================================
  private static synthesizeMCQ(
    lesson: any,
    reqText: string,
    level: CognitiveLevel,
    combined: string
  ): SynthesizedQuestionResult {
    const isM1 = level === 'M1';

    // Topic 1: Đo lường (chiều dài, khối lượng, thời gian, nhiệt độ)
    if (combined.includes('đo') || combined.includes('thước') || combined.includes('cân') || combined.includes('nhiệt kế') || combined.includes('thời gian')) {
      if (combined.includes('khối lượng') || combined.includes('cân')) {
        return {
          question_text: isM1
            ? 'Đơn vị đo khối lượng hợp pháp trong hệ thống đo lường của nước ta (SI) là gì?'
            : 'Để đo khối lượng của một quả táo với độ chính xác cao trong phòng thí nghiệm, ta nên lựa chọn dụng cụ nào sau đây?',
          options: isM1
            ? [
                { key: 'A', text: 'Gam (g).' },
                { key: 'B', text: 'Kilôgam (kg).' },
                { key: 'C', text: 'Tạ.' },
                { key: 'D', text: 'Tấn.' }
              ]
            : [
                { key: 'A', text: 'Cân đồng hồ có giới hạn đo 100 kg, ĐCNN 500 g.' },
                { key: 'B', text: 'Cân điện tử có giới hạn đo 500 g, ĐCNN 0,1 g.' },
                { key: 'C', text: 'Cân tạ có giới hạn đo 200 kg.' },
                { key: 'D', text: 'Cân lò xo không có vạch chia độ.' }
              ],
          correct_answer: isM1 ? 'B' : 'B',
          explanation: isM1
            ? 'Trong hệ đo lường quốc tế (SI), kilôgam (kí hiệu kg) là đơn vị đo khối lượng chuẩn.'
            : 'Để đo khối lượng vật nhỏ như quả táo (khoảng 150-250 g), cần chọn cân điện tử có GHĐ phù hợp và ĐCNN nhỏ (0,1 g) để có kết quả chính xác.',
          rationale: `Đánh giá mức độ ${level} bài ${lesson.title} theo chuẩn GDPT 2018.`,
          difficulty: isM1 ? 'EASY' : 'MEDIUM'
        };
      }

      if (combined.includes('nhiệt độ') || combined.includes('nhiệt kế')) {
        return {
          question_text: isM1
            ? 'Nhiệt kế y tế thủy ngân hoạt động dựa trên hiện tượng vật lí nào sau đây?'
            : 'Khi sử dụng nhiệt kế thủy ngân để đo nhiệt độ cơ thể, thao tác nào sau đây là đúng quy trình an toàn?',
          options: isM1
            ? [
                { key: 'A', text: 'Sự bay hơi của chất lỏng.' },
                { key: 'B', text: 'Sự ngưng tụ của chất khí.' },
                { key: 'C', text: 'Sự co dãn vì nhiệt của chất lỏng.' },
                { key: 'D', text: 'Sự đông đặc của chất lỏng.' }
              ]
            : [
                { key: 'A', text: 'Vẩy mạnh nhiệt kế để cột thủy ngân tụt xuống dưới vạch 35°C trước khi đo.' },
                { key: 'B', text: 'Rửa nhiệt kế bằng nước sôi 100°C trước khi kẹp vào nách.' },
                { key: 'C', text: 'Cầm tay trực tiếp vào bầu thủy ngân trong suốt thời gian đọc chỉ số.' },
                { key: 'D', text: 'Đọc kết quả ngay khi nhiệt kế vừa tiếp xúc với cơ thể dưới 10 giây.' }
              ],
          correct_answer: isM1 ? 'C' : 'A',
          explanation: isM1
            ? 'Nhiệt kế chất lỏng (thủy ngân, rượu) hoạt động dựa trên sự nở vì nhiệt của chất lỏng.'
            : 'Trước khi đo nhiệt độ cơ thể, cần vẩy nhẹ để cột thủy ngân rút về dưới vạch 35°C.',
          rationale: `Đánh giá kĩ năng thực hành đo lường nhiệt độ (${level}).`,
          difficulty: isM1 ? 'EASY' : 'MEDIUM'
        };
      }

      return {
        question_text: isM1
          ? 'Giới hạn đo (GHĐ) của một cây thước kẻ là'
          : 'Để đo đường kính trong của miệng một chiếc cốc thủy tinh, người ta nên dùng dụng cụ nào dưới đây để có độ chính xác cao nhất?',
        options: isM1
          ? [
              { key: 'A', text: 'Khoảng cách giữa hai vạch chia liên tiếp trên thước.' },
              { key: 'B', text: 'Độ dài lớn nhất ghi trên thước.' },
              { key: 'C', text: 'Độ dài nhỏ nhất mà thước có thể đo được.' },
              { key: 'D', text: 'Chiều dày của thân thước.' }
            ]
          : [
              { key: 'A', text: 'Thước dây bằng vải.' },
              { key: 'B', text: 'Thước cuộn kim loại xây dựng.' },
              { key: 'C', text: 'Thước kẹp (thước cặp cơ khí).' },
              { key: 'D', text: 'Thước thẳng bằng gỗ có ĐCNN 1 cm.' }
            ],
        correct_answer: isM1 ? 'B' : 'C',
        explanation: isM1
          ? 'Giới hạn đo (GHĐ) của thước là độ dài lớn nhất ghi trên thước.'
          : 'Thước kẹp có các mỏ đo trong chuyên dụng giúp đo chính xác đường kính trong của hình trụ/cốc.',
        rationale: `Đánh giá chuẩn kĩ năng đo độ dài (${level}).`,
        difficulty: isM1 ? 'EASY' : 'MEDIUM'
      };
    }

    // Topic 2: Tế bào và Thế giới sống (KHTN 6, 7)
    if (combined.includes('tế bào') || combined.includes('lục lạp') || combined.includes('nhân') || combined.includes('quang hợp') || combined.includes('sinh vật')) {
      return {
        question_text: isM1
          ? 'Thành phần nào sau đây có ở tế bào thực vật nhưng không có ở tế bào động vật?'
          : 'Đặc điểm nào giúp phân biệt sinh vật đơn bào với sinh vật đa bào một cách chính xác nhất?',
        options: isM1
          ? [
              { key: 'A', text: 'Màng sinh chất (màng tế bào).' },
              { key: 'B', text: 'Chất tế bào (tế bào chất).' },
              { key: 'C', text: 'Lục lạp và thành tế bào cellulose.' },
              { key: 'D', text: 'Nhân tế bào chứa vật chất di truyền.' }
            ]
          : [
              { key: 'A', text: 'Sinh vật đơn bào có kích thước lớn hơn sinh vật đa bào.' },
              { key: 'B', text: 'Cơ thể sinh vật đơn bào chỉ được cấu tạo từ một tế bào duy nhất thực hiện mọi hoạt động sống.' },
              { key: 'C', text: 'Sinh vật đơn bào không có khả năng sinh sản và cảm ứng.' },
              { key: 'D', text: 'Sinh vật đa bào chỉ sống được trong môi trường nước.' }
            ],
        correct_answer: isM1 ? 'C' : 'B',
        explanation: isM1
          ? 'Tế bào thực vật có thành tế bào bằng cellulose tạo hình dạng ổn định và lục lạp chứa diệp lục để quang hợp, tế bào động vật không có hai thành phần này.'
          : 'Sinh vật đơn bào có cấu tạo cơ thể gồm một tế bào duy nhất đảm nhiệm toàn bộ chức năng sống.',
        rationale: `Đánh giá kiến thức phân biệt cấu tạo tế bào và cấp độ tổ chức sống (${level}).`,
        difficulty: isM1 ? 'EASY' : 'MEDIUM'
      };
    }

    // Topic 3: Chất, Thể của chất, Oxygen và Không khí
    if (combined.includes('chất') || combined.includes('oxygen') || combined.includes('không khí') || combined.includes('nóng chảy') || combined.includes('bay hơi')) {
      return {
        question_text: isM1
          ? 'Khí nào chiếm tỉ lệ thể tích lớn nhất trong thành phần không khí khô (khoảng 78%)?'
          : 'Khi để một cốc nước đá ở ngoài không khí một thời gian, ta thấy có các giọt nước đọng lại ở thành ngoài cốc. Hiện tượng này chứng minh điều gì?',
        options: isM1
          ? [
              { key: 'A', text: 'Khí oxygen.' },
              { key: 'B', text: 'Khí nitrogen.' },
              { key: 'C', text: 'Khí carbon dioxide.' },
              { key: 'D', text: 'Hơi nước và các khí hiếm.' }
            ]
          : [
              { key: 'A', text: 'Nước đá bên trong đã thấm qua thành thủy tinh của cốc ra ngoài.' },
              { key: 'B', text: 'Thủy tinh bị nóng chảy tạo ra các giọt nước.' },
              { key: 'C', text: 'Hơi nước có trong không khí gặp lạnh ở thành ngoài cốc đã ngưng tụ thành giọt nước.' },
              { key: 'D', text: 'Không khí xung quanh cốc bị biến đổi thành chất lỏng.' }
            ],
        correct_answer: isM1 ? 'B' : 'C',
        explanation: isM1
          ? 'Không khí khô gồm khoảng 78% nitrogen, 21% oxygen và 1% khí khác.'
          : 'Thành ngoài của cốc nước đá lạnh làm hơi nước trong không khí tiếp xúc bị hạ nhiệt độ và ngưng tụ thành nước lỏng.',
        rationale: `Đánh giá mức độ nhận thức về thành phần chất và các quá trình chuyển thể (${level}).`,
        difficulty: isM1 ? 'EASY' : 'MEDIUM'
      };
    }

    // Topic 4: Nguyên tử, Bảng tuần hoàn, Liên kết hóa học (KHTN 7)
    if (combined.includes('nguyên tử') || combined.includes('proton') || combined.includes('electron') || combined.includes('bảng tuần hoàn') || combined.includes('phân tử')) {
      return {
        question_text: isM1
          ? 'Trong cấu tạo nguyên tử, loại hạt nào sau đây mang điện tích âm và chuyển động xung quanh hạt nhân?'
          : 'Nguyên tử của nguyên tố X có 11 proton trong hạt nhân. Số hạt electron ở lớp vỏ của nguyên tử X là bao nhiêu?',
        options: isM1
          ? [
              { key: 'A', text: 'Proton.' },
              { key: 'B', text: 'Neutron.' },
              { key: 'C', text: 'Electron.' },
              { key: 'D', text: 'Hạt nhân.' }
            ]
          : [
              { key: 'A', text: '10 hạt.' },
              { key: 'B', text: '11 hạt.' },
              { key: 'C', text: '12 hạt.' },
              { key: 'D', text: '22 hạt.' }
            ],
        correct_answer: isM1 ? 'C' : 'B',
        explanation: isM1
          ? 'Electron mang điện tích âm (-), proton mang điện tích dương (+), neutron không mang điện.'
          : 'Vì nguyên tử trung hòa về điện nên số proton luôn bằng số electron (số p = số e = 11).',
        rationale: `Đánh giá cấu tạo nguyên tử theo mô hình Rutherford - Bohr (${level}).`,
        difficulty: isM1 ? 'EASY' : 'MEDIUM'
      };
    }

    // Topic 5: Tốc độ, Lực, Năng lượng, Âm thanh (Vật lí KHTN 6, 7, 8, 9)
    if (combined.includes('tốc độ') || combined.includes('lực') || combined.includes('ma sát') || combined.includes('áp suất') || combined.includes('cơ năng')) {
      return {
        question_text: isM1
          ? 'Công thức tính tốc độ chuyển động của một vật theo quãng đường s và thời gian t là'
          : 'Một người đi xe đạp chuyển động đều trên quãng đường 18 km hết 1,5 giờ. Tốc độ của người đi xe đạp là',
        options: isM1
          ? [
              { key: 'A', text: 'v = s . t' },
              { key: 'B', text: 'v = s / t' },
              { key: 'C', text: 'v = t / s' },
              { key: 'D', text: 'v = s + t' }
            ]
          : [
              { key: 'A', text: '12 km/h.' },
              { key: 'B', text: '15 km/h.' },
              { key: 'C', text: '27 km/h.' },
              { key: 'D', text: '10 km/h.' }
            ],
        correct_answer: isM1 ? 'B' : 'A',
        explanation: isM1
          ? 'Tốc độ chuyển động bằng quãng đường đi được chia cho thời gian: v = s / t.'
          : 'Áp dụng công thức v = s / t = 18 / 1.5 = 12 km/h.',
        rationale: `Đánh giá công thức và kĩ năng tính toán tốc độ chuyển động (${level}).`,
        difficulty: isM1 ? 'EASY' : 'MEDIUM'
      };
    }

    // Default Fallback: Phân hóa chuẩn xác theo YCCĐ cụ thể
    return {
      question_text: isM1
        ? `Nội dung nào sau đây phản ánh chính xác nhất yêu cầu cần đạt của bài học "${lesson.title}"?`
        : `Trong thực tiễn đời sống, hiện tượng khoa học nào sau đây là minh chứng rõ nét cho nội dung "${lesson.title}"?`,
      options: [
        { key: 'A', text: `${reqText}` },
        { key: 'B', text: `Quá trình diễn ra độc lập và không tuân theo các định luật bảo toàn tự nhiên.` },
        { key: 'C', text: `Hiện tượng chỉ mang tính ngẫu nhiên, không thể tiến hành thực nghiệm kiểm chứng.` },
        { key: 'D', text: `Mọi vật thể trong quá trình biến đổi đều không chịu tác động của môi trường ngoài.` }
      ],
      correct_answer: 'A',
      explanation: `Phương án A phản ánh trực tiếp và chuẩn xác yêu cầu cần đạt của bài học "${lesson.title}" trong chương trình GDPT 2018.`,
      rationale: `Đánh giá mức độ nhận thức ${level} bám sát YCCĐ của SGK KHTN ${lesson.grade}.`,
      difficulty: isM1 ? 'EASY' : 'MEDIUM'
    };
  }

  // ==========================================
  // 2. PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI (TRUE_FALSE)
  // ==========================================
  private static synthesizeTrueFalse(
    lesson: any,
    reqText: string,
    level: CognitiveLevel,
    combined: string
  ): SynthesizedQuestionResult {
    // Topic: Đo lường hoặc Kính hiển vi / Kính lúp (KHTN 6)
    if (combined.includes('đo') || combined.includes('kính lúp') || combined.includes('kính hiển vi') || combined.includes('thực hành')) {
      return {
        question_text: `Trong giờ thực hành môn Khoa học tự nhiên ${lesson.grade}, một nhóm học sinh tiến hành quan sát mẫu vật nhỏ và đo lường kích thước bằng các dụng cụ trong phòng thí nghiệm. Xét tính Đúng hoặc Sai của các nhận định sau:`,
        options: [
          { key: 'a', text: 'Kính lúp cầm tay có tác dụng phóng to hình ảnh của mẫu vật lên từ 3 đến 20 lần để quan sát bằng mắt thường.', isCorrect: true },
          { key: 'b', text: 'Để quan sát cấu tạo chi tiết của tế bào vảy hành, chỉ cần dùng kính lúp cầm tay mà không cần đến kính hiển vi quang học.', isCorrect: false },
          { key: 'c', text: 'Khi đọc chỉ số trên vạch chia của bình chia độ, cần đặt mắt nhìn ngang bằng với đáy của mặt thoáng chất lỏng lõm.', isCorrect: true },
          { key: 'd', text: 'Để tiết kiệm thời gian, học sinh có thể dùng nhiệt kế y tế để đo trực tiếp nhiệt độ của nước đang sôi trên ngọn lửa đèn cồn.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: false, c: true, d: false }),
        explanation: 'Ý a, c đúng theo quy tắc sử dụng dụng cụ đo. Ý b sai vì tế bào có kích thước hiển vi cần kính hiển vi (phóng đại 40x-1000x). Ý d sai vì nhiệt kế y tế chỉ đo tối đa 42°C, nhúng vào nước sôi (100°C) sẽ làm nổ vỡ bầu thủy ngân.',
        rationale: 'Đánh giá năng lực sử dụng dụng cụ thực hành và tuân thủ an toàn phòng thí nghiệm.',
        difficulty: 'MEDIUM'
      };
    }

    // Topic: Tế bào và cơ thể sinh vật (KHTN 6, 7)
    if (combined.includes('tế bào') || combined.includes('quang hợp') || combined.includes('hô hấp') || combined.includes('sinh vật')) {
      return {
        question_text: `Hai học sinh làm tiêu bản tạm thời tế bào biểu bì vảy hành và tế bào niêm mạc khoang miệng để quan sát dưới kính hiển vi quang học ở độ phóng đại 400 lần. Xét tính Đúng hoặc Sai của các phát biểu sau:`,
        options: [
          { key: 'a', text: 'Tiêu bản vảy hành đại diện cho tế bào thực vật, còn tiêu bản niêm mạc khoang miệng đại diện cho tế bào động vật.', isCorrect: true },
          { key: 'b', text: 'Cả hai loại tế bào trên đều có màng sinh chất, chất tế bào và vùng nhân/nhân tế bào.', isCorrect: true },
          { key: 'c', text: 'Tế bào niêm mạc khoang miệng có hình đa giác cố định nhờ được bao bọc bởi thành tế bào dày chứa cellulose.', isCorrect: false },
          { key: 'd', text: 'Lục lạp có mặt ở cả tế bào biểu bì vảy hành và tế bào niêm mạc khoang miệng để thực hiện chức năng quang hợp.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: false, c: true, d: false }),
        explanation: 'Ý a, b đúng về đặc điểm chung của tế bào nhân thực. Ý c sai vì tế bào động vật không có thành tế bào. Ý d sai vì vảy hành ở dưới đất không có lục lạp, tế bào động vật cũng không có lục lạp.',
        rationale: 'Đánh giá khả năng phân tích đối chiếu đặc điểm tế bào thực vật và động vật.',
        difficulty: 'MEDIUM'
      };
    }

    // Topic: Tốc độ và Chuyển động (KHTN 7)
    if (combined.includes('tốc độ') || combined.includes('quãng đường') || combined.includes('thời gian') || combined.includes('chuyển động')) {
      return {
        question_text: `Khảo sát chuyển động của một ô tô đồ chơi chạy pin trên đoạn đường thẳng dài 10 mét. Cổng quang điện ghi nhận thời gian chạy qua các mốc quãng đường 2m, 5m và 10m. Xét tính Đúng hoặc Sai của các khẳng định sau:`,
        options: [
          { key: 'a', text: 'Tốc độ chuyển động của ô tô cho biết mức độ chuyển động nhanh hay chậm của vật.', isCorrect: true },
          { key: 'b', text: 'Nếu thời gian chạy qua các quãng đường bằng nhau là như nhau thì ô tô chuyển động đều.', isCorrect: true },
          { key: 'c', text: 'Đơn vị đo tốc độ thường dùng trong giao thông đường bộ ở Việt Nam là mét trên giây (m/s).', isCorrect: false },
          { key: 'd', text: 'Tốc độ của ô tô càng lớn thì thời gian để đi hết quãng đường 10m càng kéo dài.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: false, d: false }),
        explanation: 'Ý a, b đúng định nghĩa tốc độ. Ý c sai vì thực tế biển báo giao thông dùng km/h. Ý d sai vì thời gian tỉ lệ nghịch với tốc độ (tốc độ càng lớn thì thời gian càng ngắn).',
        rationale: 'Đánh giá năng lực phân tích quy luật chuyển động và liên hệ giao thông thực tế.',
        difficulty: 'MEDIUM'
      };
    }

    // Topic: Phản ứng hóa học, Định luật bảo toàn khối lượng (KHTN 8, 9)
    if (combined.includes('phản ứng') || combined.includes('khối lượng') || combined.includes('acid') || combined.includes('kim loại')) {
      return {
        question_text: `Trong phòng thực hành, học sinh thực hiện thí nghiệm cho viên kẽm (zinc, Zn) vào ống nghiệm chứa dung dịch acid hydrochloric (HCl). Sau phản ứng thấy viên kẽm tan dần và có nhiều bọt khí không màu thoát ra. Xét tính Đúng hoặc Sai:`,
        options: [
          { key: 'a', text: 'Khí không màu thoát ra trong thí nghiệm trên là khí hydrogen (H2).', isCorrect: true },
          { key: 'b', text: 'Hiện tượng sủi bọt khí chứng tỏ đã có phản ứng hoá học xảy ra và sinh ra chất mới.', isCorrect: true },
          { key: 'c', text: 'Tổng khối lượng của dung dịch và các chất trong ống nghiệm sau phản ứng tăng lên so với ban đầu.', isCorrect: false },
          { key: 'd', text: 'Nếu tăng nồng độ dung dịch acid HCl thì tốc độ bọt khí thoát ra sẽ chậm lại.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: false, d: false }),
        explanation: 'Ý a, b đúng (Zn + 2HCl -> ZnCl2 + H2↑). Ý c sai vì có khí H2 bay ra khỏi cốc hở làm khối lượng còn lại giảm. Ý d sai vì tăng nồng độ làm tăng tốc độ phản ứng.',
        rationale: 'Đánh giá dấu hiệu nhận biết phản ứng hoá học và định luật bảo toàn khối lượng.',
        difficulty: 'MEDIUM'
      };
    }

    // Default Fallback
    return {
      question_text: `Dựa trên nội dung bài học "${lesson.title}" (${reqText}) trong chương trình Khoa học tự nhiên ${lesson.grade}, hãy xác định Đúng hoặc Sai cho mỗi nhận định sau:`,
      options: [
        { key: 'a', text: `Nội dung cốt lõi của bài học phù hợp với các quan sát khoa học thực nghiệm: ${reqText.slice(0, 100)}.`, isCorrect: true },
        { key: 'b', text: `Quá trình diễn ra hoàn toàn độc lập và không chịu tác động của bất kì điều kiện môi trường nào.`, isCorrect: false },
        { key: 'c', text: `Kiến thức này được ứng dụng trực tiếp vào sản xuất nông nghiệp, công nghiệp hoặc đời sống hàng ngày.`, isCorrect: true },
        { key: 'd', text: `Các kết luận khoa học rút ra từ bài học chỉ đúng trong phòng thí nghiệm mà không có giá trị thực tiễn.`, isCorrect: false }
      ],
      correct_answer: JSON.stringify({ a: true, b: false, c: true, d: false }),
      explanation: 'Ý a, c đúng theo chuẩn kiến thức và thực tiễn SGK. Ý b, d sai vì các quá trình tự nhiên luôn tương tác với môi trường và có giá trị ứng dụng cao.',
      rationale: `Đánh giá năng lực nhận biết và thông hiểu đa chiều về ${lesson.title}.`,
      difficulty: 'MEDIUM'
    };
  }

  // ==========================================
  // 3. PHẦN III: TRẢ LỜI NGẮN (SHORT_ANSWER)
  // ==========================================
  private static synthesizeShortAnswer(
    lesson: any,
    reqText: string,
    level: CognitiveLevel,
    combined: string
  ): SynthesizedQuestionResult {
    // Đo độ dài & Khối lượng (KHTN 6)
    if (combined.includes('chiều dài') || combined.includes('đo') || combined.includes('thước')) {
      return {
        question_text: 'Đơn vị chuẩn đo độ dài trong hệ đo lường quốc tế (SI) là gì? (Viết tên đầy đủ hoặc kí hiệu)',
        correct_answer: 'mét (m)',
        explanation: 'Đơn vị đo độ dài hợp pháp trong hệ SI của nước ta là mét, kí hiệu là m.',
        rationale: 'Kiểm tra khả năng ghi nhớ đơn vị đo lường chuẩn.',
        difficulty: 'EASY'
      };
    }

    if (combined.includes('khối lượng') || combined.includes('cân')) {
      return {
        question_text: 'Một vật có khối lượng 450 g. Hãy đổi khối lượng này sang đơn vị kilôgam (kg):',
        correct_answer: '0,45 kg (hoặc 0.45)',
        explanation: 'Ta có 1 kg = 1000 g, do đó 450 g = 450 / 1000 = 0,45 kg.',
        rationale: 'Rèn luyện kĩ năng đổi đơn vị đo lường cơ bản.',
        difficulty: 'EASY'
      };
    }

    // Tế bào (KHTN 6)
    if (combined.includes('tế bào') || combined.includes('quang hợp')) {
      return {
        question_text: 'Bào quan chứa chất diệp lục và là nơi diễn ra quá trình quang hợp ở tế bào thực vật có tên gọi là gì?',
        correct_answer: 'Lục lạp',
        explanation: 'Lục lạp là bào quan đặc trưng của tế bào thực vật chứa sắc tố quang hợp.',
        rationale: 'Nhớ chính xác tên gọi bào quan tế bào.',
        difficulty: 'MEDIUM'
      };
    }

    // Oxygen và Không khí (KHTN 6)
    if (combined.includes('oxygen') || combined.includes('không khí')) {
      return {
        question_text: 'Chất khí nào chiếm khoảng 21% thể tích không khí và có vai trò duy trì sự sống, sự cháy?',
        correct_answer: 'Oxygen (hoặc khí oxi)',
        explanation: 'Khí oxygen chiếm khoảng 21% thể tích không khí, cần thiết cho hô hấp và duy trì sự cháy.',
        rationale: 'Kiểm tra thành phần khí trong không khí.',
        difficulty: 'EASY'
      };
    }

    // Tốc độ (KHTN 7)
    if (combined.includes('tốc độ') || combined.includes('vận tốc')) {
      return {
        question_text: 'Một người đi xe đạp chuyển động đều trên quãng đường dài 24 km trong thời gian 2 giờ. Tốc độ của người đó bằng bao nhiêu km/h?',
        correct_answer: '12 km/h (hoặc 12)',
        explanation: 'Áp dụng công thức v = s / t = 24 / 2 = 12 km/h.',
        rationale: 'Tính toán tốc độ chuyển động từ số liệu bài cho.',
        difficulty: 'MEDIUM'
      };
    }

    // Nguyên tử (KHTN 7)
    if (combined.includes('nguyên tử') || combined.includes('proton') || combined.includes('electron')) {
      return {
        question_text: 'Trong nguyên tử, loại hạt nào mang điện tích dương và nằm trong hạt nhân?',
        correct_answer: 'Proton (hoặc hạt proton)',
        explanation: 'Hạt proton mang điện tích dương nằm trong hạt nhân nguyên tử.',
        rationale: 'Ghi nhớ cấu tạo hạt nhân nguyên tử.',
        difficulty: 'EASY'
      };
    }

    // Acid - Base - pH (KHTN 8)
    if (combined.includes('acid') || combined.includes('base') || combined.includes('ph')) {
      return {
        question_text: 'Một dung dịch có giá trị pH = 3. Dung dịch này có môi trường gì (acid, base hay trung tính)?',
        correct_answer: 'Môi trường acid (hoặc acid)',
        explanation: 'Dung dịch có pH < 7 là môi trường acid, pH = 7 là trung tính, pH > 7 là base.',
        rationale: 'Xác định môi trường dung dịch qua chỉ số thang đo pH.',
        difficulty: 'EASY'
      };
    }

    // Định luật bảo toàn khối lượng (KHTN 8)
    if (combined.includes('phản ứng') || combined.includes('bảo toàn')) {
      return {
        question_text: 'Nung 10 gam đá vôi (calcium carbonate, CaCO3) thu được 5,6 gam vôi sống (CaO) và khí carbon dioxide (CO2). Khối lượng khí CO2 thoát ra là bao nhiêu gam?',
        correct_answer: '4,4 g (hoặc 4.4)',
        explanation: 'Theo ĐL bảo toàn khối lượng: m(CO2) = m(CaCO3) - m(CaO) = 10 - 5,6 = 4,4 gam.',
        rationale: 'Áp dụng định luật bảo toàn khối lượng tính toán định lượng.',
        difficulty: 'MEDIUM'
      };
    }

    // Kim loại & Cơ năng (KHTN 9)
    if (combined.includes('kim loại') || combined.includes('dãy hoạt động')) {
      return {
        question_text: 'Kim loại nào có tính dẫn điện và dẫn nhiệt tốt nhất trong tất cả các kim loại?',
        correct_answer: 'Bạc (hoặc Ag)',
        explanation: 'Bạc (Ag) là kim loại có độ dẫn điện và dẫn nhiệt tốt nhất, tiếp theo là đồng (Cu).',
        rationale: 'Nhớ tính chất vật lí đặc trưng của kim loại.',
        difficulty: 'EASY'
      };
    }

    // Quantitative Calculation Fallback (có số liệu rõ ràng)
    return {
      question_text: `Biết khối lượng riêng của nước nguyên chất là 1000 kg/m³. Một khối nước có thể tích 0,5 m³ sẽ có khối lượng bằng bao nhiêu kilôgam (kg)?`,
      correct_answer: '500 kg (hoặc 500)',
      explanation: 'Áp dụng công thức m = D . V = 1000 . 0,5 = 500 kg.',
      rationale: 'Vận dụng công thức khối lượng riêng tính khối lượng chất.',
      difficulty: 'MEDIUM'
    };
  }

  // ==========================================
  // 4. PHẦN IV: TỰ LUẬN (ESSAY)
  // ==========================================
  private static synthesizeEssay(
    lesson: any,
    reqText: string,
    level: CognitiveLevel,
    score: number,
    combined: string
  ): SynthesizedQuestionResult {
    const s = score || 1.0;
    const p1 = (s * 0.4).toFixed(2);
    const p2 = (s * 0.3).toFixed(2);
    const p3 = (s * 0.3).toFixed(2);

    return {
      question_text: `Vận dụng kiến thức bài học "${lesson.title}" trong chương trình Khoa học tự nhiên ${lesson.grade}:\n1. Trình bày bản chất khoa học hoặc cơ chế giải thích cho hiện tượng: "${reqText}".\n2. Lấy một ví dụ thực tiễn trong cuộc sống hàng ngày hoặc sản xuất minh họa cho hiện tượng trên.\n3. Đề xuất biện pháp an toàn khi tiếp xúc hoặc giải pháp bảo vệ môi trường liên quan đến nội dung này.`,
      correct_answer: `Biểu điểm và Hướng dẫn chấm chi tiết (${s.toFixed(1)} điểm):\n- Ý 1 (${p1}đ): Nêu đúng bản chất khoa học, định nghĩa, công thức hoặc quy luật theo SGK.\n- Ý 2 (${p2}đ): Nêu được ví dụ thực tế chính xác và giải thích rõ ràng mối liên hệ khoa học.\n- Ý 3 (${p3}đ): Đề xuất được ít nhất 1 biện pháp ứng dụng an toàn hoặc bảo vệ môi trường thiết thực, khả thi.`,
      explanation: 'Học sinh trình bày đủ 3 phần: bản chất lý thuyết, liên hệ thực tiễn và đề xuất giải pháp bảo vệ an toàn.',
      rationale: `Đánh giá năng lực giải quyết vấn đề và vận dụng kiến thức vào thực tiễn (${level}).`,
      difficulty: 'HARD'
    };
  }
}
