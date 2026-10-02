/**
 * Script cập nhật tự động nội dung trang "Tạo đề kiểm tra" (Page ID: 2610)
 * lên website aihotrogiaovien.com thông qua WordPress REST API.
 * 
 * Cách sử dụng:
 *   node scripts/publish-to-wordpress.js [USERNAME] [APPLICATION_PASSWORD]
 * hoặc:
 *   $env:WP_USER="admin"; $env:WP_APP_PASS="xxxx xxxx xxxx xxxx"; node scripts/publish-to-wordpress.js
 */

const fs = require('fs');
const path = require('path');

const WP_URL = process.env.WP_URL || 'https://aihotrogiaovien.com';
const PAGE_ID = process.env.WP_PAGE_ID || '2610';
const WP_USER = process.argv[2] || process.env.WP_USER;
const WP_APP_PASS = process.argv[3] || process.env.WP_APP_PASS;

const htmlFilePath = path.join(__dirname, '../exports/portal/tao-de-kiem-tra.html');

async function main() {
  if (!fs.existsSync(htmlFilePath)) {
    console.error('Không tìm thấy file:', htmlFilePath);
    process.exit(1);
  }

  const content = fs.readFileSync(htmlFilePath, 'utf8');

  if (!WP_USER || !WP_APP_PASS) {
    console.log('Chưa cung cấp thông tin đăng nhập WordPress (WP_USER, WP_APP_PASS).');
    console.log('File HTML đã sẵn sàng tại:', htmlFilePath);
    console.log('Quý Thầy/Cô có thể dán nội dung file này vào Custom HTML block của trang 2610 trong WordPress Admin.');
    console.log('Hoặc chạy lệnh: node scripts/publish-to-wordpress.js <username> <application_password>');
    return;
  }

  const authHeader = 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString('base64');

  console.log(`Đang đẩy nội dung lên ${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}...`);

  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        content: content,
        status: 'publish',
      }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('✅ CẬP NHẬT TRANG THÀNH CÔNG!');
      console.log('URL:', data.link);
      console.log('Modified:', data.modified);
    } else {
      console.error('❌ Lỗi từ WordPress API:', data);
    }
  } catch (err) {
    console.error('❌ Lỗi kết nối:', err.message);
  }
}

main();
