// Messages pour Mamie - Script principal

let currentSession = null;
let isAdminMode = false;

// Configuration par défaut (stockée en localStorage)
const DEFAULT_CONFIG = {
    sessionNumber: null,
    prochePassword: null,
    adminPIN: null
};

function saveConfig(config) {
    localStorage.setItem('mamieConfig', JSON.stringify(config));
}

function loadConfig() {
    const saved = localStorage.getItem('mamieConfig');
    return saved ? JSON.parse(saved) : { ...DEFAULT_CONFIG };
}

function chooseMode(mode) {
    document.getElementById('login-screen').classList.add('hidden');
    const main = document.getElementById('main-app');
    main.classList.remove('hidden');

    if (mode === 'proche') {
        showProcheLogin();
    } else {
        showAdminLogin();
    }
}

function showProcheLogin() {
    const main = document.getElementById('main-app');
    main.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-6">
            <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10">
                <h2 class="text-3xl text-center title-font text-rose-600 mb-8">Mode Proche ❤️</h2>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de session (4 chiffres)</label>
                        <input id="session-num" type="text" maxlength="4" class="w-full px-5 py-4 text-2xl text-center border border-gray-200 rounded-2xl focus:outline-none focus:border-rose-400">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe Proche</label>
                        <input id="proche-pass" type="password" maxlength="10" class="w-full px-5 py-4 text-xl border border-gray-200 rounded-2xl focus:outline-none focus:border-rose-400">
                    </div>
                    <button onclick="loginProche()" class="w-full py-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xl font-medium rounded-2xl shadow-lg hover:brightness-105 transition-all">
                        Se connecter
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showAdminLogin() {
    const main = document.getElementById('main-app');
    main.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-6">
            <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10">
                <h2 class="text-3xl text-center title-font text-amber-600 mb-8">Mode Moi (Admin)</h2>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de session (4 chiffres)</label>
                        <input id="admin-session" type="text" maxlength="4" class="w-full px-5 py-4 text-2xl text-center border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-400">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">PIN Admin (4 chiffres)</label>
                        <input id="admin-pin" type="password" maxlength="4" class="w-full px-5 py-4 text-2xl text-center border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-400">
                    </div>
                    <button onclick="loginAdmin()" class="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xl font-medium rounded-2xl shadow-lg hover:brightness-105 transition-all">
                        Accéder à l'administration
                    </button>
                </div>
            </div>
        </div>
    `;
}

function loginProche() {
    const sessionNum = document.getElementById('session-num').value;
    const pass = document.getElementById('proche-pass').value;
    const config = loadConfig();

    if (!config.sessionNumber || sessionNum !== config.sessionNumber || pass !== config.prochePassword) {
        alert("Numéro de session ou mot de passe incorrect.");
        return;
    }

    currentSession = sessionNum;
    isAdminMode = false;
    saveSessionState();
    loadMainApp();
}

function loginAdmin() {
    const sessionNum = document.getElementById('admin-session').value;
    const pin = document.getElementById('admin-pin').value;
    const config = loadConfig();

    if (!config.sessionNumber || sessionNum !== config.sessionNumber || pin !== config.adminPIN) {
        alert("Numéro ou PIN incorrect.");
        return;
    }

    currentSession = sessionNum;
    isAdminMode = true;
    saveSessionState();
    loadMainApp();
}

function saveSessionState() {
    localStorage.setItem('mamieSession', JSON.stringify({
        sessionNumber: currentSession,
        isAdmin: isAdminMode,
        timestamp: Date.now()
    }));
}

function checkPersistentSession() {
    const saved = localStorage.getItem('mamieSession');
    if (saved) {
        const data = JSON.parse(saved);
        currentSession = data.sessionNumber;
        isAdminMode = data.isAdmin;
        loadMainApp();
        return true;
    }
    return false;
}

function loadMainApp() {
    const main = document.getElementById('main-app');
    const config = loadConfig();

    let html = `
        <div class="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6">
            <div class="max-w-2xl mx-auto">
                <div class="text-center mb-10">
                    <h1 class="text-5xl title-font text-rose-600 mb-3">Bonjour Mamie 💕</h1>
                    <p class="text-xl text-gray-600">Session #${currentSession}</p>
                    ${isAdminMode ? '<p class="text-amber-600 font-medium">Mode Administration activé</p>' : ''}
                </div>
    `;

    if (isAdminMode) {
        html += adminPanel();
    } else {
        html += prochePanel();
    }

    html += `</div></div>`;
    main.innerHTML = html;
}

function prochePanel() {
    return `
        <div class="grid grid-cols-1 gap-6">
            ${createAudioButton('Bonjour', 'bonjour.mp3', '🌅')}
            ${createAudioButton('Bonne nuit', 'nuit.mp3', '🌙')}
            ${createAudioButton('Bisou', 'bisou.mp3', '😘')}
            ${createAudioButton('Souvenir', 'souvenir.mp3', '📸')}
            ${createAudioButton('Blague', 'blague.mp3', '🤣')}
        </div>
        <div class="mt-12 text-center">
            <p class="text-gray-500 text-sm">Appuie sur les boutons pour écouter les messages</p>
        </div>
    `;
}

function adminPanel() {
    return `
        <div class="bg-white rounded-3xl p-8 shadow-xl">
            <h2 class="text-2xl font-medium mb-6 text-amber-700">Gestion des messages audio</h2>
            <div class="space-y-8">
                ${createUploadSection('Bonjour', 'bonjour.mp3')}
                ${createUploadSection('Bonne nuit', 'nuit.mp3')}
                ${createUploadSection('Bisou', 'bisou.mp3')}
                ${createUploadSection('Souvenir', 'souvenir.mp3')}
                ${createUploadSection('Blague', 'blague.mp3')}
            </div>
            <div class="mt-10 pt-6 border-t text-center">
                <p class="text-rose-500 text-sm">Une fois connecté en mode Moi, tu restes connecté pour toujours sur cet appareil.</p>
            </div>
        </div>
    `;
}

function createAudioButton(name, file, emoji) {
    return `
        <button onclick="playAudio('${file}')" 
                class="card w-full bg-white p-8 rounded-3xl shadow-lg flex items-center gap-6 hover:bg-pink-50 group">
            <div class="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-4xl group-active:scale-110 transition-transform">
                ${emoji}
            </div>
            <div>
                <p class="text-2xl font-medium text-gray-800">${name}</p>
                <p class="text-gray-500">Écouter le message</p>
            </div>
        </button>
    `;
}

function createUploadSection(name, file) {
    return `
        <div class="border border-dashed border-gray-300 rounded-2xl p-6 hover:border-rose-300 transition-colors">
            <p class="font-medium mb-3">${name}</p>
            <input type="file" accept="audio/*" id="upload-${file}" class="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100">
            <button onclick="uploadAudio('${file}')" class="mt-4 px-8 py-3 bg-rose-500 text-white rounded-2xl text-sm font-medium">
                Mettre à jour l'audio
            </button>
        </div>
    `;
}

function playAudio(filename) {
    // Pour le moment simulation - plus tard avec vrais fichiers
    const audio = new Audio(`audios/${filename}`);
    audio.play().catch(() => alert(`Lecture de ${filename} (fichier à ajouter dans le dossier audios)`));
}

function uploadAudio(filename) {
    const input = document.getElementById(`upload-${filename}`);
    if (input.files.length > 0) {
        alert(`Fichier ${filename} mis à jour ! (Dans une vraie version, il serait uploadé sur le serveur)`);
        // Ici on pourrait gérer le stockage des fichiers audio
    }
}

function showCreateSession() {
    const code = prompt("Choisis un numéro de session (4 chiffres) :");
    if (!code || code.length !== 4 || isNaN(code)) {
        alert("Le numéro doit contenir exactement 4 chiffres.");
        return;
    }

    const prochePass = prompt("Choisis un mot de passe pour les proches :");
    if (!prochePass) return;

    const adminPin = prompt("Choisis un PIN Admin (4 chiffres) pour toi :");
    if (!adminPin || adminPin.length !== 4 || isNaN(adminPin)) {
        alert("Le PIN doit contenir exactement 4 chiffres.");
        return;
    }

    const config = {
        sessionNumber: code,
        prochePassword: prochePass,
        adminPIN: adminPin
    };

    saveConfig(config);
    alert(`✅ Session #${code} créée avec succès !\n\nTu peux maintenant te connecter.`);
    location.reload();
}

// Initialisation
window.onload = function() {
    if (!checkPersistentSession()) {
        // Show login screen by default
    }
};