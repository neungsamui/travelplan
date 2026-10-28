import ngrok from '@ngrok/ngrok';

async function startTunnel() {
  try {
    console.log('Connecting to ngrok with custom dev domain...');
    const listener = await ngrok.forward({
      addr: 5173,
      authtoken: '3LJP47CaIa72RoZYT67m8qXSCPp_MNJDRk5LYeyib7BUf6UF',
      domain: 'outclass-alkaline-untwist.ngrok-free.dev'
    });

    console.log('--------------------------------------------------');
    console.log('🚀 Ngrok Tunnel is LIVE!');
    console.log(`🔗 Public URL: ${listener.url()}`);
    console.log('--------------------------------------------------');

    // Keep process alive indefinitely
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (err) {
    console.error('Ngrok error:', err);
  }
}

startTunnel();
