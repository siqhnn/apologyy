// Apology Mini App with Interactive Decisions & Photo Memories Slider
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Telegram WebApp
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor('#06020c');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#06020c');
  }

  const urlParams = new URLSearchParams(window.location.search);
  const targetChatId = urlParams.get('to') || urlParams.get('chat_id') || CONFIG.DANIL_CHAT_ID;

  // DOM Elements
  const screenLetter = document.getElementById('screen-letter');
  const screenDeclined = document.getElementById('screen-declined');
  const screenAccepted = document.getElementById('screen-accepted');

  const btnAccept = document.getElementById('btn-accept');
  const btnDecline = document.getElementById('btn-decline');

  // Declined Screen Elements
  const declineReasonInput = document.getElementById('decline-reason-input');
  const declineCharCount = document.getElementById('decline-char-count');
  const btnSendDeclineReason = document.getElementById('btn-send-decline-reason');
  const declineStatusMessage = document.getElementById('decline-status-message');
  const btnBackToLetter = document.getElementById('btn-back-to-letter');

  // Accepted Screen Elements
  const acceptReplyInput = document.getElementById('accept-reply-input');
  const acceptCharCount = document.getElementById('accept-char-count');
  const btnSendAcceptReply = document.getElementById('btn-send-accept-reply');
  const acceptStatusMessage = document.getElementById('accept-status-message');

  // --- 2. MULTI-LAYER ATMOSPHERIC CANVAS ---
  const canvas = document.getElementById('ambientCanvas');
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Twinkling Stars
  class Star {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.6 + 0.6;
      this.baseAlpha = Math.random() * 0.5 + 0.2;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    draw() {
      this.twinkleOffset += this.twinkleSpeed;
      const alpha = this.baseAlpha + Math.sin(this.twinkleOffset) * 0.25;
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#e0aaff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Falling Neon Hearts & Petals
  const particleColors = ['#ff2a85', '#ff007f', '#ff758f', '#ff4d94', '#e0aaff', '#b5179e'];
  class FloatingParticle {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 14 + 8;
      this.speedY = Math.random() * 1.4 + 0.6;
      this.swaySpeed = Math.random() * 0.025 + 0.01;
      this.swayAmount = Math.random() * 2 + 1;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.rotation = (Math.random() - 0.5) * 0.4;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
      this.opacity = Math.random() * 0.55 + 0.35;
      this.isPetal = Math.random() > 0.6;
    }

    update() {
      this.y += this.speedY;
      this.swayOffset += this.swaySpeed;
      this.x += Math.sin(this.swayOffset) * this.swayAmount;
      this.rotation += this.rotSpeed;
      if (this.y > height + 35) this.reset();
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = this.color;

      const s = this.size;
      ctx.beginPath();
      if (this.isPetal) {
        ctx.ellipse(0, 0, s * 0.45, s * 0.75, Math.PI / 4, 0, Math.PI * 2);
      } else {
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
        ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  const stars = Array.from({ length: 45 }, () => new Star());
  const particles = Array.from({ length: 35 }, () => new FloatingParticle(true));

  function renderScene() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < stars.length; i++) stars[i].draw();
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(renderScene);
  }
  renderScene();

  // --- 3. TELEGRAM BOT DISPATCHER ---
  async function sendTelegramNotification(text) {
    const chatId = targetChatId;
    if (!chatId) {
      console.warn('Chat ID is not configured.');
      return { ok: false, error: 'no_chat_id' };
    }

    const url = `https://api.telegram.org/bot${CONFIG.NOTIFY_BOT_TOKEN}/sendMessage`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
      return await response.json();
    } catch (err) {
      console.error('Failed to notify bot:', err);
      return { ok: false, error: err };
    }
  }

  // --- 4. BRANCH A: CLICK "НЕТ, НЕ ПРОЩУ" ---
  btnDecline.addEventListener('click', () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('warning');
    }

    const timeNow = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    sendTelegramNotification(
      `⚠️ <b>ОНА НАЖАЛА «НЕТ, НЕ ПРОЩУ»...</b>\n\n` +
      `💔 Она открыла форму и сейчас пишет причину.\n` +
      `⏰ Время: ${timeNow}`
    );

    // Switch screen to Declined
    screenLetter.classList.remove('active');
    screenLetter.classList.add('hidden');

    setTimeout(() => {
      screenDeclined.classList.remove('hidden');
      screenDeclined.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  });

  // Typing character count for decline reason
  declineReasonInput.addEventListener('input', () => {
    declineCharCount.textContent = declineReasonInput.value.length;
  });

  // Submit decline reason
  btnSendDeclineReason.addEventListener('click', async () => {
    const text = declineReasonInput.value.trim();
    if (!text) {
      showDeclineAlert('Пожалуйста, напиши причину или что чувствуешь...', 'info');
      declineReasonInput.focus();
      return;
    }

    btnSendDeclineReason.disabled = true;
    btnSendDeclineReason.innerHTML = '<span class="btn-text">Отправка...</span> ⏳';

    const timeNow = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const messageToSend = `💔 <b>ОНА НАПИСАЛА ПРИЧИНУ, ПОЧЕМУ НЕ ПРОСТИТ:</b>\n\n` +
      `<i>«${escapeHtml(text)}»</i>\n\n` +
      `⏰ Время: ${timeNow}`;

    const res = await sendTelegramNotification(messageToSend);

    if (res.ok) {
      showDeclineAlert('Твои слова отправлены Данилу. Он прочитает каждое слово... 💔', 'success');
      btnSendDeclineReason.innerHTML = '<span class="btn-text">Отправлено</span> 💔';
      declineReasonInput.disabled = true;
    } else {
      showDeclineAlert('Твои слова отправлены Данилу... 💔', 'success');
      btnSendDeclineReason.innerHTML = '<span class="btn-text">Отправлено</span> 💔';
      declineReasonInput.disabled = true;
    }
  });

  // Back to letter button
  btnBackToLetter.addEventListener('click', () => {
    screenDeclined.classList.remove('active');
    screenDeclined.classList.add('hidden');

    setTimeout(() => {
      screenLetter.classList.remove('hidden');
      screenLetter.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  });

  function showDeclineAlert(msg, type) {
    declineStatusMessage.textContent = msg;
    declineStatusMessage.className = `status-alert ${type}`;
    declineStatusMessage.classList.remove('hidden');
  }

  // --- 5. BRANCH B: CLICK "ДА, Я ПРОЩАЮ ТЕБЯ" ---
  btnAccept.addEventListener('click', () => {
    // 1. Massive celebration confetti
    triggerMassiveConfetti();

    // 2. Telegram Haptic Feedback
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }

    // 3. Notify Danil
    const timeNow = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    sendTelegramNotification(
      `🎉 <b>ОНА НАЖАЛА «ДА, ПРОЩАЮ»!</b> 🥹❤️❤️❤️\n\n` +
      `💖 <b>Она простила тебя и сейчас смотрит ваши совместные фотографии!</b>\n` +
      `⏰ Время: ${timeNow}`
    );

    // 4. Switch to Accepted Screen
    screenLetter.classList.remove('active');
    screenLetter.classList.add('hidden');

    setTimeout(() => {
      screenAccepted.classList.remove('hidden');
      screenAccepted.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      initCarousel();
    }, 250);
  });

  function triggerMassiveConfetti() {
    if (!window.confetti) return;

    // Wave 1: Center blast
    window.confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff2a85', '#b5179e', '#7209b7', '#ff758f', '#ffffff', '#ffd700']
    });

    // Wave 2: Left and right cannons
    setTimeout(() => {
      window.confetti({
        particleCount: 70,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
        colors: ['#ff007f', '#e0aaff', '#ff4d94']
      });
      window.confetti({
        particleCount: 70,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
        colors: ['#ff007f', '#e0aaff', '#ff4d94']
      });
    }, 350);

    // Wave 3: Golden stars & hearts
    setTimeout(() => {
      window.confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#ff2a85', '#ffffff']
      });
    }, 700);
  }

  // --- 6. PHOTO MEMORIES CAROUSEL ENGINE ---
  let currentSlide = 0;
  const totalSlides = 5;

  function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const counter = document.getElementById('photo-counter');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const carousel = document.getElementById('carousel');

    function updateSlide(idx) {
      currentSlide = (idx + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      if (counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    prevBtn.onclick = () => updateSlide(currentSlide - 1);
    nextBtn.onclick = () => updateSlide(currentSlide + 1);

    dots.forEach((dot) => {
      dot.onclick = () => {
        const i = parseInt(dot.getAttribute('data-index'), 10);
        updateSlide(i);
      };
    });

    // Touch Swipe Support for mobile phones
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) {
          updateSlide(currentSlide + 1); // Swipe left -> Next
        } else {
          updateSlide(currentSlide - 1); // Swipe right -> Prev
        }
      }
    }
  }

  // --- 7. ACCEPTED SCREEN: SEND WARM NOTE ---
  acceptReplyInput.addEventListener('input', () => {
    acceptCharCount.textContent = acceptReplyInput.value.length;
  });

  btnSendAcceptReply.addEventListener('click', async () => {
    const text = acceptReplyInput.value.trim();
    if (!text) {
      showAcceptAlert('Пожалуйста, напиши хоть пару слов ❤️', 'info');
      acceptReplyInput.focus();
      return;
    }

    btnSendAcceptReply.disabled = true;
    btnSendAcceptReply.innerHTML = '<span class="btn-text">Отправка...</span> ⏳';

    const timeNow = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const messageToSend = `💌 <b>ТЕПЛОЕ СООБЩЕНИЕ ОТ ЛЮБИМОЙ ПОСЛЕ ФОТОГРАФИЙ:</b>\n\n` +
      `<i>«${escapeHtml(text)}»</i>\n\n` +
      `⏰ Время: ${timeNow}`;

    const res = await sendTelegramNotification(messageToSend);

    if (res.ok) {
      showAcceptAlert('✨ Твоё сообщение доставлено Данилу прямо в Telegram! 💖', 'success');
      btnSendAcceptReply.innerHTML = '<span class="btn-text">Доставлено!</span> 💌';
      acceptReplyInput.disabled = true;

      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }

      if (window.confetti) {
        window.confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#ff2a85', '#ff758f', '#7bed9f']
        });
      }
    } else {
      showAcceptAlert('✨ Твоё сообщение отправлено Данилу! ❤️', 'success');
      btnSendAcceptReply.innerHTML = '<span class="btn-text">Доставлено!</span> 💌';
      acceptReplyInput.disabled = true;
    }
  });

  function showAcceptAlert(msg, type) {
    acceptStatusMessage.textContent = msg;
    acceptStatusMessage.className = `status-alert ${type}`;
    acceptStatusMessage.classList.remove('hidden');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
