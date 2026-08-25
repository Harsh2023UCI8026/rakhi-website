// Navigation router
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  // Init card canvas if switching to gift 2
  if (screenId === 'gift-2-screen') {
    initScratchCanvas();
  }
}

function openGift(giftNumber) {
  showScreen(`gift-${giftNumber}-screen`);
  if (giftNumber === 4) {
    const video = document.getElementById('shinchanVideo');
    if (video) {
      video.play().catch(() => {});
    }
  }
}

function closeVideoAndShowGifts() {
  const video = document.getElementById('shinchanVideo');
  if (video) {
    video.pause();
    video.currentTime = 0;
  }
  showScreen('gifts-screen');
}

// -------------------------------------------------------------
// 1. Evasive Exit Button Logic
// -------------------------------------------------------------
const exitBtn = document.getElementById('exitBtn');
const landingCard = document.querySelector('.landing-card');

function moveExitBtn() {
  if (!exitBtn || !landingCard) return;

  const cardRect = landingCard.getBoundingClientRect();
  const btnRect = exitBtn.getBoundingClientRect();

  // Calculate maximum offsets inside or slightly outside the card
  const maxX = cardRect.width - btnRect.width - 40;
  const maxY = cardRect.height - btnRect.height - 40;

  const randomX = Math.max(20, Math.floor(Math.random() * maxX));
  const randomY = Math.max(20, Math.floor(Math.random() * maxY));

  exitBtn.style.position = 'absolute';
  exitBtn.style.left = `${randomX}px`;
  exitBtn.style.top = `${randomY}px`;
}

if (exitBtn) {
  exitBtn.addEventListener('mouseenter', moveExitBtn);
  exitBtn.addEventListener('mouseover', moveExitBtn);
  exitBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveExitBtn();
  });
  exitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveExitBtn();
  });
}

// Start Button Nav
const startBtn = document.getElementById('startBtn');
if (startBtn) {
  startBtn.addEventListener('click', () => showScreen('gifts-screen'));
}

// -------------------------------------------------------------
// 2. Scratch Canvas (Gift 2) Logic
// -------------------------------------------------------------
let scratchCanvasInitialized = false;

function initScratchCanvas() {
  const canvas = document.getElementById('scratchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.classList.remove('fade-out');

  function drawCover() {
    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#e0e0e0');
    grad.addColorStop(0.5, '#999999');
    grad.addColorStop(1, '#cccccc');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH HERE ✨', canvas.width / 2, canvas.height / 2 + 6);
  }

  drawCover();

  let isDrawing = false;

  function scratch(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  }

  function checkScratchPercentage() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    if (transparent / (canvas.width * canvas.height) > 0.40) {
      canvas.classList.add('fade-out');
    }
  }

  if (!scratchCanvasInitialized) {
    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; });
    canvas.addEventListener('touchend', () => isDrawing = false);
    canvas.addEventListener('touchmove', scratch);
    scratchCanvasInitialized = true;
  }
}

// Rakhi tied success logic
const rakhi = document.getElementById('rakhiImg');
const handBox = document.getElementById('handBox');
const dropZone = document.getElementById('dropZone');
const successMsg = document.getElementById('successMsg');
const resetBtn = document.getElementById('resetBtn');

let isTied = false;

if (rakhi && handBox) {
  // Desktop Drag & Drop
  rakhi.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'rakhi');
    setTimeout(() => rakhi.style.opacity = '0.4', 0);
  });

  rakhi.addEventListener('dragend', () => {
    rakhi.style.opacity = '1';
  });

  handBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(255, 71, 87, 0.3)';
  });

  handBox.addEventListener('dragleave', () => {
    dropZone.style.background = 'rgba(255, 71, 87, 0.12)';
  });

  handBox.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!isTied) tieRakhi();
  });

  // Click / Tap Option
  rakhi.addEventListener('click', () => {
    if (!isTied) tieRakhi();
  });

  // Mobile Touch Dragging
  let activeTouch = false;

  rakhi.addEventListener('touchstart', (e) => {
    activeTouch = true;
    rakhi.style.position = 'fixed';
    rakhi.style.zIndex = '1000';
  }, { passive: true });

  rakhi.addEventListener('touchmove', (e) => {
    if (!activeTouch) return;
    const touch = e.touches[0];
    rakhi.style.left = `${touch.clientX - 65}px`;
    rakhi.style.top = `${touch.clientY - 40}px`;
  }, { passive: true });

  rakhi.addEventListener('touchend', (e) => {
    activeTouch = false;
    const rect = handBox.getBoundingClientRect();
    const lastTouch = e.changedTouches[0];

    if (
      lastTouch.clientX >= rect.left &&
      lastTouch.clientX <= rect.right &&
      lastTouch.clientY >= rect.top &&
      lastTouch.clientY <= rect.bottom
    ) {
      tieRakhi();
    } else {
      rakhi.style.position = 'static';
    }
  });
}

function tieRakhi() {
  isTied = true;
  if (rakhi) rakhi.style.display = 'none';
  if (dropZone) dropZone.style.display = 'none';

  const tied = document.createElement('img');
  tied.src = rakhi.src;
  tied.className = 'tied-rakhi';
  tied.id = 'activeTiedRakhi';
  handBox.appendChild(tied);

  if (successMsg) successMsg.style.display = 'block';
  if (resetBtn) resetBtn.style.display = 'inline-block';

  // Confetti Burst
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function resetRakhi() {
  isTied = false;
  const currentRakhi = document.getElementById('activeTiedRakhi');
  if (currentRakhi) currentRakhi.remove();

  if (rakhi) {
    rakhi.style.display = 'block';
    rakhi.style.position = 'static';
  }
  if (dropZone) dropZone.style.display = 'flex';
  if (successMsg) successMsg.style.display = 'none';
  if (resetBtn) resetBtn.style.display = 'none';
}

// -------------------------------------------------------------
// Flower & Heart Burst Click Shoutout Effect
// -------------------------------------------------------------
const flowers = ['🌸', '🌺', '🌻', '🌼', '🌷', '💖', '✨', '🌹'];

document.addEventListener('click', (e) => {
  createFlowerShoutout(e.clientX, e.clientY);
});

document.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches[0]) {
    createFlowerShoutout(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

function createFlowerShoutout(x, y) {
  const count = 12;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'flower-shoutout';
    el.innerText = flowers[Math.floor(Math.random() * flowers.length)];
    
    const angle = (Math.PI * 2 / count) * i;
    const velocity = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity - 30;
    
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

