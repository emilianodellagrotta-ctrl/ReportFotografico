# Istruzioni PWA - Photo Report App

## File da Aggiungere

1. **manifest.json** - Salva nella root della cartella app
2. **service-worker.js** - Salva nella root della cartella app

## Modifiche a index.html

Aggiungi questi tag nel `<head>` di index.html PRIMA di app.js:

```html
<!-- PWA Manifest -->
<link rel="manifest" href="manifest.json">

<!-- Meta Tags PWA -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="description" content="App per creare report fotografici con tag colorati">
<meta name="theme-color" content="#1a73e8">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect fill='%231a73e8' width='180' height='180'/><text x='50%' y='50%' font-size='108' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='central'>📸</text></svg>">

<!-- Service Worker Registration -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registrato:', registration.scope);
        })
        .catch(function(error) {
          console.log('Errore registrazione Service Worker:', error);
        });
    });
  }
</script>
```

## Struttura Cartella

```
photo-report-app/
├── index.html
├── app.js
├── styles.css
├── manifest.json (NUOVO)
└── service-worker.js (NUOVO)
```

## Vantaggi PWA

✅ **Installabile** - Aggiungi alla home screen (iOS/Android)
✅ **Offline** - Funziona senza internet grazie al service worker
✅ **App-like** - Interfaccia simile a app nativa (no URL bar)
✅ **Fast** - Cache automatica dei file essenziali
✅ **Responsive** - Funziona su tutti i dispositivi

## Come Testare

### Chrome/Edge Desktop:
1. Apri DevTools (F12)
2. Vai a Application → Manifest
3. Verifica che manifest sia valido ✓
4. Vai a Application → Service Workers
5. Verifica che service worker sia "activated" ✓

### Installazione:
1. Apri l'app in Chrome/Edge
2. Clicca sull'icona "Install" (in alto a destra)
3. Conferma installazione
4. L'app si apre nella sua finestra standalone

### Test Offline:
1. Installa l'app
2. Apri DevTools → Application → Service Workers
3. Spunta "Offline"
4. Ricarica la pagina
5. L'app continua a funzionare offline!

## Requisiti PWA

✅ HTTPS (su deployment)
✅ Manifest.json valido
✅ Service worker registrato
✅ Icons per home screen
✅ Responsive design (già implementato)

## Note

- Sviluppo locale: funziona su localhost (HTTP ok per debug)
- Deployment: richiede HTTPS per funzionare completamente
- I dati (localStorage) rimangono disponibili offline
- Il service worker auto-aggiorna quando ricarichi da online

## File Sources

- `manifest.json`: Metadati app, icons SVG inline, theme color
- `service-worker.js`: Cache-first strategy, offline fallback
- Meta tags: PWA capability per iOS/Android
