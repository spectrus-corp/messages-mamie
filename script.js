let currentSession = null;
let isAdmin = false;

const messages = [
  { id: "bonjour", label: "Bonjour ❤️", file: null },
  { id: "nuit", label: "Bonne nuit 🌙", file: null },
  { id: "bisou", label: "Bisou 😘", file: null },
  { id: "souvenir", label: "Souvenir 💭", file: null },
  { id: "blague", label: "Blague 😂", file: null }
];

function loadSession() {
  const saved = localStorage.getItem('mamieSession');
  if (saved) {
    currentSession = JSON.parse(saved);
    isAdmin = localStorage.getItem('isAdmin') === 'true';
    showMainInterface();
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="text-center mt-12">
      <h1 class="title text-5xl text-[#c48b9f] mb-8">Messages pour Mamie</h1>
      
      <div class="space-y-4">
        <button onclick="chooseMode('proche')" class="w-full bg-[#e8c4d0] hover:bg-[#d8a8b8] text-white py-6 rounded-3xl text-2xl font-medium shadow-lg">
          Je suis un proche
        </button>
        <button onclick="chooseMode('moi')" class="w-full bg-[#a8c4b8] hover:bg-[#88a898] text-white py-6 rounded-3xl text-2xl font-medium shadow-lg">
          Je suis Moi
        </button>
      </div>
    </div>
  `;
}

function chooseMode(mode) {
  const app = document.getElementById('app');
  const isMoi = mode === 'moi';
  
  app.innerHTML = `
    <div class="max-w-md mx-auto mt-10 bg-white rounded-3xl shadow-xl p-8">
      <h2 class="text-3xl text-center mb-6 text-[#c48b9f]">${isMoi ? "Mode Moi" : "Mode Proche"}</h2>
      
      <input type="text" id="sessionNum" maxlength="4" placeholder="Numéro de session (4 chiffres)" 
             class="w-full p-4 border rounded-2xl mb-4 text-center text-xl">
      
      <input type="password" id="password" maxlength="4" placeholder="${isMoi ? 'PIN Admin (4 chiffres)' : 'Mot de passe Proche'}" 
             class="w-full p-4 border rounded-2xl mb-6 text-center text-xl">
      
      <button onclick="${isMoi ? 'loginAdmin()' : 'loginProche()'}" 
              class="w-full py-5 bg-[#c48b9f] hover:bg-[#b37a8e] text-white rounded-3xl text-xl">
        Se connecter
      </button>
      
      <button onclick="showLoginScreen()" class="mt-4 text-gray-500">Retour</button>
    </div>
  `;
}

function loginProche() {
  const num = document.getElementById('sessionNum').value;
  const pass = document.getElementById('password').value;
  
  if (num.length !== 4 || pass.length !== 4) {
    alert("Le numéro et le mot de passe doivent faire 4 chiffres");
    return;
  }
  
  currentSession = { number: num, prochePass: pass };
  isAdmin = false;
  saveAndShow();
}

function loginAdmin() {
  const num = document.getElementById('sessionNum').value;
  const pin = document.getElementById('password').value;
  
  if (num.length !== 4 || pin.length !== 4) {
    alert("Le numéro et le PIN doivent faire 4 chiffres");
    return;
  }
  
  currentSession = { number: num, adminPin: pin };
  isAdmin = true;
  localStorage.setItem('isAdmin', 'true');
  saveAndShow();
}

function saveAndShow() {
  localStorage.setItem('mamieSession', JSON.stringify(currentSession));
  showMainInterface();
}

function showMainInterface() {
  const app = document.getElementById('app');
  let html = `
    <div class="text-center">
      <h1 class="title text-4xl text-[#c48b9f] mb-2">Messages Mamie</h1>
      <p class="text-sm text-gray-500 mb-8">Session n°${currentSession.number}</p>
      
      <div class="grid grid-cols-1 gap-4">
  `;

  messages.forEach(msg => {
    html += `
      <div class="bg-white rounded-3xl p-5 shadow flex justify-between items-center">
        <button onclick="playAudio('${msg.id}')" 
                class="flex-1 text-left font-medium text-xl text-[#5a4a5a]">
          ${msg.label}
        </button>
        ${isAdmin ? `
          <label class="cursor-pointer bg-[#f0d9e0] px-5 py-3 rounded-2xl text-sm">
            Changer audio
            <input type="file" accept=".mp3,.m4a,.wav,audio/*" class="hidden" 
                   onchange="uploadAudio('${msg.id}', this)">
          </label>
        ` : ''}
      </div>
    `;
  });

  html += `</div></div>`;
  app.innerHTML = html;
}

function uploadAudio(id, input) {
  const file = input.files[0];
  if (!file) return;

  const allowed = ['.mp3', '.m4a', '.wav'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  
  if (!allowed.includes(ext)) {
    alert("Seuls les fichiers .mp3, .m4a et .wav sont acceptés");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    localStorage.setItem(`audio_${id}`, e.target.result);
    alert(`✅ Fichier ${file.name} mis à jour avec succès pour "${id}" !`);
    showMainInterface();
  };
  reader.readAsDataURL(file);
}

function playAudio(id) {
  const audioData = localStorage.getItem(`audio_${id}`);
  if (!audioData) {
    alert("Aucun audio enregistré pour ce bouton. Va en mode Moi pour en ajouter.");
    return;
  }
  const audio = new Audio(audioData);
  audio.play().catch(err => alert("Impossible de lire l'audio"));
}

loadSession();