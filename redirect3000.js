import http from 'http';

const TARGET = 'https://outclass-alkaline-untwist.ngrok-free.dev';

const server = http.createServer((req, res) => {
  console.log(`[Redirect Server 3000] Received request: ${req.url}`);

  // HTML page that captures client-side URL hash (#access_token=...) and redirects to ngrok target
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>กำลังพากลับสู่แอพ SweetJourney 💕</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #fff1f2;">
  <div style="background: white; max-width: 450px; margin: 0 auto; padding: 30px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <h2 style="color: #e11d48; margin-bottom: 10px;">ยืนยันอีเมลสำเร็จแล้ว! 💖</h2>
    <p style="color: #64748b; font-size: 14px;">กำลังนำคุณเข้าสู่หน้าแอพพลิเคชั่น...</p>
  </div>
  <script>
    // Forward full path, query, and hash (tokens) to ngrok domain
    const targetUrl = "${TARGET}" + window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(targetUrl);
  </script>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(3000, () => {
  console.log('-------------------------------------------------------');
  console.log('⚡ Redirect Server listening on http://localhost:3000');
  console.log(`Forwarding all email confirmation links to ${TARGET}`);
  console.log('-------------------------------------------------------');
});
