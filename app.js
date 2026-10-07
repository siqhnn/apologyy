// Apology Mini App - Bulletproof Logic with Zero External Dependencies
(() => {
  // 1. Inlined fallback configuration (works even if config.js is not loaded!)
  const CONFIG = window.CONFIG || {
    NOTIFY_BOT_TOKEN: '8624580033:AAFCH-7QLaZCM6E3popcFZYMAjOTXeJrFtc',
    APP_BOT_TOKEN: '8845832819:AAHURSk53YBabVAVY0862yBmuthA6f0sN1Y',
    DANIL_CHAT_ID: '8517486335'
  };

  // Initialize Telegram WebApp
  const tg = window.Telegram?.WebApp;
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#06020c');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#06020c');
    } catch (e) {
      console.warn('Telegram WebApp init:', e);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const targetChatId = urlParams.get('to') || urlParams.get('chat_id') || CONFIG.DANIL_CHAT_ID;

  // --- 2. MULTI-LAYER ATMOSPHERIC CANVAS ---
  const canvas = document.getElementById('ambientCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

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

    const stars = Array.from({ length: 40 }, () => new Star());
    const particles = Array.from({ length: 30 }, () => new FloatingParticle(true));

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
  }

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

  // Helper escape
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- 4. BUTTON CLICK HANDLERS (EXPOSED GLOBALLY FOR ONCLICK) ---
  window.handleAcceptClick = function() {
    console.log('Accept clicked!');
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }

    triggerMassiveConfetti();

    const timeNow = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    sendTelegramNotification(
      `🎉 <b>ОНА НАЖАЛА «ДА, Я ПРОЩАЮ ТЕБЯ»!</b> 🥹❤️❤️❤️\n\n` +
      `💖 <b>Она простила тебя и сейчас смотрит ваши совместные фотографии!</b>\n` +
      `⏰ Время: ${timeNow}`
    );

    const screenLetter = document.getElementById('screen-letter');
    const screenAccepted = document.getElementById('screen-accepted');
    const screenDeclined = document.getElementById('screen-declined');

    if (screenLetter) {
      screenLetter.classList.remove('active');
      screenLetter.classList.add('hidden');
    }
    if (screenDeclined) {
      screenDeclined.classList.remove('active');
      screenDeclined.classList.add('hidden');
    }
    if (screenAccepted) {
      screenAccepted.classList.remove('hidden');
      screenAccepted.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      initCarousel();
    }
  };

  window.handleDeclineClick = function() {
    console.log('Decline clicked!');
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('warning');
    }

    const timeNow = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    sendTelegramNotification(
      `⚠️ <b>ОНА НАЖАЛА «НЕТ, НЕ ПРОЩУ»...</b>\n\n` +
      `💔 <i>Она открыла экран с причиной и сейчас пишет тебе ответ...</i>\n` +
      `⏰ Время: ${timeNow}`
    );

    const screenLetter = document.getElementById('screen-letter');
    const screenDeclined = document.getElementById('screen-declined');
    const screenAccepted = document.getElementById('screen-accepted');

    if (screenLetter) {
      screenLetter.classList.remove('active');
      screenLetter.classList.add('hidden');
    }
    if (screenAccepted) {
      screenAccepted.classList.remove('active');
      screenAccepted.classList.add('hidden');
    }
    if (screenDeclined) {
      screenDeclined.classList.remove('hidden');
      screenDeclined.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  function triggerMassiveConfetti() {
    if (!window.confetti) return;

    window.confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff2a85', '#b5179e', '#7209b7', '#ff758f', '#ffffff', '#ffd700']
    });

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

    setTimeout(() => {
      window.confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#ff2a85', '#ffffff']
      });
    }, 700);
  }

  // --- 5. INITIALIZE CAROUSEL ---
  let carouselInitialized = false;
  function initCarousel() {
    if (carouselInitialized) return;
    carouselInitialized = true;

    let currentSlide = 0;
    const totalSlides = 5;

    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const counter = document.getElementById('photo-counter');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const carousel = document.getElementById('carousel');

    if (!track) return;

    function updateSlide(idx) {
      currentSlide = (idx + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      if (counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    if (prevBtn) prevBtn.onclick = () => updateSlide(currentSlide - 1);
    if (nextBtn) nextBtn.onclick = () => updateSlide(currentSlide + 1);

    dots.forEach((dot) => {
      dot.onclick = () => {
        const i = parseInt(dot.getAttribute('data-index'), 10);
        updateSlide(i);
      };
    });

    // Touch Swipe for mobile phones
    if (carousel) {
      let touchStartX = 0;
      let touchEndX = 0;

      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) updateSlide(currentSlide + 1);
          else updateSlide(currentSlide - 1);
        }
      }, { passive: true });
    }
  }

  // --- 6. ATTACH LISTENERS AFTER DOM IS READY ---
  function initApp() {
    const btnAccept = document.getElementById('btn-accept');
    const btnDecline = document.getElementById('btn-decline');

    if (btnAccept) btnAccept.onclick = window.handleAcceptClick;
    if (btnDecline) btnDecline.onclick = window.handleDeclineClick;

    // Decline reason input
    const declineReasonInput = document.getElementById('decline-reason-input');
    const declineCharCount = document.getElementById('decline-char-count');
    const btnSendDeclineReason = document.getElementById('btn-send-decline-reason');
    const declineStatusMessage = document.getElementById('decline-status-message');
    const btnBackToLetter = document.getElementById('btn-back-to-letter');

    if (declineReasonInput && declineCharCount) {
      declineReasonInput.addEventListener('input', () => {
        declineCharCount.textContent = declineReasonInput.value.length;
      });
    }

    if (btnSendDeclineReason) {
      btnSendDeclineReason.onclick = async () => {
        const text = declineReasonInput ? declineReasonInput.value.trim() : '';
        if (!text) {
          if (declineStatusMessage) {
            declineStatusMessage.textContent = 'Пожалуйста, напиши причину или что думаешь...';
            declineStatusMessage.className = 'status-alert info';
            declineStatusMessage.classList.remove('hidden');
          }
          if (declineReasonInput) declineReasonInput.focus();
          return;
        }

        btnSendDeclineReason.disabled = true;
        btnSendDeclineReason.innerHTML = '<span class="btn-text">Отправка...</span> ⏳';

        const timeNow = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const messageToSend = `💔 <b>ОНА НАПИСАЛА ПРИЧИНУ, ПОЧЕМУ НЕ ПРОСТИТ:</b>\n\n` +
          `<i>«${escapeHtml(text)}»</i>\n\n` +
          `⏰ Время: ${timeNow}`;

        await sendTelegramNotification(messageToSend);

        if (declineStatusMessage) {
          declineStatusMessage.textContent = 'Твои слова отправлены Данилу. Он прочитает каждое слово... 💔';
          declineStatusMessage.className = 'status-alert success';
          declineStatusMessage.classList.remove('hidden');
        }
        btnSendDeclineReason.innerHTML = '<span class="btn-text">Отправлено</span> 💔';
        if (declineReasonInput) declineReasonInput.disabled = true;
      };
    }

    if (btnBackToLetter) {
      btnBackToLetter.onclick = () => {
        const screenLetter = document.getElementById('screen-letter');
        const screenDeclined = document.getElementById('screen-declined');
        if (screenDeclined) {
          screenDeclined.classList.remove('active');
          screenDeclined.classList.add('hidden');
        }
        if (screenLetter) {
          screenLetter.classList.remove('hidden');
          screenLetter.classList.add('active');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    // Accept reply input
    const acceptReplyInput = document.getElementById('accept-reply-input');
    const acceptCharCount = document.getElementById('accept-char-count');
    const btnSendAcceptReply = document.getElementById('btn-send-accept-reply');
    const acceptStatusMessage = document.getElementById('accept-status-message');

    if (acceptReplyInput && acceptCharCount) {
      acceptReplyInput.addEventListener('input', () => {
        acceptCharCount.textContent = acceptReplyInput.value.length;
      });
    }

    if (btnSendAcceptReply) {
      btnSendAcceptReply.onclick = async () => {
        const text = acceptReplyInput ? acceptReplyInput.value.trim() : '';
        if (!text) {
          if (acceptStatusMessage) {
            acceptStatusMessage.textContent = 'Пожалуйста, напиши хоть пару слов ❤️';
            acceptStatusMessage.className = 'status-alert info';
            acceptStatusMessage.classList.remove('hidden');
          }
          if (acceptReplyInput) acceptReplyInput.focus();
          return;
        }

        btnSendAcceptReply.disabled = true;
        btnSendAcceptReply.innerHTML = '<span class="btn-text">Отправка...</span> ⏳';

        const timeNow = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const messageToSend = `💌 <b>ТЕПЛОЕ СООБЩЕНИЕ ОТ ЛЮБИМОЙ ПОСЛЕ ФОТОГРАФИЙ:</b>\n\n` +
          `<i>«${escapeHtml(text)}»</i>\n\n` +
          `⏰ Время: ${timeNow}`;

        await sendTelegramNotification(messageToSend);

        if (acceptStatusMessage) {
          acceptStatusMessage.textContent = '✨ Твоё сообщение доставлено Данилу прямо в Telegram! 💖';
          acceptStatusMessage.className = 'status-alert success';
          acceptStatusMessage.classList.remove('hidden');
        }
        btnSendAcceptReply.innerHTML = '<span class="btn-text">Доставлено!</span> 💌';
        if (acceptReplyInput) acceptReplyInput.disabled = true;
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
