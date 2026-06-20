# 📱 Transformer l'app en vraie app iOS / Android

Ce projet est déjà une **PWA** (installable depuis le navigateur). Pour en faire une vraie app publiable sur l'**App Store** et le **Google Play Store**, on l'emballe avec **Capacitor**.

Tu peux travailler sur **Mac** (obligatoire pour iOS) ou **Windows/Linux** (Android uniquement).

---

## 0. Pré-requis

- **Node.js 20+** installé
- **Xcode** (pour iOS, Mac uniquement) + compte Apple Developer (99 $/an)
- **Android Studio** (pour Android) + compte Google Play Console (25 $ une fois)
- Le projet exporté depuis Lovable vers GitHub puis cloné en local

---

## 1. Publie ton app sur Lovable

Clique sur **Publish** dans Lovable. Tu obtiens une URL du type :
```
https://mon-projet.lovable.app
```
👉 Ouvre `capacitor.config.ts` et remplace `https://REMPLACE-MOI.lovable.app` par cette URL.
Personnalise aussi `appId` (ex: `com.dupont.famille`) et `appName`.

---

## 2. Installe Capacitor en local

Dans le dossier du projet :

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
mkdir -p dist && echo "<!doctype html><title>Famille</title>" > dist/index.html
```

> Le `dist/` est juste un fallback ; l'app charge la version en ligne via `server.url`.

---

## 3. Ajoute les plateformes natives

```bash
npx cap add ios
npx cap add android
npx cap sync
```

Cela crée deux dossiers : `ios/` et `android/`.

---

## 4. Ajoute les icônes & splash screens

Place une icône **1024×1024 PNG** dans `resources/icon.png` et un splash **2732×2732** dans `resources/splash.png`, puis :

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate
```

L'image `public/icon-512.png` du projet peut servir de base (à upscaler en 1024).

---

## 5a. Builder pour iOS (Mac uniquement)

```bash
npx cap open ios
```
Xcode s'ouvre. Dans **Signing & Capabilities**, choisis ton équipe Apple Developer, puis **Product → Archive → Distribute App → App Store Connect**.

---

## 5b. Builder pour Android

```bash
npx cap open android
```
Android Studio s'ouvre. **Build → Generate Signed Bundle (.aab)**, puis upload sur la **Google Play Console**.

---

## 🔄 Mise à jour de l'app après publication

Comme l'app charge l'URL Lovable :
- Toute modif publiée sur Lovable est **visible immédiatement** dans l'app installée.
- Tu n'as **PAS** besoin de re-soumettre au store pour changer un texte, une couleur, ou ajouter un bouton.
- Tu re-soumets uniquement si tu changes l'icône, le nom natif, ou ajoutes des fonctionnalités natives (notifications push, etc.).

---

## 🧩 Alternative ultra-rapide : PWABuilder

Pour Android seulement, sans Android Studio :
1. Va sur [pwabuilder.com](https://www.pwabuilder.com)
2. Colle ton URL Lovable
3. Clique **Package for stores → Android**
4. Tu reçois un `.aab` prêt pour le Play Store

iOS n'est pas supporté par PWABuilder → il faut passer par Capacitor + Xcode.
