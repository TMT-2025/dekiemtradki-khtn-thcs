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

    // Default Fallback: Phân hóa chuẩn xác theo kiến thức chương trình (phần lớn là mức độ Biết)
    return {
      question_text: isM1
        ? `Theo chương trình Khoa học tự nhiên ${lesson.grade}, nội dung nào sau đây là đúng khi nói về "${lesson.title}"?`
        : `Trong thực tiễn đời sống, phát biểu nào sau đây giải thích chính xác hiện tượng liên quan đến "${lesson.title}"?`,
      options: [
        { key: 'A', text: `${reqText}` },
        { key: 'B', text: `Quá trình diễn ra độc lập và không tuân theo các định luật bảo toàn của tự nhiên.` },
        { key: 'C', text: `Hiện tượng xảy ra ngẫu nhiên và không chịu sự chi phối của các yếu tố môi trường.` },
        { key: 'D', text: `Kết quả khảo sát không thể kiểm chứng lại bằng các phương pháp thực nghiệm khoa học.` }
      ],
      correct_answer: 'A',
      explanation: `Phương án A phản ánh trực tiếp và chuẩn xác yêu cầu cần đạt của bài học "${lesson.title}" trong chương trình GDPT 2018.`,
      rationale: `Đánh giá mức độ nhận thức ${level} bám sát kiến thức SGK KHTN ${lesson.grade}.`,
      difficulty: isM1 ? 'EASY' : 'MEDIUM'
    };
  }

  // ==========================================
  // 2. PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI (TRUE_FALSE)
  // BẮT BUỘC: Bối cảnh thực tiễn ít nhất 25 chữ, các ý a, b, c, d bám sát bối cảnh, không làm màu
  // ==========================================
  private static synthesizeTrueFalse(
    lesson: any,
    reqText: string,
    level: CognitiveLevel,
    combined: string
  ): SynthesizedQuestionResult {
    // 1. Đo lường & Kính hiển vi, Kính lúp (KHTN 6)
    if (combined.includes('đo') || combined.includes('kính lúp') || combined.includes('kính hiển vi') || combined.includes('thực hành') || combined.includes('nhiệt kế') || combined.includes('bình chia độ')) {
      return {
        question_text: `Trong giờ thực hành môn Khoa học tự nhiên ${lesson.grade} tại phòng thí nghiệm, một nhóm học sinh được giao nhiệm vụ quan sát cấu tạo mẫu vật hiển vi và đo lường kích thước các vật thể bằng các dụng cụ: kính lúp cầm tay, kính hiển vi quang học, bình chia độ và nhiệt kế y tế. Bạn nhóm trưởng ghi nhận toàn bộ thao tác chuẩn bị và kết quả thực hiện vào phiếu học tập. Dựa vào bối cảnh thực hành trên, xét tính Đúng hoặc Sai của mỗi nhận định sau:`,
        options: [
          { key: 'a', text: 'Kính lúp cầm tay phù hợp để quan sát các vật thể có kích thước nhỏ như gân lá cây, mắt côn trùng với độ phóng đại từ 3 đến 20 lần.', isCorrect: true },
          { key: 'b', text: 'Để quan sát rõ màng tế bào và nhân của tế bào biểu bì vảy hành, nhóm học sinh chỉ cần dùng kính lúp cầm tay mà không cần đến kính hiển vi.', isCorrect: false },
          { key: 'c', text: 'Khi sử dụng bình chia độ để đo thể tích chất lỏng, học sinh cần đặt bình thẳng đứng và đặt mắt nhìn ngang bằng với đáy của mặt thoáng chất lỏng lõm.', isCorrect: true },
          { key: 'd', text: 'Để đo nhiệt độ của cốc nước đang đun sôi trên ngọn lửa đèn cồn (khoảng 100°C), học sinh có thể sử dụng nhiệt kế y tế có giới hạn đo 42°C.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: false, c: true, d: false }),
        explanation: 'Ý a, c đúng quy chuẩn thực hành đo lường. Ý b sai vì tế bào có kích thước hiển vi (vài chục micromet) bắt buộc phải dùng kính hiển vi quang học. Ý d sai vì nhiệt kế y tế chỉ đo tối đa 42°C, nhúng vào nước sôi 100°C sẽ làm nứt vỡ bầu đựng chất lỏng.',
        rationale: 'Đánh giá năng lực lựa chọn và sử dụng chính xác các dụng cụ quan sát, đo lường trong phòng thí nghiệm KHTN.',
        difficulty: 'MEDIUM'
      };
    }

    // 2. Tế bào và cơ thể sinh vật (KHTN 6, 7)
    if (combined.includes('tế bào') || combined.includes('vảy hành') || combined.includes('niêm mạc') || combined.includes('sinh vật')) {
      return {
        question_text: `Hai bạn học sinh tiến hành làm hai tiêu bản hiển vi tạm thời gồm: mẫu lát biểu bì vảy hành tím và mẫu tế bào niêm mạc khoang miệng người. Sau khi nhỏ một giọt dung dịch xanh methylene để nhuộm màu, hai bạn đặt mẫu lên kính hiển vi quang học và điều chỉnh ốc sơ cấp rồi vi cấp để quan sát ở độ phóng đại 400 lần. Dựa vào quá trình quan sát thực tế trên, xét tính Đúng hoặc Sai của các phát biểu sau:`,
        options: [
          { key: 'a', text: 'Tiêu bản tế bào vảy hành đại diện cho tế bào thực vật, còn tiêu bản niêm mạc khoang miệng đại diện cho tế bào động vật.', isCorrect: true },
          { key: 'b', text: 'Dưới kính hiển vi ở độ phóng đại 400 lần, cả hai mẫu tế bào đều quan sát thấy màng sinh chất, tế bào chất và nhân tế bào.', isCorrect: true },
          { key: 'c', text: 'Tế bào niêm mạc khoang miệng người có hình đa giác cố định và vững chắc nhờ được bao bọc bởi lớp thành tế bào chứa cellulose.', isCorrect: false },
          { key: 'd', text: 'Bào quan lục lạp chứa chất diệp lục có mặt ở cả tế bào vảy hành tím và tế bào niêm mạc khoang miệng người.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: false, d: false }),
        explanation: 'Ý a, b đúng về đặc điểm tế bào nhân thực. Ý c sai vì tế bào động vật không có thành tế bào. Ý d sai vì vảy hành ở dưới đất không có lục lạp, tế bào động vật cũng không có lục lạp.',
        rationale: 'Đánh giá khả năng so sánh đối chiếu đặc điểm cấu tạo tế bào thực vật và động vật từ mẫu tiêu bản thực nghiệm.',
        difficulty: 'MEDIUM'
      };
    }

    // 3. Quang hợp & Hô hấp tế bào ở thực vật (KHTN 7)
    if (combined.includes('quang hợp') || combined.includes('hô hấp') || combined.includes('tinh bột') || combined.includes('diệp lục')) {
      return {
        question_text: `Một nhóm học sinh tiến hành thí nghiệm chứng minh sự tạo thành tinh bột trong quang hợp: Lấy một chậu cây khoai lang để trong bóng tối 2 ngày, sau đó dùng băng giấy đen bịt kín một phần của một chiếc lá ở cả hai mặt rồi đem chậu cây ra chiếu sáng liên tục trong 6 giờ. Sau đó, nhóm ngắt chiếc lá, gỡ bỏ băng giấy đen, đun sôi trong cồn để tẩy hết diệp lục rồi nhỏ dung dịch iodine lên khắp mặt lá. Dựa vào tiến trình thực nghiệm trên, xét tính Đúng hoặc Sai của mỗi khẳng định sau:`,
        options: [
          { key: 'a', text: 'Phần lá bị bịt kín bởi băng giấy đen không nhận được ánh sáng mặt trời nên không diễn ra quá trình quang hợp.', isCorrect: true },
          { key: 'b', text: 'Khi nhỏ dung dịch thuốc thử iodine, phần lá được chiếu sáng chuyển sang màu xanh tím đặc trưng chứng tỏ có sự tạo thành tinh bột.', isCorrect: true },
          { key: 'c', text: 'Bước đun sôi chiếc lá trong cồn nhằm mục đích cung cấp năng lượng nhiệt để kích thích phản ứng quang hợp diễn ra mạnh mẽ hơn.', isCorrect: false },
          { key: 'd', text: 'Kết quả thí nghiệm này chứng minh ánh sáng mặt trời là điều kiện bắt buộc để lá cây tổng hợp chất hữu cơ qua quang hợp.', isCorrect: true }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: false, d: true }),
        explanation: 'Ý a, b, d đúng chuẩn thí nghiệm SGK KHTN 7. Ý c sai vì việc đun trong cồn là để hòa tan và tẩy sạch sắc tố diệp lục, giúp quan sát rõ sự đổi màu với iodine.',
        rationale: 'Đánh giá năng lực phân tích các bước thí nghiệm sinh học và chứng minh vai trò của ánh sáng trong quang hợp.',
        difficulty: 'MEDIUM'
      };
    }

    // 4. Tốc độ, Quãng đường & Đồ thị chuyển động (KHTN 7)
    if (combined.includes('tốc độ') || combined.includes('quãng đường') || combined.includes('thời gian') || combined.includes('chuyển động')) {
      return {
        question_text: `Một nhóm học sinh lớp 7 thực hiện bài thực hành khảo sát chuyển động của xe đồ chơi chạy bằng pin trên một máng nghiêng thẳng dài 1,2 mét. Nhóm gắn hai cổng quang điện A và B nối với đồng hồ đo thời gian hiện số để ghi nhận thời gian xe đi qua quãng đường 0,4 mét đầu tiên là 0,8 giây và đi hết toàn bộ quãng đường 1,2 mét là 2,4 giây. Dựa vào thông số và điều kiện thực nghiệm trên, xét tính Đúng hoặc Sai của mỗi khẳng định sau:`,
        options: [
          { key: 'a', text: 'Tốc độ trung bình của xe đồ chơi trên đoạn đường 0,4 mét đầu tiên được tính bằng 0,5 m/s.', isCorrect: true },
          { key: 'b', text: 'Vì tỉ số giữa quãng đường và thời gian ở hai giai đoạn là như nhau (0,5 m/s) nên xe đồ chơi chuyển động đều trên máng.', isCorrect: true },
          { key: 'c', text: 'Để chuyển đổi tốc độ 0,5 m/s của xe sang đơn vị giao thông phổ biến km/h, ta lấy 0,5 chia cho 3,6.', isCorrect: false },
          { key: 'd', text: 'Nếu nhóm nâng độ dốc của máng nghiêng lên cao hơn thì thời gian xe di chuyển qua đoạn AB dài 1,2 mét sẽ tăng lên.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: false, d: false }),
        explanation: 'Ý a đúng vì v = 0,4 / 0,8 = 0,5 m/s. Ý b đúng vì tốc độ toàn đoạn v = 1,2 / 2,4 = 0,5 m/s. Ý c sai vì từ m/s sang km/h phải nhân 3,6 (0,5 * 3,6 = 1,8 km/h). Ý d sai vì độ dốc lớn hơn làm xe chạy nhanh hơn nên thời gian giảm.',
        rationale: 'Đánh giá năng lực đo đạc, xử lí số liệu thực nghiệm và tính toán tốc độ chuyển động.',
        difficulty: 'MEDIUM'
      };
    }

    // 5. Phản ứng hóa học, Định luật bảo toàn khối lượng (KHTN 8, 9)
    if (combined.includes('phản ứng') || combined.includes('khối lượng') || combined.includes('acid') || combined.includes('kim loại') || combined.includes('kẽm')) {
      return {
        question_text: `Trong giờ thực hành Hoá học lớp 8, học sinh tiến hành thí nghiệm: Cho một mẩu kẽm (zinc, Zn) nặng 2,0 gam vào một ống nghiệm chứa 15 ml dung dịch acid hydrochloric (HCl) nồng độ 1M ở nhiệt độ phòng (25°C). Ngay sau khi kẽm tiếp xúc với dung dịch, học sinh quan sát thấy bọt khí không màu thoát ra mãnh liệt trên bề mặt thanh kẽm và thành ống nghiệm ấm dần lên. Dựa vào diễn biến thực nghiệm trên, xét tính Đúng hoặc Sai của mỗi nhận định sau:`,
        options: [
          { key: 'a', text: 'Khí không màu thoát ra mãnh liệt trong thí nghiệm trên là khí hydrogen (H2), có thể nhận biết bằng que đóm đang cháy phát ra tiếng nổ nhỏ.', isCorrect: true },
          { key: 'b', text: 'Hiện tượng sủi bọt khí và sinh nhiệt chứng tỏ đã có phản ứng hoá học toả nhiệt xảy ra giữa zinc và dung dịch acid HCl.', isCorrect: true },
          { key: 'c', text: 'Tổng khối lượng của ống nghiệm hở và dung dịch sau phản ứng sẽ lớn hơn tổng khối lượng của chúng trước khi thả viên kẽm vào.', isCorrect: false },
          { key: 'd', text: 'Nếu dùng mẩu kẽm được tán mịn thành dạng bột với cùng khối lượng 2,0 gam thì tốc độ thoát khí sẽ diễn ra chậm hơn dạng mẩu viên.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: false, d: false }),
        explanation: 'Ý a, b đúng phương trình Zn + 2HCl -> ZnCl2 + H2↑ (phản ứng toả nhiệt). Ý c sai vì có khí H2 bay ra khỏi ống nghiệm hở làm tổng khối lượng giảm. Ý d sai vì dạng bột có diện tích tiếp xúc lớn hơn nên tốc độ phản ứng sẽ nhanh hơn.',
        rationale: 'Đánh giá nhận thức về dấu hiệu phản ứng hoá học, định luật bảo toàn khối lượng và các yếu tố ảnh hưởng tốc độ phản ứng.',
        difficulty: 'MEDIUM'
      };
    }

    // 6. Dung dịch, Nồng độ & Thang đo pH (KHTN 8)
    if (combined.includes('dung dịch') || combined.includes('nồng độ') || combined.includes('ph') || combined.includes('muối') || combined.includes('độ tan')) {
      return {
        question_text: `Trong phòng thực hành, bạn Lan tiến hành pha chế dung dịch và kiểm tra tính acid - base: Lan cho 40 gam muối ăn (NaCl) vào cốc chứa 100 gam nước cất ở 25°C rồi khuấy kĩ bằng đũa thuỷ tinh, sau đó dùng giấy chỉ thị màu đo độ pH của nước vắt quả chanh tươi và dung dịch nước vôi trong. Biết độ tan của NaCl ở 25°C là 36 gam trong 100 gam nước. Dựa vào các thao tác thí nghiệm trên, xét tính Đúng hoặc Sai của mỗi phát biểu sau:`,
        options: [
          { key: 'a', text: 'Sau khi khuấy kĩ ở 25°C, trong cốc có 4 gam muối ăn NaCl không tan bị lắng đọng dưới đáy cốc và dung dịch phía trên là dung dịch bão hoà.', isCorrect: true },
          { key: 'b', text: 'Nước cốt chanh tươi có chứa acid citric nên khi thử bằng giấy chỉ thị pH sẽ cho giá trị pH nhỏ hơn 7.', isCorrect: true },
          { key: 'c', text: 'Dung dịch nước vôi trong có môi trường base nên khi thử bằng giấy quỳ tím sẽ làm quỳ tím chuyển sang màu đỏ.', isCorrect: false },
          { key: 'd', text: 'Nếu đun nóng cốc nước muối lên 80°C thì toàn bộ lượng muối lắng cặn có xu hướng tan thêm do độ tan của chất rắn thường tăng khi nhiệt độ tăng.', isCorrect: true }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: false, d: true }),
        explanation: 'Ý a đúng vì tối đa chỉ tan 36g, dư 4g tạo dung dịch bão hoà. Ý b đúng vì acid có pH < 7. Ý c sai vì dung dịch base làm quỳ tím chuyển màu xanh, không phải màu đỏ. Ý d đúng vì độ tan của NaCl tăng nhẹ theo nhiệt độ.',
        rationale: 'Đánh giá hiểu biết thực tế về độ tan dung dịch và thang đo pH đối với các chất quen thuộc.',
        difficulty: 'MEDIUM'
      };
    }

    // 7. Lực, Áp suất & Lực đẩy Archimedes (KHTN 8)
    if (combined.includes('lực') || combined.includes('áp suất') || combined.includes('archimedes') || combined.includes('nổi') || combined.includes('chìm')) {
      return {
        question_text: `Một học sinh tiến hành thí nghiệm khảo sát lực đẩy chất lỏng: Treo một khối kim loại đặc vào móc của một lực kế thì lực kế chỉ 6,0 N khi vật ở ngoài không khí. Khi nhúng chìm hoàn toàn khối kim loại vào một bình tràn đựng đầy nước, lực kế chỉ còn 4,2 N, đồng thời lượng nước tràn ra ngoài được hứng trọn vẹn vào một ống đong chia độ. Dựa vào số liệu thực nghiệm trên, xét tính Đúng hoặc Sai của mỗi nhận định sau:`,
        options: [
          { key: 'a', text: 'Chỉ số của lực kế giảm đi khi nhúng vật vào nước là do có lực đẩy Archimedes của nước tác dụng lên vật hướng thẳng đứng từ dưới lên.', isCorrect: true },
          { key: 'b', text: 'Độ lớn của lực đẩy Archimedes tác dụng lên khối kim loại khi chìm hoàn toàn trong nước có giá trị là 1,8 N.', isCorrect: true },
          { key: 'c', text: 'Trọng lượng của lượng nước tràn ra hứng được trong ống đong có giá trị đúng bằng 1,8 N.', isCorrect: true },
          { key: 'd', text: 'Nếu tiếp tục hạ khối kim loại xuống ngập sâu hơn nữa trong nước (nhưng chưa chạm đáy bình) thì lực kế sẽ chỉ giá trị nhỏ hơn 4,2 N.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: true, d: false }),
        explanation: 'Ý a, b, c đúng định luật Archimedes: FA = P_kk - P_chìm = 6,0 - 4,2 = 1,8 N và bằng trọng lượng phần nước tràn ra. Ý d sai vì khi đã ngập hoàn toàn, thể tích chiếm chỗ V không đổi nên FA không đổi, lực kế vẫn chỉ 4,2 N.',
        rationale: 'Đánh giá năng lực phân tích hiện tượng và tính toán lực đẩy Archimedes từ số liệu thí nghiệm thực tế.',
        difficulty: 'MEDIUM'
      };
    }

    // 8. Dãy hoạt động hoá học của kim loại & Ăn mòn (KHTN 9)
    if (combined.includes('dãy hoạt động') || combined.includes('kim loại') || combined.includes('sắt') || combined.includes('đồng') || combined.includes('ăn mòn')) {
      return {
        question_text: `Để so sánh mức độ hoạt động hoá học giữa sắt (Fe), đồng (Cu) và bạc (Ag), một nhóm học sinh làm hai thí nghiệm song song ở 25°C: Ống nghiệm (1) nhúng một chiếc đinh sắt sạch vào 5 ml dung dịch copper(II) sulfate (CuSO4) màu xanh lam. Ống nghiệm (2) nhúng một đoạn dây đồng sạch vào 5 ml dung dịch silver nitrate (AgNO3) không màu. Dựa vào diễn biến thực nghiệm, xét tính Đúng hoặc Sai của mỗi nhận định sau:`,
        options: [
          { key: 'a', text: 'Ở ống nghiệm (1), có một lớp kim loại màu đỏ (Cu) bám ngoài chiếc đinh sắt và màu xanh lam của dung dịch nhạt dần.', isCorrect: true },
          { key: 'b', text: 'Ở ống nghiệm (2), xuất hiện kim loại màu trắng bạc (Ag) bám ngoài dây đồng và dung dịch dần chuyển sang màu xanh lam.', isCorrect: true },
          { key: 'c', text: 'Các hiện tượng quan sát được chứng minh thứ tự mức độ hoạt động hoá học giảm dần là: Fe > Cu > Ag.', isCorrect: true },
          { key: 'd', text: 'Nếu nhóm học sinh thay chiếc đinh sắt ở ống (1) bằng một sợi dây bạc (Ag) sạch thì phản ứng xảy ra còn nhanh và mãnh liệt hơn.', isCorrect: false }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: true, d: false }),
        explanation: 'Ý a, b, c đúng bản chất dãy hoạt động hoá học: Fe đẩy Cu ra khỏi CuSO4, Cu đẩy Ag ra khỏi AgNO3 chứng tỏ Fe > Cu > Ag. Ý d sai vì Ag đứng sau Cu nên không thể phản ứng với dung dịch CuSO4.',
        rationale: 'Đánh giá khả năng suy luận dãy hoạt động hoá học của kim loại dựa trên hiện tượng thực nghiệm.',
        difficulty: 'MEDIUM'
      };
    }

    // 9. Dòng điện, Điện trở & Định luật Ohm (KHTN 9)
    if (combined.includes('điện') || combined.includes('ohm') || combined.includes('điện trở') || combined.includes('hiệu điện thế')) {
      return {
        question_text: `Một nhóm học sinh mắc một đoạn dây dẫn kim loại có điện trở R không đổi vào hai cực của một nguồn điện có hiệu điện thế U điều chỉnh được. Học sinh sử dụng một vôn kế để đo hiệu điện thế U giữa hai đầu dây và một ampe kế để đo cường độ dòng điện I chạy qua dây khi U lần lượt nhận các giá trị 3,0V, 6,0V và 9,0V. Dựa vào bối cảnh đo đạc mạch điện thực tế, xét tính Đúng hoặc Sai của mỗi nhận định sau:`,
        options: [
          { key: 'a', text: 'Khi hiệu điện thế đặt vào hai đầu đoạn dây dẫn tăng lên thì cường độ dòng điện chạy qua dây cũng tăng tỉ lệ thuận.', isCorrect: true },
          { key: 'b', text: 'Thương số giữa hiệu điện thế U và cường độ dòng điện I (R = U / I) của đoạn dây dẫn này luôn giữ giá trị không đổi trong cả 3 lần đo.', isCorrect: true },
          { key: 'c', text: 'Đồ thị biểu diễn mối quan hệ giữa cường độ dòng điện I và hiệu điện thế U đối với đoạn dây dẫn này là một đường tròn khép kín.', isCorrect: false },
          { key: 'd', text: 'Nếu tăng hiệu điện thế U từ 3,0V lên 6,0V thì cường độ dòng điện I đo được trên ampe kế sẽ tăng gấp 2 lần giá trị ban đầu.', isCorrect: true }
        ],
        correct_answer: JSON.stringify({ a: true, b: true, c: false, d: true }),
        explanation: 'Ý a, b, d đúng theo định luật Ohm: I = U/R (I tỉ lệ thuận với U, R là hằng số với dây dẫn xác định). Ý c sai vì đồ thị I theo U là đường thẳng đi qua gốc toạ độ (0;0).',
        rationale: 'Đánh giá kĩ năng khảo sát mạch điện thực hành và hiểu bản chất định luật Ohm.',
        difficulty: 'MEDIUM'
      };
    }

    // 10. Default General Synthesizer for True/False (>= 35 words practical research context)
    return {
      question_text: `Trong một dự án nghiên cứu học tập môn Khoa học tự nhiên ${lesson.grade}, nhóm học sinh tiến hành quan sát thực nghiệm và thu thập số liệu thực tế về chủ đề "${lesson.title}". Căn cứ vào các kết quả đo đạc, hiện tượng quan sát được đối với yêu cầu cần đạt "${reqText.slice(0, 100)}", nhóm học sinh thảo luận và đưa ra các nhận định khoa học sau đây:`,
      options: [
        { key: 'a', text: `Hiện tượng quan sát được trong thực nghiệm trên phản ánh chính xác bản chất khoa học của nội dung: ${reqText.slice(0, 90)}.`, isCorrect: true },
        { key: 'b', text: `Trong quá trình khảo sát, các đại lượng và hiện tượng vật chất biến đổi hoàn toàn ngẫu nhiên và không tuân theo bất kì quy luật khoa học nào.`, isCorrect: false },
        { key: 'c', text: `Quy luật khoa học được phát hiện từ bài học "${lesson.title}" được ứng dụng trực tiếp để giải quyết các vấn đề sản xuất, y tế hoặc bảo vệ môi trường.`, isCorrect: true },
        { key: 'd', text: `Khi thay đổi các yếu tố nhiệt độ, nồng độ hoặc điều kiện môi trường ngoài, diễn biến và kết quả của hiện tượng quan sát được vẫn không có bất kì sự thay đổi nào.`, isCorrect: false }
      ],
      correct_answer: JSON.stringify({ a: true, b: false, c: true, d: false }),
      explanation: 'Ý a, c đúng theo quy luật khoa học tự nhiên và ứng dụng thực tiễn của bài học. Ý b, d sai vì mọi hiện tượng tự nhiên đều tuân theo các định luật khách quan và phụ thuộc chặt chẽ vào các điều kiện môi trường thực tế.',
      rationale: `Đánh giá năng lực nhận thức bản chất khoa học và tư duy thực nghiệm đối với bài học "${lesson.title}".`,
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
