import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  HeadingLevel,
  Packer
} from 'docx';
import { AssessmentMatrix } from '@/types/matrix';
import { TestSpecification } from '@/types/specification';
import { TestExam } from '@/types/test';

export class DocxExportService {
  /**
   * 01_Ma_tran.docx
   */
  public static async exportMatrixDocx(matrix: AssessmentMatrix): Promise<Buffer> {
    const tableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          this.createHeaderCell('TT', 600),
          this.createHeaderCell('Chủ đề / Đơn vị kiến thức', 2800),
          this.createHeaderCell('Số tiết', 700),
          this.createHeaderCell('NB (câu)', 800),
          this.createHeaderCell('TH (câu)', 800),
          this.createHeaderCell('VD (câu)', 800),
          this.createHeaderCell('VDC (câu)', 800),
          this.createHeaderCell('Tổng số câu', 1000),
          this.createHeaderCell('Điểm số', 900),
          this.createHeaderCell('Tỉ lệ %', 800)
        ]
      }),
      ...matrix.rows.map((row, idx) => {
        const nb = row.nbMcq + row.nbTf + row.nbSa + row.nbEs;
        const th = row.thMcq + row.thTf + row.thSa + row.thEs;
        const vd = row.vdMcq + row.vdTf + row.vdSa + row.vdEs;
        const vdc = row.vdcMcq + row.vdcTf + row.vdcSa + row.vdcEs;

        return new TableRow({
          children: [
            this.createDataCell(`${idx + 1}`, 600, AlignmentType.CENTER),
            this.createDataCell(row.topicName, 2800, AlignmentType.LEFT),
            this.createDataCell(`${row.periods}`, 700, AlignmentType.CENTER),
            this.createDataCell(nb > 0 ? `${nb}` : '-', 800, AlignmentType.CENTER),
            this.createDataCell(th > 0 ? `${th}` : '-', 800, AlignmentType.CENTER),
            this.createDataCell(vd > 0 ? `${vd}` : '-', 800, AlignmentType.CENTER),
            this.createDataCell(vdc > 0 ? `${vdc}` : '-', 800, AlignmentType.CENTER),
            this.createDataCell(`${row.totalQuestions}`, 1000, AlignmentType.CENTER, true),
            this.createDataCell(`${row.totalScore.toFixed(2)}`, 900, AlignmentType.CENTER, true),
            this.createDataCell(`${row.percentage.toFixed(1)}%`, 800, AlignmentType.CENTER)
          ]
        });
      }),
      // Summary Row
      new TableRow({
        children: [
          this.createDataCell('TỔNG CỘNG', 3400 + 700, AlignmentType.CENTER, true),
          this.createDataCell(`${matrix.summaryByCognitive.M1.questions}`, 800, AlignmentType.CENTER, true),
          this.createDataCell(`${matrix.summaryByCognitive.M2.questions}`, 800, AlignmentType.CENTER, true),
          this.createDataCell(`${matrix.summaryByCognitive.M3.questions}`, 800, AlignmentType.CENTER, true),
          this.createDataCell(`${matrix.summaryByCognitive.M4.questions}`, 800, AlignmentType.CENTER, true),
          this.createDataCell(`${matrix.totalQuestions}`, 1000, AlignmentType.CENTER, true),
          this.createDataCell(`${matrix.totalScore.toFixed(2)}`, 900, AlignmentType.CENTER, true),
          this.createDataCell('100%', 800, AlignmentType.CENTER, true)
        ]
      })
    ];

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } // Standard VN margins
            }
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG THCS & THPT PHAN VĂN TRỊ', font: 'Times New Roman', size: 18, color: '666666' })
                  ],
                  alignment: AlignmentType.RIGHT
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            })
          },
          children: [
            this.createDocumentHeader(
              'MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ',
              `Môn: Khoa học tự nhiên — Lớp ${matrix.grade} | Năm học: ${matrix.schoolYear}`
            ),
            new Paragraph({ text: '', spacing: { after: 200 } }),
            new Table({
              rows: tableRows,
              width: { size: 10000, type: WidthType.DXA }
            }),
            new Paragraph({ text: '', spacing: { before: 300 } }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Ghi chú: Đề đảm bảo cân đối giữa 3 mạch kiến thức: Vật lí (${matrix.summaryByDomain.physics.score}đ - ${matrix.summaryByDomain.physics.percentage}%), Hóa học (${matrix.summaryByDomain.chemistry.score}đ - ${matrix.summaryByDomain.chemistry.percentage}%), Sinh học (${matrix.summaryByDomain.biology.score}đ - ${matrix.summaryByDomain.biology.percentage}%).`,
                  italics: true,
                  font: 'Times New Roman',
                  size: 20
                })
              ]
            })
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * 02_Ban_dac_ta.docx
   */
  public static async exportSpecificationDocx(spec: TestSpecification): Promise<Buffer> {
    const tableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          this.createHeaderCell('STT', 600),
          this.createHeaderCell('Chủ đề / Đơn vị kiến thức', 2200),
          this.createHeaderCell('Yêu cầu cần đạt', 3200),
          this.createHeaderCell('Mức độ', 800),
          this.createHeaderCell('Dạng câu', 900),
          this.createHeaderCell('Số câu', 700),
          this.createHeaderCell('Điểm', 700),
          this.createHeaderCell('Câu số', 900)
        ]
      }),
      ...spec.items.map(it => {
        return new TableRow({
          children: [
            this.createDataCell(`${it.stt}`, 600, AlignmentType.CENTER),
            this.createDataCell(it.contentUnit, 2200, AlignmentType.LEFT),
            this.createDataCell(it.learningRequirement, 3200, AlignmentType.LEFT),
            this.createDataCell(it.cognitiveLevel, 800, AlignmentType.CENTER),
            this.createDataCell(it.questionType, 900, AlignmentType.CENTER),
            this.createDataCell(`${it.questionCount}`, 700, AlignmentType.CENTER, true),
            this.createDataCell(`${it.score.toFixed(2)}`, 700, AlignmentType.CENTER, true),
            this.createDataCell(it.questionNumbers || '-', 900, AlignmentType.CENTER)
          ]
        });
      })
    ];

    const doc = new Document({
      sections: [
        {
          properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } } },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            })
          },
          children: [
            this.createDocumentHeader(
              'BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ',
              `Môn: Khoa học tự nhiên — Lớp ${spec.grade} | Năm học: ${spec.schoolYear}`
            ),
            new Paragraph({ text: '', spacing: { after: 200 } }),
            new Table({
              rows: tableRows,
              width: { size: 10000, type: WidthType.DXA }
            })
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * 03_De_kiem_tra.docx
   */
  public static async exportTestDocx(test: TestExam): Promise<Buffer> {
    const paragraphs: Paragraph[] = [
      this.createDocumentHeader(
        test.title.toUpperCase(),
        `Thời gian làm bài: ${test.durationMinutes} phút (Không kể thời gian phát đề) — Mã đề: ${test.testCode}`
      ),
      new Paragraph({ text: '', spacing: { after: 300 } })
    ];

    test.parts.forEach(part => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${part.partName} (${part.totalScore.toFixed(1)} điểm)`,
              bold: true,
              font: 'Times New Roman',
              size: 24
            })
          ],
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: part.instructions,
              italics: true,
              font: 'Times New Roman',
              size: 20
            })
          ],
          spacing: { after: 150 }
        })
      );

      part.questions.forEach(tq => {
        const q = tq.question;
        if (q.contextMetadata?.stimulus) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[Bối cảnh & Dữ liệu: ${q.contextMetadata.stimulus.title}]`,
                  italics: true,
                  bold: true,
                  font: 'Times New Roman',
                  size: 20
                })
              ],
              spacing: { before: 100, after: 40 }
            })
          );
        }

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Câu ${tq.globalOrderIndex}. `,
                bold: true,
                font: 'Times New Roman',
                size: 22
              }),
              new TextRun({
                text: q.questionText,
                font: 'Times New Roman',
                size: 22
              })
            ],
            spacing: { before: 120, after: 80 }
          })
        );

        if (q.options && q.options.length > 0) {
          q.options.forEach(opt => {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `   ${opt.key}. `,
                    bold: true,
                    font: 'Times New Roman',
                    size: 22
                  }),
                  new TextRun({
                    text: opt.text,
                    font: 'Times New Roman',
                    size: 22
                  })
                ],
                spacing: { after: 40 }
              })
            );
          });
        }
      });
    });

    paragraphs.push(
      new Paragraph({ text: '', spacing: { before: 400 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: '----------------- HẾT -----------------',
            bold: true,
            font: 'Times New Roman',
            size: 22
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: '(Cán bộ coi thi không giải thích gì thêm)',
            italics: true,
            font: 'Times New Roman',
            size: 20
          })
        ]
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } } },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            })
          },
          children: paragraphs
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * 04_Dap_an.docx
   */
  public static async exportAnswerKeyDocx(test: TestExam): Promise<Buffer> {
    const tableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          this.createHeaderCell('Câu', 800),
          this.createHeaderCell('Phần', 800),
          this.createHeaderCell('Dạng câu', 1200),
          this.createHeaderCell('Đáp án đúng', 2500),
          this.createHeaderCell('Điểm', 800),
          this.createHeaderCell('Hướng dẫn / Lời giải chi tiết', 3900)
        ]
      }),
      ...test.answerKeys.map(ak => {
        return new TableRow({
          children: [
            this.createDataCell(`Câu ${ak.questionNumber}`, 800, AlignmentType.CENTER, true),
            this.createDataCell(`Phần ${ak.partNumber}`, 800, AlignmentType.CENTER),
            this.createDataCell(ak.questionType, 1200, AlignmentType.CENTER),
            this.createDataCell(ak.correctAnswer, 2500, AlignmentType.LEFT, true),
            this.createDataCell(`${ak.score.toFixed(2)}`, 800, AlignmentType.CENTER),
            this.createDataCell(ak.explanation || '-', 3900, AlignmentType.LEFT)
          ]
        });
      })
    ];

    const doc = new Document({
      sections: [
        {
          properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } } },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            })
          },
          children: [
            this.createDocumentHeader(
              'ĐÁP ÁN ĐỀ KIỂM TRA ĐỊNH KÌ',
              `Môn: Khoa học tự nhiên ${test.grade} — Mã đề: ${test.testCode}`
            ),
            new Paragraph({ text: '', spacing: { after: 200 } }),
            new Table({
              rows: tableRows,
              width: { size: 10000, type: WidthType.DXA }
            })
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * 05_Huong_dan_cham.docx
   */
  public static async exportScoringGuideDocx(test: TestExam): Promise<Buffer> {
    const tableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          this.createHeaderCell('Câu', 800),
          this.createHeaderCell('Ý / Bước thực hiện', 1200),
          this.createHeaderCell('Nội dung yêu cầu cần đạt & Hướng dẫn chấm', 6500),
          this.createHeaderCell('Điểm', 1500)
        ]
      }),
      ...test.scoringGuide.rubrics.map(rub => {
        return new TableRow({
          children: [
            this.createDataCell(`Câu ${rub.questionNumber}`, 800, AlignmentType.CENTER, true),
            this.createDataCell(rub.subItem || 'Toàn câu', 1200, AlignmentType.CENTER),
            this.createDataCell(rub.criterion, 6500, AlignmentType.LEFT),
            this.createDataCell(`${rub.score.toFixed(2)}`, 1500, AlignmentType.CENTER, true)
          ]
        });
      })
    ];

    const doc = new Document({
      sections: [
        {
          properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } } },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            })
          },
          children: [
            this.createDocumentHeader(
              'HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM CHI TIẾT',
              `Môn: Khoa học tự nhiên ${test.grade} — Mã đề: ${test.testCode}`
            ),
            new Paragraph({ text: '', spacing: { after: 200 } }),
            new Paragraph({
              children: [
                new TextRun({ text: 'I. NGUYÊN TẮC CHUNG:', bold: true, font: 'Times New Roman', size: 22 })
              ],
              spacing: { after: 100 }
            }),
            ...test.scoringGuide.instructions.map(inst =>
              new Paragraph({
                children: [new TextRun({ text: `- ${inst}`, font: 'Times New Roman', size: 20 })],
                spacing: { after: 60 }
              })
            ),
            new Paragraph({ text: '', spacing: { before: 200, after: 100 } }),
            new Paragraph({
              children: [
                new TextRun({ text: 'II. BIỂU ĐIỂM VÀ ĐÁP ÁN CHI TIẾT:', bold: true, font: 'Times New Roman', size: 22 })
              ],
              spacing: { after: 150 }
            }),
            new Table({
              rows: tableRows,
              width: { size: 10000, type: WidthType.DXA }
            })
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * 05_Context_Report.docx (Section 21, 30 & Phase 7.1)
   */
  public static async exportContextReportDocx(test: TestExam): Promise<Buffer> {
    const cr = test.contextReport;
    const totalQ = test.parts.reduce((s, p) => s + p.questions.length, 0);
    const ctxQ = test.parts.flatMap(p => p.questions).filter(q => q.question.contextMetadata?.hasContext).length;
    const pct = totalQ > 0 ? Math.round((ctxQ / totalQ) * 100) : 0;
    const targetPct = cr?.targetContextPercentage || 50;

    const summaryRows = [
      new TableRow({
        children: [
          this.createDataCell('Tổng số câu hỏi', 4000, AlignmentType.LEFT, true),
          this.createDataCell(`${totalQ} câu`, 6000, AlignmentType.LEFT)
        ]
      }),
      new TableRow({
        children: [
          this.createDataCell('Số câu hỏi gắn với bối cảnh thực tiễn', 4000, AlignmentType.LEFT, true),
          this.createDataCell(`${ctxQ} câu (${pct}%)`, 6000, AlignmentType.LEFT, true)
        ]
      }),
      new TableRow({
        children: [
          this.createDataCell('Tỉ lệ bối cảnh mục tiêu cấu hình', 4000, AlignmentType.LEFT, true),
          this.createDataCell(`${targetPct}%`, 6000, AlignmentType.LEFT)
        ]
      }),
      new TableRow({
        children: [
          this.createDataCell('Đánh giá chất lượng bối cảnh (Quality Gate)', 4000, AlignmentType.LEFT, true),
          this.createDataCell(cr?.qualityStatus === 'PASS' ? 'ĐẠT (PASS)' : cr?.qualityStatus === 'WARNING' ? 'CẦN LƯU Ý (WARNING)' : 'KHÔNG ĐẠT (FAIL)', 6000, AlignmentType.LEFT, true)
        ]
      })
    ];

    // Detailed question table
    const questionRows = [
      new TableRow({
        tableHeader: true,
        children: [
          this.createHeaderCell('Câu', 700),
          this.createHeaderCell('Dạng câu', 1200),
          this.createHeaderCell('Mức độ', 800),
          this.createHeaderCell('Bối cảnh / Hiện tượng', 3300),
          this.createHeaderCell('Phạm vi / Lĩnh vực', 2000),
          this.createHeaderCell('Stimulus & Nguồn tài liệu', 2000)
        ]
      }),
      ...test.parts.flatMap(p => p.questions).map(tq => {
        const meta = tq.question.contextMetadata;
        return new TableRow({
          children: [
            this.createDataCell(`Câu ${tq.globalOrderIndex}`, 700, AlignmentType.CENTER, true),
            this.createDataCell(tq.question.questionType, 1200, AlignmentType.CENTER),
            this.createDataCell(tq.question.cognitiveLevel, 800, AlignmentType.CENTER),
            this.createDataCell(meta?.phenomenon || 'Lý thuyết thuần túy', 3300, AlignmentType.LEFT),
            this.createDataCell(meta?.hasContext ? `${meta.contextType || 'PERSONAL'} / ${meta.applicationArea || 'DAILY_LIFE'}` : '-', 2000, AlignmentType.CENTER),
            this.createDataCell(meta?.stimulus ? `${meta.stimulus.type} (${meta.sourceTitle || 'N/A'})` : '-', 2000, AlignmentType.LEFT)
          ]
        });
      })
    ];

    const notesParagraphs = (cr?.feedbackNotes || [
      'Tỉ lệ bối cảnh đạt chỉ tiêu sư phạm theo định hướng đánh giá năng lực khoa học GDPT 2018.'
    ]).map(n => new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: '• ' + n, font: 'Times New Roman', size: 20 })
      ]
    }));

    const doc = new Document({
      sections: [
        {
          properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } } },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            })
          },
          children: [
            this.createDocumentHeader(
              'BÁO CÁO PHÂN TÍCH BỐI CẢNH THỰC TIỄN ĐỀ KIỂM TRA',
              `Khoa học tự nhiên ${test.grade} — Học kì: ${test.semester} — Mã đề: ${test.testCode}`
            ),
            new Paragraph({ text: '', spacing: { after: 150 } }),
            new Paragraph({
              children: [
                new TextRun({ text: 'I. TỔNG QUAN PHÂN BỔ BỐI CẢNH', bold: true, font: 'Times New Roman', size: 22 })
              ],
              spacing: { before: 150, after: 100 }
            }),
            new Table({
              rows: summaryRows,
              width: { size: 10000, type: WidthType.DXA }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'II. BẢNG CHI TIẾT BỐI CẢNH TỪNG CÂU HỎI', bold: true, font: 'Times New Roman', size: 22 })
              ],
              spacing: { before: 200, after: 100 }
            }),
            new Table({
              rows: questionRows,
              width: { size: 10000, type: WidthType.DXA }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'III. NHẬN XÉT ĐA DẠNG & ĐÁNH GIÁ SƯ PHẠM', bold: true, font: 'Times New Roman', size: 22 })
              ],
              spacing: { before: 200, after: 100 }
            }),
            ...notesParagraphs
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * 06_Traceability_Report.docx (Section 22 & Phase 7.1)
   */
  public static async exportTraceabilityReportDocx(test: TestExam): Promise<Buffer> {
    const tableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          this.createHeaderCell('Câu', 600),
          this.createHeaderCell('YCCĐ gắn kết', 2600),
          this.createHeaderCell('Mã ma trận / Đặc tả', 1600),
          this.createHeaderCell('Hiện tượng & Dạng Stimulus', 2600),
          this.createHeaderCell('Nguồn trích dẫn / URL pháp lý', 2600)
        ]
      }),
      ...test.parts.flatMap(p => p.questions).map(tq => {
        const meta = tq.question.contextMetadata;
        const trace = meta?.trace;
        const cellId = trace?.matrixCellId || `CELL_${tq.question.subjectArea}_${tq.question.cognitiveLevel}`;
        const specId = trace?.specificationId || `SPEC_${tq.question.lessonId}`;
        const source = meta?.sourceTitle || tq.question.sourceCitation?.documentName || 'Chương trình GDPT 2018';
        const url = meta?.sourceUrl ? `\n(URL: ${meta.sourceUrl})` : '';

        return new TableRow({
          children: [
            this.createDataCell(`Câu ${tq.globalOrderIndex}`, 600, AlignmentType.CENTER, true),
            this.createDataCell(tq.question.learningRequirementText || 'YCCĐ theo phân phối chương trình', 2600, AlignmentType.LEFT),
            this.createDataCell(`${cellId}\n${specId}`, 1600, AlignmentType.CENTER),
            this.createDataCell(meta?.phenomenon ? `${meta.phenomenon}\n[Stimulus: ${meta.stimulus?.type || 'TEXT'}]` : 'Kiến thức cốt lõi', 2600, AlignmentType.LEFT),
            this.createDataCell(`${source}${url}`, 2600, AlignmentType.LEFT)
          ]
        });
      })
    ];

    const doc = new Document({
      sections: [
        {
          properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } } },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 20 }),
                    new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })
                  ]
                })
              ]
            })
          },
          children: [
            this.createDocumentHeader(
              'BẢNG TRUY NGUYÊN NGUỒN GỐC & TRUY VẾT DỮ LIỆU ĐỀ KIỂM TRA',
              `Khoa học tự nhiên ${test.grade} — Chuỗi truy vết: YCCĐ → Ma trận → Đặc tả → Câu hỏi → Đề thi`
            ),
            new Paragraph({ text: '', spacing: { after: 150 } }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Formatting configured according to the referenced document-format requirements. Bảng đối chiếu minh bạch nguồn gốc bối cảnh khoa học, ngữ liệu và yêu cầu cần đạt (YCCĐ).',
                  italics: true,
                  font: 'Times New Roman',
                  size: 20
                })
              ],
              spacing: { after: 150 }
            }),
            new Table({
              rows: tableRows,
              width: { size: 10000, type: WidthType.DXA }
            })
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * Complete 6-document Examination Package Export (Phase 7.1)
   */
  public static async exportFullPackageDocx(params: {
    matrix: AssessmentMatrix;
    specification: TestSpecification;
    test: TestExam;
  }): Promise<{
    matrixDocx: Buffer;
    specDocx: Buffer;
    testDocx: Buffer;
    answerKeyDocx: Buffer;
    contextReportDocx: Buffer;
    traceabilityReportDocx: Buffer;
    scoringGuideDocx: Buffer;
  }> {
    const [
      matrixDocx,
      specDocx,
      testDocx,
      answerKeyDocx,
      contextReportDocx,
      traceabilityReportDocx,
      scoringGuideDocx
    ] = await Promise.all([
      this.exportMatrixDocx(params.matrix),
      this.exportSpecificationDocx(params.specification),
      this.exportTestDocx(params.test),
      this.exportAnswerKeyDocx(params.test),
      this.exportContextReportDocx(params.test),
      this.exportTraceabilityReportDocx(params.test),
      this.exportScoringGuideDocx(params.test)
    ]);

    return {
      matrixDocx,
      specDocx,
      testDocx,
      answerKeyDocx,
      contextReportDocx,
      traceabilityReportDocx,
      scoringGuideDocx
    };
  }

  // Helper Methods for Formatting
  private static createDocumentHeader(title: string, subtitle: string): Paragraph {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'TRƯỜNG THCS & THPT PHAN VĂN TRỊ\nTỔ KHOA HỌC TỰ NHIÊN\n',
          bold: true,
          font: 'Times New Roman',
          size: 22
        }),
        new TextRun({
          text: `\n${title}\n`,
          bold: true,
          font: 'Times New Roman',
          size: 28,
          color: '1E3A8A'
        }),
        new TextRun({
          text: subtitle,
          italics: true,
          font: 'Times New Roman',
          size: 22
        })
      ]
    });
  }

  private static createHeaderCell(text: string, width: number): TableCell {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      shading: { fill: 'E2E8F0' },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text, bold: true, font: 'Times New Roman', size: 18 })
          ]
        })
      ]
    });
  }

  private static createDataCell(
    text: string,
    width: number,
    alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
    bold: boolean = false
  ): TableCell {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      children: [
        new Paragraph({
          alignment,
          children: [
            new TextRun({ text, bold, font: 'Times New Roman', size: 18 })
          ]
        })
      ]
    });
  }
}
