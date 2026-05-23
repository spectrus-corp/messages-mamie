let currentSession = null;

function createUploadSection(name, file) {
  return `
    <div class="border border-dashed border-gray-300 rounded-2xl p-6">
      <p class="font-medium mb-3">${name}</p>

      <input
        type="file"
        accept="audio/*"
        id="upload-${file}"
        class="block w-full"
      >

      <button
        onclick="uploadAudio('${file}', document.getElementById('upload-${file}'))"
        class="mt-4 px-8 py-3 bg-rose-500 text-white rounded-2xl"
      >
        Mettre à jour
      </button>
    </div>
  `;
}

function uploadAudio(id, input) {
  const file = input.files[0];

  if (!file) {
    alert('Choisis un fichier audio');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    localStorage.setItem(`audio_${id}`, e.target.result);

    alert('Audio enregistré ✅');
  };

  reader.readAsDataURL(file);
}

function playAudio(filename) {
  const localAudio = localStorage.getItem(`audio_${filename}`);

  const audio = new Audio(
    localAudio || `audios/${filename}`
  );

  audio.play().catch(() => {
    alert(`Impossible de lire ${filename}`);
  });
}

function showCreateSession() {
  const code = prompt('Choisis un numéro de session (4 chiffres) :');

  if (!code || code.length !== 4 || isNaN(code)) {
    alert('Le numéro doit contenir 4 chiffres');
    return;
  }

  const prochePass = prompt('Mot de passe proche :');

  const adminPin = prompt('PIN admin :');

  if (!adminPin || adminPin.length !== 4 || isNaN(adminPin)) {
    alert('PIN invalide');
    return;
  }

  saveConfig({
    sessionNumber: code,
    prochePassword: prochePass,
    adminPIN: adminPin
  });

  alert('Session créée ✅');
}

window.onload = () => {
  renderHome();
};