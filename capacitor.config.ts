import type { CapacitorConfig } from '@capacitor/cli';

// ⚙️ Remplace l'URL ci-dessous par l'URL Lovable de TON app une fois publiée
// (ex: https://messages-famille.lovable.app)
const LIVE_URL = 'https://REMPLACE-MOI.lovable.app';

const config: CapacitorConfig = {
  appId: 'app.lovable.famille', // identifiant unique (à personnaliser, ex: com.dupont.famille)
  appName: 'Famille',            // nom affiché sous l'icône
  webDir: 'dist',                // dossier de build statique (fallback hors-ligne)
  server: {
    // Charge la version en ligne → toute mise à jour publiée sur Lovable
    // apparaît instantanément dans l'app, sans repasser par le store.
    url: LIVE_URL,
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#fdf6f0',
  },
  android: {
    backgroundColor: '#fdf6f0',
  },
};

export default config;
