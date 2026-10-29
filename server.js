import http from 'http';
import sirv from 'sirv';
import ngrok from '@ngrok/ngrok';

// 1. Static file server for dist
const serve = sirv('dist', { single: true, dev: false });
const webServer = http.createServer((req, res) => {
  serve(req, res);
});

webServer.listen(5173, async () => {
  console.log('--------------------------------------------------');
  console.log('🌸 SweetJourney Web Server running on port 5173');
  console.log('--------------------------------------------------');

  // 2. Connect Ngrok tunnel
  try {
    const listener = await ngrok.forward({
      addr: 5173,
      authtoken: '3LJP47CaIa72RoZYT67m8qXSCPp_MNJDRk5LYeyib7BUf6UF',
      domain: 'outclass-alkaline-untwist.ngrok-free.dev'
    });
    console.log('🚀 Ngrok Tunnel is LIVE!');
    console.log(`🔗 Public URL: ${listener.url()}`);
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('Ngrok error:', err);
  }
});

// Keep process active
setInterval(() => {}, 1000 * 60 * 60);
