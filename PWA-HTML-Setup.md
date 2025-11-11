<!-- AGGIUNGI QUESTO NEL <head> DI index.html -->

<!-- PWA Manifest -->
<link rel="manifest" href="manifest.json">

<!-- Meta Tags per PWA -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="description" content="App per creare report fotografici con tag colorati, export PDF e DOCX">
<meta name="theme-color" content="#1a73e8">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<!-- Apple Touch Icon (Nera con R grigio satinato) -->
<link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23d3d3d3;stop-opacity:1' /><stop offset='100%' style='stop-color:%238a8a8a;stop-opacity:1' /></linearGradient></defs><rect fill='%23000000' width='180' height='180'/><text x='50%' y='50%' font-size='108' font-weight='bold' fill='url(%23grad)' text-anchor='middle' dominant-baseline='central' font-family='Arial, sans-serif'>R</text></svg>">

<!-- AGGIUNGI QUESTO SCRIPT PRIMA DI CHIUDERE IL </body> (dopo app.js) -->

<script>
  // Registrazione Service Worker per PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registrato correttamente');
        })
        .catch(function(error) {
          console.log('Errore nella registrazione Service Worker:', error);
        });
    });
  }
</script>
