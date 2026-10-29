import http from 'http';
import sirv from 'sirv';
import ngrok from '@ngrok/ngrok';

// 1. Static file server for dist
const serve = sirv('dist', { single: true, dev: false });
const webServer = http.createServer((req, res) => {
  serve(req, res);
});

webServer.listen(5173, '127.0.0.1', async () => {
  console.log('--------------------------------------------------');
  console.log('🌸 SweetJourney Web Server running on 127.0.0.1:5173');
  console.log('--------------------------------------------------');

  try {
    const session = await new ngrok.SessionBuilder()
      .authtoken('3LJP47CaIa72RoZYT67m8qXSCPp_MNJDRk5LYeyib7BUf6UF')
      .connect();

    const listener = await session.httpEndpoint()
      .domain('outclass-alkaline-untwist.ngrok-free.dev')
      .listen();

    console.log('🚀 Ngrok Tunnel is LIVE!');
    console.log(`🔗 Public URL: ${listener.url()}`);
    console.log('--------------------------------------------------');

    await listener.forward('http://127.0.0.1:5173');
  } catch (err) {
    console.error('Ngrok error:', err);
  }
});

// Keep process active
setInterval(() => {}, 1000 * 60 * 60);
