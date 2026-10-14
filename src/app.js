// Quizzy - Pure JavaScript Interactive 50-MCQ Application with Pip
import confetti from 'canvas-confetti';

// --- Sound Effects via Web Audio API ---
class SoundManager {
  constructor() {
    this.ctx = null;
    this.soundEnabled = localStorage.getItem('quizzy_sound_enabled') !== 'false';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('quizzy_sound_enabled', String(this.soundEnabled));
    if (this.soundEnabled) this.playTap();
    return this.soundEnabled;
  }

  playTap() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playHint() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [659.25, 880.00, 1046.50]; // E5, A5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
      });
    } catch (e) {}
  }

  playCorrect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch (e) {}
  }

  playIncorrect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }

  playMilestone() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const chord = [392.00, 523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.4);
      });
    } catch (e) {}
  }

  playVictory() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const fanfare = [
        { f: 523.25, t: 0.0, d: 0.12 },
        { f: 659.25, t: 0.12, d: 0.12 },
        { f: 783.99, t: 0.24, d: 0.12 },
        { f: 1046.50, t: 0.36, d: 0.45 },
      ];
      fanfare.forEach(({ f, t, d }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + t);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + t);
        osc.stop(this.ctx.currentTime + t + d);
      });
    } catch (e) {}
  }
}

const sound = new SoundManager();

// --- Pip SVG Generator ---
function renderPipSVG(mood = 'idle', size = 'md') {
  const sizeMap = {
    sm: { width: 130, height: 140 },
    md: { width: 180, height: 190 },
    lg: { width: 250, height: 260 },
  };
  const { width, height } = sizeMap[size] || sizeMap.md;

  let eyeMarkup = '';
  if (mood === 'cheering' || mood === 'celebration') {
    eyeMarkup = `
      <g stroke="#26180E" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M92 114 Q102 100 112 114" />
        <path d="M128 114 Q138 100 148 114" />
      </g>
    `;
  } else if (mood === 'thinking') {
    eyeMarkup = `
      <g>
        <circle cx="102" cy="112" r="15" fill="#FFFFFF" stroke="#26180E" stroke-width="2.5" />
        <circle cx="106" cy="108" r="8" fill="#26180E" />
        <circle cx="109" cy="105" r="3.2" fill="#FFFFFF" />
        <circle cx="138" cy="112" r="15" fill="#FFFFFF" stroke="#26180E" stroke-width="2.5" />
        <circle cx="142" cy="108" r="8" fill="#26180E" />
        <circle cx="145" cy="105" r="3.2" fill="#FFFFFF" />
      </g>
    `;
  } else if (mood === 'oops') {
    eyeMarkup = `
      <g>
        <circle cx="102" cy="112" r="15" fill="#FFFFFF" stroke="#26180E" stroke-width="2.5" />
        <circle cx="102" cy="114" r="8" fill="#26180E" />
        <circle cx="104" cy="111" r="3" fill="#FFFFFF" />
        <circle cx="138" cy="112" r="15" fill="#FFFFFF" stroke="#26180E" stroke-width="2.5" />
        <circle cx="138" cy="114" r="8" fill="#26180E" />
        <circle cx="140" cy="111" r="3" fill="#FFFFFF" />
      </g>
    `;
  } else {
    eyeMarkup = `
      <g>
        <circle cx="102" cy="112" r="15" fill="#FFFFFF" stroke="#26180E" stroke-width="2.8" />
        <circle cx="103" cy="112" r="8.5" fill="#24170D" />
        <circle cx="106" cy="108" r="3.5" fill="#FFFFFF" />
        <circle cx="100" cy="115" r="1.8" fill="#FFFFFF" />
        <circle cx="138" cy="112" r="15" fill="#FFFFFF" stroke="#26180E" stroke-width="2.8" />
        <circle cx="137" cy="112" r="8.5" fill="#24170D" />
        <circle cx="140" cy="108" r="3.5" fill="#FFFFFF" />
        <circle cx="134" cy="115" r="1.8" fill="#FFFFFF" />
      </g>
    `;
  }

  const trophyMarkup = mood === 'celebration' ? `
    <g transform="translate(160, 110) scale(0.65)">
      <path d="M20 10 L40 10 L38 35 C38 46 30 52 20 52 C10 52 2 46 2 35 L0 10 Z" fill="#FFD700" stroke="#B8860B" stroke-width="2" />
      <path d="M20 52 L20 68" stroke="#B8860B" stroke-width="5" />
      <rect x="8" y="68" width="24" height="12" rx="3" fill="#8B4513" />
      <circle cx="20" cy="28" r="8" fill="#FFF275" />
      <text x="20" y="32" font-size="12" text-anchor="middle" fill="#B8860B" font-weight="bold">★</text>
    </g>
  ` : '';

  return `
    <div class="relative inline-flex flex-col items-center select-none ${mood === 'idle' ? 'animate-pip-float' : ''}">
      <svg width="${width}" height="${height}" viewBox="0 0 240 250" fill="none" class="drop-shadow-lg">
        <defs>
          <linearGradient id="pBodyGrad" x1="120" y1="60" x2="120" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFA654" />
            <stop offset="60%" stop-color="#FA7D38" />
            <stop offset="100%" stop-color="#EB5725" />
          </linearGradient>
          <linearGradient id="pBellyGrad" x1="120" y1="120" x2="120" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFF7E6" />
            <stop offset="100%" stop-color="#FEE4C3" />
          </linearGradient>
          <linearGradient id="pCapGrad" x1="120" y1="15" x2="120" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#2F6662" />
            <stop offset="100%" stop-color="#1E4542" />
          </linearGradient>
          <linearGradient id="pPencil" x1="30" y1="80" x2="55" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFD043" />
            <stop offset="100%" stop-color="#F09B1A" />
          </linearGradient>
        </defs>

        <!-- Feet -->
        <g>
          <ellipse cx="98" cy="226" rx="14" ry="7" fill="#1E4D48" />
          <ellipse cx="88" cy="227" rx="9" ry="6" fill="#1E4D48" />
          <ellipse cx="108" cy="227" rx="9" ry="6" fill="#1E4D48" />
          <ellipse cx="142" cy="226" rx="14" ry="7" fill="#1E4D48" />
          <ellipse cx="132" cy="227" rx="9" ry="6" fill="#1E4D48" />
          <ellipse cx="152" cy="227" rx="9" ry="6" fill="#1E4D48" />
        </g>

        <!-- Left Wing & Pencil -->
        <g transform="rotate(-15 62 135)">
          <path d="M53 78 L69 78 C71 78 72 80 72 82 L72 88 L50 88 L50 82 C50 80 51 78 53 78 Z" fill="#FF8A98" />
          <rect x="50" y="88" width="22" height="7" fill="#D3D3D3" />
          <rect x="50" y="95" width="22" height="58" fill="url(#pPencil)" stroke="#B87314" stroke-width="1.5" />
          <path d="M50 153 L72 153 L61 175 Z" fill="#FCE7D2" stroke="#B87314" stroke-width="1.2" />
          <path d="M57 167 L65 167 L61 175 Z" fill="#374151" />
        </g>
        <path d="M72 135 C62 125 50 140 54 156 C58 170 78 178 88 165 C94 156 84 142 72 135 Z" fill="#EB5725" stroke="#682A10" stroke-width="2.5" />

        <!-- Right Wing -->
        <path d="M165 142 C185 135 208 148 205 168 C200 185 178 188 160 172 Z" fill="#FA7D38" stroke="#682A10" stroke-width="2.5" />

        <!-- Main Body -->
        <path d="M68 135 C62 85 92 65 120 65 C148 65 178 85 172 135 C176 175 168 215 120 218 C72 215 64 175 68 135 Z" fill="url(#pBodyGrad)" stroke="#682A10" stroke-width="3.5" />

        <!-- Ear Tufts -->
        <path d="M78 78 C65 60 70 48 85 58 Z" fill="#EB5725" stroke="#682A10" stroke-width="2.5" />
        <path d="M162 78 C175 60 170 48 155 58 Z" fill="#EB5725" stroke="#682A10" stroke-width="2.5" />

        <!-- Belly Cream -->
        <path d="M84 140 C84 115 102 110 120 118 C138 110 156 115 156 140 C156 182 145 208 120 208 C95 208 84 182 84 140 Z" fill="url(#pBellyGrad)" stroke="#C98858" stroke-width="2" />

        <!-- Chevrons -->
        <g stroke="#E89661" stroke-width="2.2" stroke-linecap="round" fill="none">
          <path d="M112 142 Q120 148 128 142" />
          <path d="M104 158 Q112 164 120 158" />
          <path d="M120 158 Q128 164 136 158" />
          <path d="M112 174 Q120 180 128 174" />
        </g>

        <!-- Rosy Cheeks -->
        <ellipse cx="88" cy="126" rx="9" ry="6" fill="#FF6B6B" opacity="0.4" />
        <ellipse cx="152" cy="126" rx="9" ry="6" fill="#FF6B6B" opacity="0.4" />

        <!-- Eyes -->
        ${eyeMarkup}

        <!-- Beak -->
        <path d="M113 118 Q120 114 127 118 L120 132 Z" fill="#FFA826" stroke="#682A10" stroke-width="2.2" />

        <!-- Cap -->
        <g>
          <path d="M96 52 C96 46 144 46 144 52 L138 60 C138 62 102 62 102 60 Z" fill="#1C3D3B" />
          <path d="M120 30 L166 45 L120 60 L74 45 Z" fill="url(#pCapGrad)" stroke="#132B29" stroke-width="2.5" />
          <circle cx="120" cy="45" r="3.5" fill="#FFC93C" stroke="#B87314" stroke-width="1" />
          <path d="M120 45 Q145 48 152 64" stroke="#FFC93C" stroke-width="2.2" fill="none" stroke-linecap="round" />
          <path d="M150 64 L154 75 L147 74 Z" fill="#FFC93C" stroke="#B87314" stroke-width="0.8" />
        </g>

        ${trophyMarkup}
      </svg>
    </div>
  `;
}

// --- App State ---
const state = {
  view: 'home',
  topic: '',
  questions: [],
  currentIndex: 0,
  userAnswers: {},
  score: 0,
  streak: 0,
  highestStreak: 0,
  isAnswered: false,
  selectedOption: null,
  isHintUsed: false,
  mascotMood: 'idle',
  speechText: "Let's get curious!",
  userStats: {
    score: 420,
    streak: 3,
    highestStreak: 5,
    quizzesCompleted: 1,
    totalAnswered: 50,
  },
};

// Load saved stats
try {
  const saved = localStorage.getItem('quizzy_user_stats');
  if (saved) state.userStats = JSON.parse(saved);
} catch (e) {}

function saveStats() {
  try {
    localStorage.setItem('quizzy_user_stats', JSON.stringify(state.userStats));
  } catch (e) {}
}

// --- DOM References ---
const el = {
  headerStreak: document.getElementById('header-streak'),
  headerScore: document.getElementById('header-score'),
  btnSound: document.getElementById('btn-sound'),
  btnHome: document.getElementById('btn-home'),
  
  viewHome: document.getElementById('view-home'),
  viewLoading: document.getElementById('view-loading'),
  viewError: document.getElementById('view-error'),
  viewPlaying: document.getElementById('view-playing'),
  viewCompleted: document.getElementById('view-completed'),
  modalMilestone: document.getElementById('modal-milestone'),

  // Home
  formTopic: document.getElementById('form-topic'),
  inputTopic: document.getElementById('input-topic'),
  btnMakeQuiz: document.getElementById('btn-make-quiz'),
  homePipContainer: document.getElementById('home-pip-container'),

  // Loading
  loadingTopicName: document.getElementById('loading-topic-name'),
  loadingPipContainer: document.getElementById('loading-pip-container'),
  loadingMsg: document.getElementById('loading-msg'),
  loadingBar: document.getElementById('loading-bar'),

  // Error
  errorPipContainer: document.getElementById('error-pip-container'),
  errorMsg: document.getElementById('error-msg'),
  btnErrorRetry: document.getElementById('btn-error-retry'),
  btnErrorPick: document.getElementById('btn-error-pick'),

  // Playing (Pip stands above questions)
  playPipSpeech: document.getElementById('play-pip-speech'),
  playPipContainer: document.getElementById('play-pip-container'),
  btnAskHint: document.getElementById('btn-ask-hint'),
  playHintBanner: document.getElementById('play-hint-banner'),
  playHintText: document.getElementById('play-hint-text'),

  playQuestionNum: document.getElementById('play-question-num'),
  playTopicBadge: document.getElementById('play-topic-badge'),
  playStreakBadge: document.getElementById('play-streak-badge'),
  playScoreBadge: document.getElementById('play-score-badge'),
  playProgressBar: document.getElementById('play-progress-bar'),
  playDiffBadge: document.getElementById('play-diff-badge'),
  playCategoryBadge: document.getElementById('play-category-badge'),
  playQuestionText: document.getElementById('play-question-text'),
  playOptionsContainer: document.getElementById('play-options-container'),
  playExplanationBox: document.getElementById('play-explanation-box'),
  playExplanationText: document.getElementById('play-explanation-text'),
  playFunFactText: document.getElementById('play-fun-fact-text'),
  btnNextQuestion: document.getElementById('btn-next-question'),
  btnExitQuiz: document.getElementById('btn-exit-quiz'),

  // Completed
  completePipContainer: document.getElementById('complete-pip-container'),
  completeTopicText: document.getElementById('complete-topic-text'),
  completeAccuracy: document.getElementById('complete-accuracy'),
  completeCorrectTally: document.getElementById('complete-correct-tally'),
  completeScore: document.getElementById('complete-score'),
  completeStreak: document.getElementById('complete-streak'),
  reviewList: document.getElementById('review-list'),
  btnRetake: document.getElementById('btn-retake'),
  btnNewTopic: document.getElementById('btn-new-topic'),
  btnFilterAll: document.getElementById('btn-filter-all'),
  btnFilterCorrect: document.getElementById('btn-filter-correct'),
  btnFilterWrong: document.getElementById('btn-filter-wrong'),

  // Milestone Modal
  milestoneTitle: document.getElementById('milestone-title'),
  milestoneSubtitle: document.getElementById('milestone-subtitle'),
  milestoneBonus: document.getElementById('milestone-bonus'),
  milestoneStreak: document.getElementById('milestone-streak'),
  milestonePipContainer: document.getElementById('milestone-pip-container'),
  btnMilestoneContinue: document.getElementById('btn-milestone-continue'),
};

// --- View Router ---
function switchView(viewName) {
  state.view = viewName;
  el.viewHome.classList.toggle('hidden', viewName !== 'home');
  el.viewLoading.classList.toggle('hidden', viewName !== 'loading');
  el.viewError.classList.toggle('hidden', viewName !== 'error');
  el.viewPlaying.classList.toggle('hidden', viewName !== 'playing');
  el.viewCompleted.classList.toggle('hidden', viewName !== 'completed');

  updateHeader();

  if (viewName === 'home') {
    el.homePipContainer.innerHTML = renderPipSVG('idle', 'lg');
  }
}

function updateHeader() {
  el.headerStreak.textContent = `${state.userStats.streak} day streak`;
  el.headerScore.textContent = `${state.userStats.score} XP`;
  el.btnSound.textContent = sound.soundEnabled ? '🔊' : '🔇';
}

// --- Topic Submission to Gemini ---
async function handleGenerateQuiz(topic) {
  if (!topic || !topic.trim()) return;
  const cleanTopic = topic.trim();
  state.topic = cleanTopic;

  sound.playTap();
  switchView('loading');

  el.loadingTopicName.textContent = `Preparing "${cleanTopic}"`;
  el.loadingPipContainer.innerHTML = renderPipSVG('thinking', 'lg');

  const messages = [
    "Passing your topic to Gemini AI...",
    "Generating 50 authentic multiple choice questions...",
    "Drafting hints, explanations, and fun trivia...",
    "Structuring progressive milestones...",
  ];
  let step = 0;
  const interval = setInterval(() => {
    step = (step + 1) % messages.length;
    el.loadingMsg.textContent = messages[step];
    el.loadingBar.style.width = `${(step + 1) * 25}%`;
  }, 1400);

  try {
    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: cleanTopic }),
    });

    clearInterval(interval);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Gemini could not generate questions right now.');
    }

    if (!data.questions || data.questions.length === 0) {
      throw new Error('Gemini returned an empty question list.');
    }

    state.questions = data.questions;
    state.currentIndex = 0;
    state.userAnswers = {};
    state.score = 0;
    state.streak = 0;
    state.highestStreak = 0;
    state.isAnswered = false;
    state.selectedOption = null;
    state.isHintUsed = false;

    renderPlayingQuestion();
    switchView('playing');
  } catch (err) {
    clearInterval(interval);
    console.error('Quiz generation error:', err);
    el.errorPipContainer.innerHTML = renderPipSVG('oops', 'md');
    el.errorMsg.textContent = err.message || 'Could not connect to Gemini API.';
    switchView('error');
  }
}

// --- Render Question with Pip Standing Above ---
function renderPlayingQuestion() {
  const q = state.questions[state.currentIndex];
  if (!q) return;

  state.isAnswered = false;
  state.selectedOption = null;
  state.isHintUsed = false;
  state.mascotMood = 'idle';
  state.speechText = `Question ${state.currentIndex + 1}! Let's tackle this one!`;

  el.playQuestionNum.textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
  el.playTopicBadge.textContent = state.topic;
  el.playStreakBadge.textContent = `🔥 ${state.streak} Streak`;
  el.playScoreBadge.textContent = `⭐ ${state.score} XP`;

  const progress = Math.round((state.currentIndex / state.questions.length) * 100);
  el.playProgressBar.style.width = `${progress}%`;

  el.playDiffBadge.textContent = (q.difficulty || 'medium').toUpperCase();
  el.playCategoryBadge.textContent = q.category || state.topic;
  el.playQuestionText.textContent = q.question;

  // Render Pip above the questions with his speech bubble
  el.playPipSpeech.textContent = state.speechText;
  el.playPipContainer.innerHTML = renderPipSVG('idle', 'md');

  // Reset hint state
  el.playHintBanner.classList.add('hidden');
  el.btnAskHint.disabled = false;
  el.btnAskHint.innerHTML = '<span class="text-base">💡</span><span>Ask Pip for a Hint</span>';
  el.btnAskHint.className = 'flex items-center gap-1.5 px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm bg-[#FFF4DC] hover:bg-[#FFEEC2] text-[#925406] border-2 border-[#F6D389] border-b-4 border-[#DBA43A] shadow-xs btn-tactile cursor-pointer';

  el.playExplanationBox.classList.add('hidden');

  // Render 4 Tactile Option Buttons
  const letters = ['A', 'B', 'C', 'D'];
  el.playOptionsContainer.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all btn-tactile cursor-pointer select-none bg-white hover:bg-[#FFF9F3] border-2 border-[#E5DEC9] border-b-4 hover:border-[#FF5A36] text-[#1E1A17]';
    btn.innerHTML = `
      <div class="flex items-center gap-3.5 pr-3">
        <span class="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 bg-[#FAF4E8] text-[#5C554F] border border-[#E5DEC9]">
          ${letters[idx]}
        </span>
        <span class="font-bold text-base sm:text-lg leading-snug">${opt}</span>
      </div>
      <div class="result-badge shrink-0"></div>
    `;

    btn.onclick = () => handleSelectOption(idx);
    el.playOptionsContainer.appendChild(btn);
  });
}

// --- Pip Gives a Hint ---
function handleAskHint() {
  if (state.isAnswered || state.isHintUsed) return;
  state.isHintUsed = true;
  sound.playHint();

  const q = state.questions[state.currentIndex];
  const hintText = q.hint || "Think about the foundational concepts and rule out the least likely options!";

  // Pip scratches his head / thinks
  state.mascotMood = 'thinking';
  state.speechText = `💡 Pip says: "${hintText}"`;

  el.playPipSpeech.textContent = state.speechText;
  el.playPipContainer.innerHTML = renderPipSVG('thinking', 'md');

  // Display the hint banner
  el.playHintText.textContent = hintText;
  el.playHintBanner.classList.remove('hidden');

  // Update Ask Hint button
  el.btnAskHint.disabled = true;
  el.btnAskHint.innerHTML = '<span class="text-base">✨</span><span>Hint Active</span>';
  el.btnAskHint.className = 'flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#FAF4E8] text-[#8C5D39] border border-[#EBE3D7] opacity-80 cursor-default';
}

// --- Option Selection ---
function handleSelectOption(selectedIdx) {
  if (state.isAnswered) return;
  state.isAnswered = true;
  state.selectedOption = selectedIdx;

  const q = state.questions[state.currentIndex];
  const isCorrect = selectedIdx === q.correctAnswer;
  state.userAnswers[q.id] = selectedIdx;

  const optionBtns = el.playOptionsContainer.children;

  for (let i = 0; i < optionBtns.length; i++) {
    const btn = optionBtns[i];
    btn.disabled = true;

    if (i === q.correctAnswer) {
      btn.className = 'w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all btn-tactile select-none bg-[#ECFDF5] border-2 border-[#10B981] border-b-4 border-[#059669] text-[#065F46] shadow-sm';
      btn.querySelector('.result-badge').innerHTML = '<span class="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold">✓</span>';
    } else if (i === selectedIdx && !isCorrect) {
      btn.className = 'w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all btn-tactile select-none bg-[#FEF2F2] border-2 border-[#EF4444] border-b-4 border-[#B91C1C] text-[#991B1B] shadow-sm';
      btn.querySelector('.result-badge').innerHTML = '<span class="w-7 h-7 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-bold">✕</span>';
    } else {
      btn.className = 'w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all btn-tactile select-none bg-white/60 border-2 border-[#E5DEC9] text-[#8C8885] opacity-60';
    }
  }

  if (isCorrect) {
    sound.playCorrect();
    state.streak++;
    if (state.streak > state.highestStreak) state.highestStreak = state.streak;
    const bonus = Math.min(state.streak * 5, 25);
    state.score += (10 + bonus);

    state.mascotMood = 'cheering';
    state.speechText = "Hoot hoot! Spot on! 🎉";

    if (state.streak % 5 === 0) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  } else {
    sound.playIncorrect();
    state.streak = 0;
    state.mascotMood = 'oops';
    state.speechText = "So close! Review the breakdown below!";
  }

  el.playStreakBadge.textContent = `🔥 ${state.streak} Streak`;
  el.playScoreBadge.textContent = `⭐ ${state.score} XP`;
  el.playPipSpeech.textContent = state.speechText;
  el.playPipContainer.innerHTML = renderPipSVG(state.mascotMood, 'md');

  // Explanation box
  el.playExplanationText.textContent = q.explanation;
  el.playFunFactText.textContent = q.funFact || `Pip loves studying ${state.topic}!`;
  el.playExplanationBox.classList.remove('hidden');

  el.btnNextQuestion.textContent = state.currentIndex + 1 === state.questions.length ? 'Finish Quiz 🎓' : 'Next Question →';
}

// --- Advance Question / Milestone ---
function handleNextQuestion() {
  sound.playTap();
  const nextIdx = state.currentIndex + 1;

  if (nextIdx === 10 || nextIdx === 20 || nextIdx === 30 || nextIdx === 40) {
    triggerMilestone(nextIdx);
    return;
  }

  if (nextIdx >= state.questions.length) {
    finishQuiz();
    return;
  }

  state.currentIndex = nextIdx;
  renderPlayingQuestion();
}

function triggerMilestone(num) {
  sound.playMilestone();
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

  const bonus = num === 40 ? 150 : num === 30 ? 100 : num === 20 ? 70 : 50;
  state.score += bonus;

  el.milestoneTitle.textContent = `Checkpoint #${num / 10} Cleared!`;
  el.milestoneSubtitle.textContent = `You've conquered ${num} questions! Keep flying high!`;
  el.milestoneBonus.textContent = `+${bonus} XP`;
  el.milestoneStreak.textContent = `🔥 ${state.streak} in a row`;
  el.milestonePipContainer.innerHTML = renderPipSVG('cheering', 'sm');

  el.modalMilestone.classList.remove('hidden');
}

// --- Finish Quiz ---
function finishQuiz() {
  sound.playVictory();
  confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });

  let correctCount = 0;
  state.questions.forEach((q) => {
    if (state.userAnswers[q.id] === q.correctAnswer) correctCount++;
  });

  const accuracy = Math.round((correctCount / state.questions.length) * 100);

  state.userStats.score += state.score;
  state.userStats.streak += 1;
  state.userStats.highestStreak = Math.max(state.userStats.highestStreak, state.highestStreak);
  state.userStats.quizzesCompleted += 1;
  state.userStats.totalAnswered += state.questions.length;
  saveStats();

  el.completeTopicText.textContent = `You conquered all 50 questions on "${state.topic}"!`;
  el.completeAccuracy.textContent = `${accuracy}%`;
  el.completeCorrectTally.textContent = `${correctCount} / 50 correct`;
  el.completeScore.textContent = `+${state.score} XP`;
  el.completeStreak.textContent = `🔥 ${state.highestStreak} Streak`;
  el.completePipContainer.innerHTML = renderPipSVG('celebration', 'lg');

  renderReviewList('all');
  switchView('completed');
}

// --- Review Sheet Filter ---
function renderReviewList(filter = 'all') {
  el.reviewList.innerHTML = '';

  state.questions.forEach((q) => {
    const userPick = state.userAnswers[q.id];
    const isCorrect = userPick === q.correctAnswer;

    if (filter === 'correct' && !isCorrect) return;
    if (filter === 'incorrect' && isCorrect) return;

    const div = document.createElement('div');
    div.className = `p-4 rounded-2xl border transition-all ${isCorrect ? 'bg-white border-[#EBE3D7]' : 'bg-[#FFF9F9] border-[#FECACA]'}`;
    div.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <span class="text-xl mt-0.5">${isCorrect ? '✅' : '❌'}</span>
          <div>
            <span class="text-xs font-bold text-[#8C8885]">Q${q.id} • ${q.category || state.topic}</span>
            <h4 class="font-bold text-sm sm:text-base text-[#1E1A17] mt-0.5">${q.question}</h4>
          </div>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-[#F0E5D3] text-xs sm:text-sm text-[#5C554F] space-y-1">
        <p><strong>Correct Answer:</strong> <span class="text-[#10B981] font-bold">${q.options[q.correctAnswer]}</span></p>
        ${!isCorrect && userPick !== undefined ? `<p><strong>Your Answer:</strong> <span class="text-[#EF4444] line-through">${q.options[userPick]}</span></p>` : ''}
        ${q.hint ? `<p class="text-[#925406]">💡 <strong>Pip's Hint:</strong> ${q.hint}</p>` : ''}
        <p class="text-[#7A5034] pt-1">📖 ${q.explanation}</p>
        ${q.funFact ? `<p class="text-[#925406] italic">🌟 Trivia: ${q.funFact}</p>` : ''}
      </div>
    `;
    el.reviewList.appendChild(div);
  });
}

// --- Event Listeners ---
el.formTopic.addEventListener('submit', (e) => {
  e.preventDefault();
  handleGenerateQuiz(el.inputTopic.value);
});

el.btnSound.onclick = () => {
  sound.toggle();
  updateHeader();
};

el.btnAskHint.onclick = handleAskHint;

// Pip container tap triggers a friendly peep
el.playPipContainer.onclick = () => {
  sound.playTap();
  if (!state.isHintUsed && !state.isAnswered) {
    handleAskHint();
  }
};

el.btnNextQuestion.onclick = handleNextQuestion;
el.btnMilestoneContinue.onclick = () => {
  sound.playTap();
  el.modalMilestone.classList.add('hidden');
  state.currentIndex++;
  if (state.currentIndex >= state.questions.length) {
    finishQuiz();
  } else {
    renderPlayingQuestion();
  }
};

el.btnExitQuiz.onclick = () => {
  sound.playTap();
  switchView('home');
};

el.btnHome.onclick = () => {
  sound.playTap();
  switchView('home');
};

el.btnErrorRetry.onclick = () => handleGenerateQuiz(state.topic);
el.btnErrorPick.onclick = () => switchView('home');

el.btnRetake.onclick = () => {
  sound.playTap();
  state.currentIndex = 0;
  state.userAnswers = {};
  state.score = 0;
  state.streak = 0;
  renderPlayingQuestion();
  switchView('playing');
};

el.btnNewTopic.onclick = () => {
  sound.playTap();
  el.inputTopic.value = '';
  switchView('home');
};

el.btnFilterAll.onclick = () => renderReviewList('all');
el.btnFilterCorrect.onclick = () => renderReviewList('correct');
el.btnFilterWrong.onclick = () => renderReviewList('incorrect');

// Popular topic shortcuts
document.querySelectorAll('.topic-chip').forEach((chip) => {
  chip.onclick = () => {
    const prompt = chip.getAttribute('data-prompt');
    el.inputTopic.value = prompt;
    handleGenerateQuiz(prompt);
  };
});

// Keyboard shortcuts (1,2,3,4, H for Hint, Enter for next)
window.addEventListener('keydown', (e) => {
  if (state.view !== 'playing') return;
  if (!state.isAnswered) {
    if (e.key === '1' || e.key.toLowerCase() === 'a') handleSelectOption(0);
    if (e.key === '2' || e.key.toLowerCase() === 'b') handleSelectOption(1);
    if (e.key === '3' || e.key.toLowerCase() === 'c') handleSelectOption(2);
    if (e.key === '4' || e.key.toLowerCase() === 'd') handleSelectOption(3);
    if (e.key.toLowerCase() === 'h') handleAskHint();
  } else {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNextQuestion();
    }
  }
});

// Initial boot
switchView('home');
