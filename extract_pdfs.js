const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function parsePdf(filePath, outPath) {
    try {
        const buffer = fs.readFileSync(filePath);
        const parser = new PDFParse(new Uint8Array(buffer));
        const result = await parser.getText();
        const text = typeof result === 'string' ? result : (result.text || JSON.stringify(result));
        fs.writeFileSync(outPath, text, 'utf8');
        console.log(`Successfully extracted ${filePath} -> ${outPath} (${text.length} chars)`);
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e.message);
    }
}

async function run() {
    await parsePdf('984_CV-Huong_dan_kiem_tra_cuoi_ki_II-Nam_hoc_2025-2026_4a8e3.pdf', 'extracted_cv_984.txt');
    await parsePdf('cong-van-7991-huong-dan-KiemTraDanhGia.pdf', 'extracted_cv_7991.txt');
}

run();
