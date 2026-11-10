/**
 * app.js
 * Main ES6 Application Controller for Teen Patti Royale — 3D Interactive Academy
 * Coordinates:
 * - Synthesized Web Audio Casino SFX Engine (Card slide, Card flip, Chip clink, Win chime)
 * - Section A: Hero 3D Scene integration & controls
 * - Section B: Interactive 3D Hand Ranking Hierarchy (All 6 ranks, probabilities, 3D card stage)
 * - Section C: Step-by-Step 4-Player Game Loop Simulator (6 steps, Auto-Play, Blind/Seen calculator)
 * - Section D: "Which Hand Wins?" Gamified Quiz Engine (10s timer, exact evaluator, streak/accuracy)
 * - Section E: Terminology & Rule Cheat Sheet Grid (Live search & category filters)
 * - Section F: Responsive Footer & Keyboard Shortcuts
 */

import { initHero3DScene } from './three-scene.js';

/* ==========================================================================
   1. SYNTHESIZED WEB AUDIO CASINO SFX ENGINE
   ========================================================================== */
class CasinoSoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (e) {
          this.ctx = null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.chipClink();
    }
    return this.enabled;
  }

  cardSlide() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const duration = 0.14;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  cardFlip() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.075);

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.085);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  chipClink() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      [2450, 3280].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.03);
        gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.03 + 0.11);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.03);
        osc.stop(ctx.currentTime + idx * 0.03 + 0.12);
      });
    } catch (e) {}
  }

  winChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.065);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.065 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.065);
        osc.stop(ctx.currentTime + i * 0.065 + 0.3);
      });
    } catch (e) {}
  }

  errorBuzz() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(165, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(115, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.11, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }
}

const soundFX = new CasinoSoundEngine();

/* ==========================================================================
   2. DATA: SECTION B — ALL 6 TEEN PATTI HAND RANKINGS
   ========================================================================== */
const HAND_RANKINGS = [
  {
    id: 'trio',
    rankNumber: 1,
    name: 'Trio / Trail (Three of a Kind)',
    hindiName: 'Trail • Set • Teen',
    strength: 100,
    combinations: '52 / 22,100 Hands',
    probability: '0.24%',
    odds: '1 in 424 hands',
    strongest: 'A♠ A♥ A♦',
    weakest: '2♠ 2♥ 2♣',
    defaultExampleLabel: 'A♠ - A♥ - A♦',
    tieBreaker:
      'Higher rank Trio always wins. Three Aces (A-A-A) is the highest possible hand in Teen Patti, and Three Twos (2-2-2) is the lowest Trio. Two players can never hold the same Trio in a single 52-card deck.',
    examples: [
      {
        label: 'Royal Aces (Highest)',
        cards: [
          { rank: 'A', suit: '♠' },
          { rank: 'A', suit: '♥' },
          { rank: 'A', suit: '♦' }
        ]
      },
      {
        label: 'Three Kings',
        cards: [
          { rank: 'K', suit: '♠' },
          { rank: 'K', suit: '♣' },
          { rank: 'K', suit: '♦' }
        ]
      },
      {
        label: 'Three Twos (Lowest)',
        cards: [
          { rank: '2', suit: '♠' },
          { rank: '2', suit: '♥' },
          { rank: '2', suit: '♣' }
        ]
      }
    ]
  },
  {
    id: 'pure-sequence',
    rankNumber: 2,
    name: 'Pure Sequence (Straight Flush)',
    hindiName: 'Pakki Rung • Shahi',
    strength: 90,
    combinations: '48 / 22,100 Hands',
    probability: '0.22%',
    odds: '1 in 460 hands',
    strongest: 'A♠ K♠ Q♠',
    weakest: '4♣ 3♣ 2♣',
    defaultExampleLabel: 'K♠ - Q♠ - J♠',
    tieBreaker:
      'Three consecutive cards of the exact same suit. In Teen Patti, A-K-Q is the highest Pure Sequence, followed by A-2-3 (second highest!), then K-Q-J down to 4-3-2. Suits have no relative rank.',
    examples: [
      {
        label: 'Featured (K♠ Q♠ J♠)',
        cards: [
          { rank: 'K', suit: '♠' },
          { rank: 'Q', suit: '♠' },
          { rank: 'J', suit: '♠' }
        ]
      },
      {
        label: 'Highest (A♠ K♠ Q♠)',
        cards: [
          { rank: 'A', suit: '♠' },
          { rank: 'K', suit: '♠' },
          { rank: 'Q', suit: '♠' }
        ]
      },
      {
        label: '2nd Highest (A♥ 2♥ 3♥)',
        cards: [
          { rank: 'A', suit: '♥' },
          { rank: '2', suit: '♥' },
          { rank: '3', suit: '♥' }
        ]
      }
    ]
  },
  {
    id: 'sequence',
    rankNumber: 3,
    name: 'Sequence (Straight)',
    hindiName: 'Rung • Run',
    strength: 75,
    combinations: '720 / 22,100 Hands',
    probability: '3.26%',
    odds: '1 in 31 hands',
    strongest: 'A♠ K♥ Q♦',
    weakest: '4♠ 3♦ 2♣',
    defaultExampleLabel: 'J♠ - 10♥ - 9♣',
    tieBreaker:
      'Three consecutive cards of mixed suits. Just like Pure Sequence, the ranking order from top to bottom is: A-K-Q > A-2-3 > K-Q-J > Q-J-10 > ... > 4-3-2. Wrap-around (K-A-2) is not a valid sequence.',
    examples: [
      {
        label: 'Featured (J♠ 10♥ 9♣)',
        cards: [
          { rank: 'J', suit: '♠' },
          { rank: '10', suit: '♥' },
          { rank: '9', suit: '♣' }
        ]
      },
      {
        label: 'Highest (A♦ K♣ Q♠)',
        cards: [
          { rank: 'A', suit: '♦' },
          { rank: 'K', suit: '♣' },
          { rank: 'Q', suit: '♠' }
        ]
      },
      {
        label: '2nd Highest (A♠ 2♥ 3♦)',
        cards: [
          { rank: 'A', suit: '♠' },
          { rank: '2', suit: '♥' },
          { rank: '3', suit: '♦' }
        ]
      }
    ]
  },
  {
    id: 'color',
    rankNumber: 4,
    name: 'Color (Flush)',
    hindiName: 'Rung • Flush',
    strength: 60,
    combinations: '1,096 / 22,100 Hands',
    probability: '4.96%',
    odds: '1 in 20 hands',
    strongest: 'A♠ K♠ J♠',
    weakest: '5♣ 3♣ 2♣',
    defaultExampleLabel: 'A♦ - 9♦ - 4♦',
    tieBreaker:
      'Any three cards of the same suit that are NOT in sequential order. If two players both have Color, compare the highest card; if tied, compare the second-highest card, then the third card.',
    examples: [
      {
        label: 'Featured (A♦ 9♦ 4♦)',
        cards: [
          { rank: 'A', suit: '♦' },
          { rank: '9', suit: '♦' },
          { rank: '4', suit: '♦' }
        ]
      },
      {
        label: 'Highest Color (A♠ K♠ J♠)',
        cards: [
          { rank: 'A', suit: '♠' },
          { rank: 'K', suit: '♠' },
          { rank: 'J', suit: '♠' }
        ]
      },
      {
        label: 'Queen High (Q♥ 10♥ 7♥)',
        cards: [
          { rank: 'Q', suit: '♥' },
          { rank: '10', suit: '♥' },
          { rank: '7', suit: '♥' }
        ]
      }
    ]
  },
  {
    id: 'pair',
    rankNumber: 5,
    name: 'Pair (Two of a Kind)',
    hindiName: 'Jut • Double',
    strength: 40,
    combinations: '3,744 / 22,100 Hands',
    probability: '16.94%',
    odds: '1 in 6 hands',
    strongest: 'A♠ A♥ K♦',
    weakest: '2♠ 2♣ 3♦',
    defaultExampleLabel: 'K♣ - K♥ - 5♠',
    tieBreaker:
      'Two cards of the same rank plus one unmatched side card (kicker). Between two Pairs, the higher pair rank wins (A-A beats K-K). If both players hold the same Pair rank, the highest third kicker card wins.',
    examples: [
      {
        label: 'Featured (K♣ K♥ 5♠)',
        cards: [
          { rank: 'K', suit: '♣' },
          { rank: 'K', suit: '♥' },
          { rank: '5', suit: '♠' }
        ]
      },
      {
        label: 'Highest Pair (A♠ A♥ K♦)',
        cards: [
          { rank: 'A', suit: '♠' },
          { rank: 'A', suit: '♥' },
          { rank: 'K', suit: '♦' }
        ]
      },
      {
        label: 'Queens + Ace Kicker',
        cards: [
          { rank: 'Q', suit: '♦' },
          { rank: 'Q', suit: '♠' },
          { rank: 'A', suit: '♥' }
        ]
      }
    ]
  },
  {
    id: 'high-card',
    rankNumber: 6,
    name: 'High Card',
    hindiName: 'Hukm / Badi Patti • High',
    strength: 20,
    combinations: '16,440 / 22,100 Hands',
    probability: '74.39%',
    odds: '~3 in 4 hands',
    strongest: 'A♠ K♥ J♣',
    weakest: '5♠ 3♦ 2♣',
    defaultExampleLabel: 'A♥ - 10♠ - 3♣',
    tieBreaker:
      'Three unmatched cards not in sequence and not of the same suit. Compare the highest rank card first, then the middle card, and finally the lowest card. Ace is always high.',
    examples: [
      {
        label: 'Featured (A♥ 10♠ 3♣)',
        cards: [
          { rank: 'A', suit: '♥' },
          { rank: '10', suit: '♠' },
          { rank: '3', suit: '♣' }
        ]
      },
      {
        label: 'Highest (A♠ K♦ J♣)',
        cards: [
          { rank: 'A', suit: '♠' },
          { rank: 'K', suit: '♦' },
          { rank: 'J', suit: '♣' }
        ]
      },
      {
        label: 'Lowest (5♠ 3♦ 2♣)',
        cards: [
          { rank: '5', suit: '♠' },
          { rank: '3', suit: '♦' },
          { rank: '2', suit: '♣' }
        ]
      }
    ]
  }
];

/* ==========================================================================
   3. HELPER: RENDER 3D FLIPPABLE PLAYING CARD HTML
   ========================================================================== */
function isRedSuit(suit) {
  return suit === '♥' || suit === '♦';
}

function render3DCardHTML(card, extraClass = '', interactiveFlip = true) {
  const suitColorClass = isRedSuit(card.suit) ? 'suit-red' : 'suit-black';
  const a11yAttrs = interactiveFlip
    ? `role="button" tabindex="0" aria-label="Playing Card ${card.rank} of ${card.suit}. Click to flip 3D"`
    : `aria-hidden="true"`;
  return `
    <div class="card-3d-wrapper ${extraClass}" ${a11yAttrs}>
      <div class="card-3d-inner">
        <div class="card-face card-face-front ${suitColorClass}">
          <div class="text-left leading-none">
            <div class="font-heading font-extrabold text-base sm:text-lg">${card.rank}</div>
            <div class="text-xs sm:text-sm">${card.suit}</div>
          </div>
          <div class="text-center text-3xl sm:text-4xl my-auto select-none">${card.suit}</div>
          <div class="text-right leading-none rotate-180">
            <div class="font-heading font-extrabold text-base sm:text-lg">${card.rank}</div>
            <div class="text-xs sm:text-sm">${card.suit}</div>
          </div>
        </div>
        <div class="card-face card-face-back"></div>
      </div>
    </div>
  `;
}

function renderMiniTableCardHTML(card, faceUp = false) {
  if (!faceUp) {
    return `<span class="mini-table-card face-down" title="Face-Down Card">♠</span>`;
  }
  const colorClass = isRedSuit(card.suit) ? 'suit-red' : 'suit-black';
  return `
    <span class="mini-table-card face-up ${colorClass}">
      <span>${card.rank}</span>
      <span>${card.suit}</span>
    </span>
  `;
}

/* ==========================================================================
   4. SECTION B CONTROLLER: INTERACTIVE 3D HAND RANKING HIERARCHY
   ========================================================================== */
function initHandRankingsSection() {
  const rankListEl = document.getElementById('hand-rank-list');
  const stageEl = document.getElementById('inspector-3d-cards-stage');
  const presetsEl = document.getElementById('inspector-example-presets');
  const btnFlip = document.getElementById('inspector-btn-flip');
  const btnDeal = document.getElementById('inspector-btn-deal');

  if (!rankListEl || !stageEl) return;

  let activeRankIndex = 0;
  let activeExampleIndex = 0;

  // Render the 6 Hand Ranking Cards on the Left
  rankListEl.innerHTML = HAND_RANKINGS.map((rank, idx) => {
    const firstCombo = rank.examples[0].cards;
    const miniCardsHTML = firstCombo
      .map((c) => {
        const suitClass = isRedSuit(c.suit) ? 'text-red-500' : 'text-slate-900';
        return `<span class="inline-flex items-center justify-center w-8 h-11 rounded-md bg-white border border-gold/60 font-mono font-bold text-xs ${suitClass} shadow-sm">${c.rank}${c.suit}</span>`;
      })
      .join('');

    return `
      <div
        class="rank-item-card rounded-2xl p-4 sm:p-5 cursor-pointer ${idx === 0 ? 'active-rank' : ''}"
        data-rank-index="${idx}"
        role="tab"
        tabindex="0"
        aria-selected="${idx === 0 ? 'true' : 'false'}"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2.5">
              <span class="px-2.5 py-0.5 rounded-md bg-gold/20 border border-gold/40 text-gold font-mono font-bold text-xs">
                #${rank.rankNumber}
              </span>
              <h3 class="font-heading font-bold text-lg sm:text-xl text-white">
                ${rank.name}
              </h3>
            </div>
            <p class="text-xs font-mono text-slate-400">
              Example: <strong class="text-amberGlow">${rank.defaultExampleLabel}</strong> • Probability: <strong class="text-emerald-300">${rank.probability}</strong> (${rank.odds})
            </p>
            <!-- Strength Progress Bar -->
            <div class="pt-1 flex items-center gap-3">
              <div class="flex-1 h-2 rounded-full bg-slate-900/90 overflow-hidden p-[1px] border border-slate-700/60">
                <div class="h-full rounded-full bg-gradient-to-r from-gold to-neonEmerald" style="width: ${rank.strength}%"></div>
              </div>
              <span class="font-mono font-bold text-xs text-neonEmerald w-16 text-right">${rank.strength}% Power</span>
            </div>
          </div>

          <!-- Mini Card Preview Badges -->
          <div class="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
            <div class="flex items-center gap-1.5">${miniCardsHTML}</div>
            <span class="ml-2 text-gold text-xs font-mono hidden sm:inline">Inspect →</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  function renderStageCards(animateDeal = true) {
    const rank = HAND_RANKINGS[activeRankIndex];
    const example = rank.examples[activeExampleIndex] || rank.examples[0];

    // Update Inspector Metadata
    document.getElementById('inspector-rank-badge').textContent = `RANK #${rank.rankNumber}`;
    document.getElementById('inspector-hindi-name').textContent = rank.hindiName;
    document.getElementById('inspector-title').textContent = rank.name;
    document.getElementById('inspector-strength-value').textContent = `${rank.strength}%`;
    document.getElementById('inspector-combos-count').textContent = rank.combinations;
    document.getElementById('inspector-strength-bar').style.width = `${rank.strength}%`;
    document.getElementById('inspector-example-label').textContent = `${example.label}: ${example.cards.map((c) => `${c.rank}${c.suit}`).join(' - ')}`;
    document.getElementById('inspector-probability').textContent = rank.probability;
    document.getElementById('inspector-odds').textContent = rank.odds;
    document.getElementById('inspector-strongest').textContent = rank.strongest;
    document.getElementById('inspector-weakest').textContent = `Lowest: ${rank.weakest}`;
    document.getElementById('inspector-tiebreaker').textContent = rank.tieBreaker;

    // Render Preset Switcher Buttons
    if (presetsEl) {
      presetsEl.innerHTML = rank.examples
        .map(
          (ex, i) => `
          <button
            type="button"
            data-preset-idx="${i}"
            class="px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
              i === activeExampleIndex
                ? 'bg-gold text-obsidian font-bold border-gold'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-gold/50'
            }"
          >
            Ex ${i + 1}
          </button>
        `
        )
        .join('');

      presetsEl.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeExampleIndex = Number(btn.dataset.presetIdx);
          soundFX.cardSlide();
          renderStageCards(true);
        });
      });
    }

    // Render 3D Cards in Stage
    stageEl.innerHTML = example.cards.map((c) => render3DCardHTML(c, 'inspector-3d-card')).join('');

    const cardWrappers = Array.from(stageEl.querySelectorAll('.inspector-3d-card'));
    cardWrappers.forEach((wrapper) => {
      wrapper.addEventListener('click', () => {
        wrapper.classList.toggle('is-flipped');
        soundFX.cardFlip();
      });
      wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          wrapper.classList.toggle('is-flipped');
          soundFX.cardFlip();
        }
      });
    });

    if (animateDeal && window.gsap) {
      window.gsap.fromTo(
        cardWrappers,
        { y: 36, opacity: 0, rotateY: -90, scale: 0.88 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          scale: 1,
          duration: 0.52,
          stagger: 0.09,
          ease: 'back.out(1.5)'
        }
      );
    }
  }

  // Click Events on Rank List Items
  const rankCards = Array.from(rankListEl.querySelectorAll('.rank-item-card'));
  rankCards.forEach((cardEl) => {
    const selectRank = () => {
      const newIdx = Number(cardEl.dataset.rankIndex);
      activeRankIndex = newIdx;
      activeExampleIndex = 0;

      rankCards.forEach((el, i) => {
        el.classList.toggle('active-rank', i === newIdx);
        el.setAttribute('aria-selected', i === newIdx ? 'true' : 'false');
      });

      soundFX.cardSlide();
      renderStageCards(true);
    };

    cardEl.addEventListener('click', selectRank);
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRank();
      }
    });
  });

  // Flip All & Replay Deal Buttons
  if (btnFlip) {
    btnFlip.addEventListener('click', () => {
      soundFX.cardFlip();
      stageEl.querySelectorAll('.inspector-3d-card').forEach((el, i) => {
        setTimeout(() => el.classList.toggle('is-flipped'), i * 70);
      });
    });
  }

  if (btnDeal) {
    btnDeal.addEventListener('click', () => {
      soundFX.cardSlide();
      renderStageCards(true);
    });
  }

  // Initial Render
  renderStageCards(false);
}

/* ==========================================================================
   5. SECTION C CONTROLLER: STEP-BY-STEP GAME LOOP SIMULATOR (STEPS 1 TO 6)
   ========================================================================== */
const SIMULATOR_STEPS = [
  {
    step: 1,
    tag: 'Phase 1 • Mandatory Ante',
    title: 'Step 1: The Boot (Initial Pot)',
    headline: 'The Boot — Equal Initial Stake Placed in Center Pot',
    desc: 'Before any cards are dealt, every player places a mandatory minimum stake called the Boot (₹100) into the center pot. This builds the initial pot and gives every player an immediate stake in the hand.',
    potAmount: '₹400',
    potSubtext: '4 Players × ₹100 Boot Collected',
    currentStake: '₹100',
    activePlayersText: '4 Active Players',
    showSideshowOverlay: false,
    bullets: [
      'Each of the 4 players contributes ₹100 Boot into the center pot.',
      'Starting pot reaches ₹400 before a single card is dealt.',
      'The Dealer (D) button rotates clockwise every round.'
    ],
    logs: [
      '[BOOT] Dealer posts ₹100 Boot into pot.',
      '[BOOT] Player A, Player B, and You each post ₹100 Boot.',
      '[POT] Central Pot initialized at ₹400.'
    ],
    seats: {
      dealer: { badge: 'BOOT ₹100', badgeClass: 'bg-gold/20 text-gold', bet: 'Invested: ₹100', cards: [], state: '' },
      playerA: { badge: 'BOOT ₹100', badgeClass: 'bg-gold/20 text-gold', bet: 'Invested: ₹100', cards: [], state: '' },
      playerB: { badge: 'BOOT ₹100', badgeClass: 'bg-gold/20 text-gold', bet: 'Invested: ₹100', cards: [], state: '' },
      you: { badge: 'BOOT ₹100', badgeClass: 'bg-emerald-500/20 text-neonEmerald', bet: 'Invested: ₹100', cards: [], state: '' }
    }
  },
  {
    step: 2,
    tag: 'Phase 2 • Dealing Cards',
    title: 'Step 2: The Deal',
    headline: '3 Cards Dealt Face-Down Clockwise to All 4 Players',
    desc: 'The Dealer deals one card at a time clockwise until all 4 players have exactly 3 face-down cards. At this moment, nobody has looked at their cards yet — everyone starts as a Blind player.',
    potAmount: '₹400',
    potSubtext: '12 Cards Dealt (3 per Player)',
    currentStake: '₹100',
    activePlayersText: '4 Active Players',
    showSideshowOverlay: false,
    bullets: [
      '3 cards dealt face-down to Player A, Dealer, Player B, and You.',
      'Players must decide whether to play Blind (without looking) or Seen (peek at cards).',
      'Looking at your cards doubles your minimum required bet!'
    ],
    logs: [
      '[DEAL] Dealer deals 3 cards face-down clockwise to all 4 seats.',
      '[RULE] All players currently hold face-down (Blind) hands.'
    ],
    seats: {
      dealer: {
        badge: 'DEALT (3)',
        badgeClass: 'bg-slate-800 text-slate-200',
        bet: 'Invested: ₹100',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: ''
      },
      playerA: {
        badge: 'DEALT (3)',
        badgeClass: 'bg-slate-800 text-slate-200',
        bet: 'Invested: ₹100',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: ''
      },
      playerB: {
        badge: 'DEALT (3)',
        badgeClass: 'bg-slate-800 text-slate-200',
        bet: 'Invested: ₹100',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: ''
      },
      you: {
        badge: 'DEALT (3)',
        badgeClass: 'bg-slate-800 text-gold',
        bet: 'Invested: ₹100',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: 'seat-active-turn'
      }
    }
  },
  {
    step: 3,
    tag: 'Phase 3 • Asymmetric Stakes',
    title: 'Step 3: Blind vs. Seen Choice',
    headline: 'Blind Players Bet 1× • Seen Players (Chaal) Must Bet 2×',
    desc: 'Players choose whether to peek at their cards. Player A stays BLIND (cards stay face-down, bets 1×). You, Dealer, and Player B look at your cards to become SEEN players — meaning your bets (Chaal) must be at least 2× the Blind stake!',
    potAmount: '₹400',
    potSubtext: 'Blind = 1× (₹100) | Seen Chaal = 2× (₹200)',
    currentStake: '₹100 (Blind) / ₹200 (Seen)',
    activePlayersText: '1 Blind • 3 Seen',
    showSideshowOverlay: false,
    bullets: [
      'Blind Player (Player A) bets 1× the current stake (₹100 to call, ₹200 to raise).',
      'Seen Players (You, Dealer, Player B) must bet at least 2× the Blind stake (₹200 to call, ₹400 to raise).',
      'You peek at your hand and discover a Royal Pure Sequence: A♠ K♠ Q♠!'
    ],
    logs: [
      '[CHOICE] Player A stays BLIND (1× stake advantage).',
      '[SEEN] You look at your cards: A♠ K♠ Q♠ (Pure Sequence!).',
      '[SEEN] Dealer and Player B also look at their cards (Seen / Chaal).'
    ],
    seats: {
      dealer: {
        badge: 'SEEN (2× CHAAL)',
        badgeClass: 'bg-amber-500/20 text-amberGlow',
        bet: 'Min Bet: ₹200',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: ''
      },
      playerA: {
        badge: 'BLIND (1× BET)',
        badgeClass: 'bg-emerald-500/20 text-neonEmerald',
        bet: 'Min Bet: ₹100',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: 'seat-active-turn'
      },
      playerB: {
        badge: 'SEEN (2× CHAAL)',
        badgeClass: 'bg-amber-500/20 text-amberGlow',
        bet: 'Min Bet: ₹200',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: ''
      },
      you: {
        badge: 'SEEN (A♠ K♠ Q♠)',
        badgeClass: 'bg-gold/25 text-gold',
        bet: 'Min Chaal: ₹200',
        cards: [
          { faceUp: true, rank: 'A', suit: '♠' },
          { faceUp: true, rank: 'K', suit: '♠' },
          { faceUp: true, rank: 'Q', suit: '♠' }
        ],
        state: 'seat-active-turn'
      }
    }
  },
  {
    step: 4,
    tag: 'Phase 4 • Clockwise Betting',
    title: 'Step 4: The Chaal / Betting Rounds',
    headline: 'Raise, Match (Call), and Pack (Fold) in Clockwise Order',
    desc: 'Betting proceeds clockwise. Player A calls ₹100 Blind. Dealer raises the Chaal to ₹400! Player B holds a weak High Card (9♣ 6♦ 2♠) and chooses to PACK (Fold), forfeiting their ₹100 Boot. You match the ₹400 Chaal with your Pure Sequence!',
    potAmount: '₹1,300',
    potSubtext: 'Player B Packed • 3 Players Remain',
    currentStake: '₹400 (Seen Chaal)',
    activePlayersText: '3 Active • 1 Packed',
    showSideshowOverlay: false,
    bullets: [
      'Player A bets ₹100 (Blind 1×).',
      'Dealer raises Chaal to ₹400 (2× Seen raise).',
      'Player B packs/folds (cards discarded, seat dimmed in crimson).',
      'You match the ₹400 Chaal to stay in the pot!'
    ],
    logs: [
      '[BET] Player A posts ₹100 Blind.',
      '[RAISE] Dealer raises Seen Chaal to ₹400!',
      '[PACK] Player B folds weak hand (9♣ 6♦ 2♠).',
      '[CHAAL] You call ₹400 Chaal. Pot surges to ₹1,300!'
    ],
    seats: {
      dealer: {
        badge: 'RAISED ₹400',
        badgeClass: 'bg-amber-500/25 text-amberGlow',
        bet: 'Invested: ₹500',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: 'seat-active-turn'
      },
      playerA: {
        badge: 'BLIND CALL ₹100',
        badgeClass: 'bg-emerald-500/20 text-neonEmerald',
        bet: 'Invested: ₹200',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: ''
      },
      playerB: {
        badge: 'PACKED / FOLDED',
        badgeClass: 'bg-red-500/25 text-red-400',
        bet: 'Forfeited: ₹100',
        cards: [
          { faceUp: true, rank: '9', suit: '♣' },
          { faceUp: true, rank: '6', suit: '♦' },
          { faceUp: true, rank: '2', suit: '♠' }
        ],
        state: 'seat-folded'
      },
      you: {
        badge: 'MATCHED ₹400',
        badgeClass: 'bg-emerald-500/20 text-neonEmerald',
        bet: 'Invested: ₹500',
        cards: [
          { faceUp: true, rank: 'A', suit: '♠' },
          { faceUp: true, rank: 'K', suit: '♠' },
          { faceUp: true, rank: 'Q', suit: '♠' }
        ],
        state: 'seat-active-turn'
      }
    }
  },
  {
    step: 5,
    tag: 'Phase 5 • Private Compromise',
    title: 'Step 5: The Sideshow (Compromise)',
    headline: 'Two Seen Players Privately Compare Hands Mid-Round',
    desc: 'When two consecutive players are both SEEN, the current player can pay the Chaal and request a SIDESHOW (Compromise) with the previous Seen player. Player A peeks at their cards (7♦ 4♠ 2♥), pays ₹400, and requests a private Sideshow with Dealer. Dealer’s Pair of Kings wins privately — Player A auto-packs without exposing Dealer’s cards to You!',
    potAmount: '₹1,700',
    potSubtext: 'Sideshow: Dealer Beats Player A Privately',
    currentStake: '₹400 (Sideshow)',
    activePlayersText: '2 Active • 2 Packed',
    showSideshowOverlay: true,
    bullets: [
      'A Sideshow cannot be requested against or by a Blind player (both must be Seen).',
      'Player A switches to Seen, pays ₹400, and compares privately against Dealer.',
      'Dealer’s Pair of Kings beats Player A’s 7-High privately — Player A auto-packs!'
    ],
    logs: [
      '[SEEN] Player A looks at cards (7♦ 4♠ 2♥) and pays ₹400 Chaal.',
      '[SIDESHOW] Player A requests a private Sideshow comparison with Dealer!',
      '[PACK] Dealer’s hand beats Player A privately — Player A auto-packs! Pot reaches ₹1,700.'
    ],
    seats: {
      dealer: {
        badge: 'WON SIDESHOW',
        badgeClass: 'bg-amber-500/30 text-amberGlow',
        bet: 'Invested: ₹500',
        cards: [{ faceUp: false }, { faceUp: false }, { faceUp: false }],
        state: 'seat-active-turn'
      },
      playerA: {
        badge: 'LOST SIDESHOW (PACKED)',
        badgeClass: 'bg-red-500/25 text-red-400',
        bet: 'Forfeited: ₹600',
        cards: [
          { faceUp: true, rank: '7', suit: '♦' },
          { faceUp: true, rank: '4', suit: '♠' },
          { faceUp: true, rank: '2', suit: '♥' }
        ],
        state: 'seat-folded'
      },
      playerB: {
        badge: 'PACKED / FOLDED',
        badgeClass: 'bg-red-500/25 text-red-400',
        bet: 'Forfeited: ₹100',
        cards: [
          { faceUp: true, rank: '9', suit: '♣' },
          { faceUp: true, rank: '6', suit: '♦' },
          { faceUp: true, rank: '2', suit: '♠' }
        ],
        state: 'seat-folded'
      },
      you: {
        badge: 'SEEN (A♠ K♠ Q♠)',
        badgeClass: 'bg-gold/30 text-gold',
        bet: 'Invested: ₹500',
        cards: [
          { faceUp: true, rank: 'A', suit: '♠' },
          { faceUp: true, rank: 'K', suit: '♠' },
          { faceUp: true, rank: 'Q', suit: '♠' }
        ],
        state: ''
      }
    }
  },
  {
    step: 6,
    tag: 'Phase 6 • Final Reveal',
    title: 'Step 6: The Showdown',
    headline: 'Final 2 Players Reveal Cards — Winning Hand Sweeps the Pot!',
    desc: 'When only two active players remain (Dealer and You), paying the ₹400 Show stake triggers the SHOWDOWN. Both players turn their cards face-up. Your Royal Pure Sequence (A♠ K♠ Q♠, Rank #2) defeats Dealer’s Pair of Kings (K♣ K♥ 5♠, Rank #5) and wins the entire ₹2,100 pot!',
    potAmount: '₹2,100 → YOU WIN!',
    potSubtext: 'Pure Sequence (A♠ K♠ Q♠) Beats Pair of Kings!',
    currentStake: 'SHOWDOWN COMPLETE',
    activePlayersText: 'Winner: You (Hero)',
    showSideshowOverlay: false,
    bullets: [
      'A Show is only permitted when exactly 2 players remain in the hand.',
      'Your Pure Sequence (A♠ K♠ Q♠) ranks #2 (90% strength) vs. Dealer’s Pair of Kings (#5, 40% strength).',
      'All ₹2,100 in the central pot is awarded to You!'
    ],
    logs: [
      '[SHOW] You pay ₹400 for the Show! Final 2 players (You vs. Dealer) reveal hands.',
      '[DEALER] Shows K♣ K♥ 5♠ — Pair of Kings (Rank #5).',
      '[HERO] Shows A♠ K♠ Q♠ — Royal Pure Sequence (Rank #2)!',
      '[WINNER] You win the entire ₹2,100 pot!'
    ],
    seats: {
      dealer: {
        badge: 'PAIR OF KINGS (#5)',
        badgeClass: 'bg-slate-800 text-amberGlow',
        bet: 'Lost Showdown (₹500)',
        cards: [
          { faceUp: true, rank: 'K', suit: '♣' },
          { faceUp: true, rank: 'K', suit: '♥' },
          { faceUp: true, rank: '5', suit: '♠' }
        ],
        state: ''
      },
      playerA: {
        badge: 'PACKED (SIDESHOW)',
        badgeClass: 'bg-red-500/20 text-red-400',
        bet: 'Forfeited: ₹600',
        cards: [
          { faceUp: true, rank: '7', suit: '♦' },
          { faceUp: true, rank: '4', suit: '♠' },
          { faceUp: true, rank: '2', suit: '♥' }
        ],
        state: 'seat-folded'
      },
      playerB: {
        badge: 'PACKED',
        badgeClass: 'bg-red-500/20 text-red-400',
        bet: 'Forfeited: ₹100',
        cards: [
          { faceUp: true, rank: '9', suit: '♣' },
          { faceUp: true, rank: '6', suit: '♦' },
          { faceUp: true, rank: '2', suit: '♠' }
        ],
        state: 'seat-folded'
      },
      you: {
        badge: '🏆 WINNER (+₹2,100)',
        badgeClass: 'bg-emerald-500 text-obsidian font-extrabold',
        bet: 'Pure Sequence Wins!',
        cards: [
          { faceUp: true, rank: 'A', suit: '♠' },
          { faceUp: true, rank: 'K', suit: '♠' },
          { faceUp: true, rank: 'Q', suit: '♠' }
        ],
        state: 'seat-winner-glow'
      }
    }
  }
];

function initGameSimulatorSection() {
  let currentStep = 1;
  let autoPlayTimer = null;

  const btnPrev = document.getElementById('sim-btn-prev');
  const btnNext = document.getElementById('sim-btn-next');
  const btnAuto = document.getElementById('sim-btn-autoplay');
  const autoLabel = document.getElementById('sim-autoplay-label');
  const stepIndicator = document.getElementById('sim-step-indicator');
  const stepPills = Array.from(document.querySelectorAll('.sim-step-pill'));

  const toggleBlindBtn = document.getElementById('toggle-mode-blind');
  const toggleSeenBtn = document.getElementById('toggle-mode-seen');
  const calcOutput = document.getElementById('blind-seen-calc-output');

  function animateChipBurst(toWinner = false) {
    const layer = document.getElementById('sim-flying-chips-layer');
    if (!layer || !window.gsap) return;
    layer.innerHTML = '';

    const offsets = [
      { x: 0, y: -115 },
      { x: -175, y: 0 },
      { x: 175, y: 0 },
      { x: 0, y: 115 }
    ];

    offsets.forEach((pos, idx) => {
      const chip = document.createElement('div');
      chip.className =
        'w-6 h-6 rounded-full bg-gradient-to-br from-gold to-amber-700 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-mono font-bold text-obsidian absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';
      chip.textContent = '₹';
      layer.appendChild(chip);

      if (!toWinner) {
        window.gsap.fromTo(
          chip,
          { x: pos.x, y: pos.y, opacity: 1, scale: 0.9 },
          {
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0.5,
            duration: 0.65,
            delay: idx * 0.06,
            ease: 'power2.inOut'
          }
        );
      } else {
        window.gsap.fromTo(
          chip,
          { x: 0, y: 0, opacity: 1, scale: 1 },
          {
            x: 0,
            y: 125,
            opacity: 0,
            scale: 1.15,
            duration: 0.75,
            delay: idx * 0.08,
            ease: 'back.in(1.2)'
          }
        );
      }
    });
  }

  function renderSimulatorStep(stepNumber, playAudio = true) {
    currentStep = Math.max(1, Math.min(SIMULATOR_STEPS.length, stepNumber));
    const data = SIMULATOR_STEPS[currentStep - 1];

    // Update Stepper Controls & Pills
    if (stepIndicator) stepIndicator.textContent = `Step ${currentStep} of 6`;
    if (btnPrev) btnPrev.disabled = currentStep === 1;
    if (btnNext) {
      btnNext.querySelector('span').textContent = currentStep === 6 ? 'Restart Loop' : 'Next Step';
    }

    stepPills.forEach((pill) => {
      const pillStep = Number(pill.dataset.step);
      pill.classList.toggle('active-step', pillStep === currentStep);
    });

    // Update Table Header & Center Pot
    document.getElementById('sim-table-step-badge').textContent = `STEP ${currentStep} OF 6`;
    document.getElementById('sim-table-headline').textContent = data.headline;
    document.getElementById('sim-current-stake').textContent = data.currentStake;
    document.getElementById('sim-pot-amount').textContent = data.potAmount;
    document.getElementById('sim-pot-subtext').textContent = data.potSubtext;
    document.getElementById('sim-active-players-count').textContent = data.activePlayersText;

    // Sideshow Overlay
    const sideshowOverlay = document.getElementById('sim-sideshow-overlay');
    if (sideshowOverlay) {
      sideshowOverlay.classList.toggle('hidden', !data.showSideshowOverlay);
    }

    // Update Coaching Sidebar
    document.getElementById('sim-coach-tag').textContent = data.tag;
    document.getElementById('sim-coach-title').textContent = data.title;
    document.getElementById('sim-coach-desc').textContent = data.desc;

    const bulletsEl = document.getElementById('sim-coach-bullets');
    if (bulletsEl) {
      bulletsEl.innerHTML = data.bullets.map((b) => `<li>${b}</li>`).join('');
    }

    const logEl = document.getElementById('sim-action-log');
    if (logEl) {
      logEl.innerHTML = data.logs
        .map(
          (line) =>
            `<div class="px-2.5 py-1.5 rounded-lg bg-obsidian/70 border border-slate-800 text-slate-300">${line}</div>`
        )
        .join('');
    }

    // Update All 4 Player Seats
    ['dealer', 'playerA', 'playerB', 'you'].forEach((seatKey) => {
      const seatData = data.seats[seatKey];
      const seatContainer = document.getElementById(`seat-${seatKey}`);
      const seatCard = seatContainer ? seatContainer.querySelector('.seat-card') : null;
      const statusEl = document.getElementById(`status-${seatKey}`);
      const betEl = document.getElementById(`bet-${seatKey}`);
      const cardsEl = document.getElementById(`cards-${seatKey}`);

      if (seatCard) {
        seatCard.classList.remove('seat-active-turn', 'seat-winner-glow', 'seat-folded');
        if (seatData.state) seatCard.classList.add(seatData.state);
      }

      if (statusEl) {
        statusEl.textContent = seatData.badge;
        statusEl.className = `seat-badge px-2 py-0.5 rounded text-[10px] font-mono ${seatData.badgeClass}`;
      }

      if (betEl) {
        betEl.textContent = seatData.bet;
      }

      if (cardsEl) {
        if (seatData.cards.length === 0) {
          cardsEl.innerHTML = `<span class="text-[11px] font-mono text-slate-500 italic">Waiting for Deal...</span>`;
        } else {
          cardsEl.innerHTML = seatData.cards.map((c) => renderMiniTableCardHTML(c, c.faceUp)).join('');
        }
      }
    });

    // Sound & Visual Animations per Step
    if (playAudio) {
      if (currentStep === 1 || currentStep === 4) {
        soundFX.chipClink();
        animateChipBurst(false);
      } else if (currentStep === 2) {
        soundFX.cardSlide();
      } else if (currentStep === 3 || currentStep === 5) {
        soundFX.cardFlip();
      } else if (currentStep === 6) {
        soundFX.winChime();
        animateChipBurst(true);
      }
    }
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
    if (autoLabel) autoLabel.textContent = 'Auto-Play';
    if (btnAuto) btnAuto.classList.remove('bg-gold', 'text-obsidian');
  }

  function toggleAutoPlay() {
    if (autoPlayTimer) {
      stopAutoPlay();
      return;
    }
    if (autoLabel) autoLabel.textContent = 'Stop Auto-Play';
    if (btnAuto) btnAuto.classList.add('bg-gold', 'text-obsidian');
    autoPlayTimer = setInterval(() => {
      const next = currentStep >= 6 ? 1 : currentStep + 1;
      renderSimulatorStep(next, true);
    }, 2600);
  }

  // Event Listeners
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      stopAutoPlay();
      renderSimulatorStep(currentStep - 1, true);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      stopAutoPlay();
      const next = currentStep >= 6 ? 1 : currentStep + 1;
      renderSimulatorStep(next, true);
    });
  }

  if (btnAuto) {
    btnAuto.addEventListener('click', toggleAutoPlay);
  }

  stepPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      stopAutoPlay();
      renderSimulatorStep(Number(pill.dataset.step), true);
    });
  });

  // Interactive Blind vs. Seen Calculator Toggle (Also updates Hero table seat on Step 3)
  if (toggleBlindBtn && toggleSeenBtn && calcOutput) {
    toggleBlindBtn.addEventListener('click', () => {
      soundFX.chipClink();
      toggleBlindBtn.className = 'px-3 py-2 rounded-xl border border-neonEmerald bg-emerald-500/20 text-xs font-mono text-neonEmerald text-center transition-all';
      toggleSeenBtn.className = 'px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/70 text-xs font-mono text-slate-300 text-center transition-all';
      calcOutput.innerHTML = `Current Stake: <strong class="text-gold">₹100</strong> → As a <strong class="text-neonEmerald">Blind (1×)</strong> player, you only pay <strong class="text-white">₹100 (1×)</strong> to Call or <strong class="text-amberGlow">₹200 (2×)</strong> to Raise.`;

      if (currentStep === 3) {
        const statusYou = document.getElementById('status-you');
        const betYou = document.getElementById('bet-you');
        const cardsYou = document.getElementById('cards-you');
        if (statusYou) {
          statusYou.textContent = 'BLIND (1× BET)';
          statusYou.className = 'seat-badge px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-neonEmerald';
        }
        if (betYou) betYou.textContent = 'Min Bet: ₹100 (1×)';
        if (cardsYou) {
          cardsYou.innerHTML = [{ faceUp: false }, { faceUp: false }, { faceUp: false }]
            .map((c) => renderMiniTableCardHTML(c, false))
            .join('');
        }
      }
    });

    toggleSeenBtn.addEventListener('click', () => {
      soundFX.chipClink();
      toggleSeenBtn.className = 'px-3 py-2 rounded-xl border border-gold bg-gold/20 text-xs font-mono text-gold text-center transition-all';
      toggleBlindBtn.className = 'px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/70 text-xs font-mono text-slate-300 text-center transition-all';
      calcOutput.innerHTML = `Current Stake: <strong class="text-gold">₹100</strong> → As a <strong class="text-gold">Seen (Chaal 2×)</strong> player, you must bet <strong class="text-white">₹200 (2×)</strong> to Call or <strong class="text-amberGlow">₹400 (4×)</strong> to Raise.`;

      if (currentStep === 3) {
        const statusYou = document.getElementById('status-you');
        const betYou = document.getElementById('bet-you');
        const cardsYou = document.getElementById('cards-you');
        if (statusYou) {
          statusYou.textContent = 'SEEN (A♠ K♠ Q♠)';
          statusYou.className = 'seat-badge px-2 py-0.5 rounded text-[10px] font-mono bg-gold/25 text-gold';
        }
        if (betYou) betYou.textContent = 'Min Chaal: ₹200 (2×)';
        if (cardsYou) {
          cardsYou.innerHTML = [
            { faceUp: true, rank: 'A', suit: '♠' },
            { faceUp: true, rank: 'K', suit: '♠' },
            { faceUp: true, rank: 'Q', suit: '♠' }
          ]
            .map((c) => renderMiniTableCardHTML(c, true))
            .join('');
        }
      }
    });
  }

  // Initial Render
  renderSimulatorStep(1, false);

  return {
    nextStep: () => {
      stopAutoPlay();
      renderSimulatorStep(currentStep >= 6 ? 1 : currentStep + 1, true);
    },
    prevStep: () => {
      stopAutoPlay();
      if (currentStep > 1) renderSimulatorStep(currentStep - 1, true);
    },
    toggleAutoPlay
  };
}

/* ==========================================================================
   6. SECTION D CONTROLLER: "WHICH HAND WINS?" GAMIFIED QUIZ ENGINE
   ========================================================================== */
const RANK_VALUES = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14
};

const VALUE_NAMES = {
  14: 'Ace',
  13: 'King',
  12: 'Queen',
  11: 'Jack',
  10: '10',
  9: '9',
  8: '8',
  7: '7',
  6: '6',
  5: '5',
  4: '4',
  3: '3',
  2: '2'
};

/**
 * Evaluates a 3-card Teen Patti hand and returns:
 * - category (6 = Trio, 5 = Pure Sequence, 4 = Sequence, 3 = Color, 2 = Pair, 1 = High Card)
 * - categoryName
 * - tiebreakers: array of numbers for lexicographical comparison
 * - score: single composite integer for instant comparison
 * - summary: human-readable description of the hand
 */
export function evaluateTeenPattiHand(cards) {
  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
  const vals = sortedCards.map((c) => RANK_VALUES[c.rank]);
  const suits = sortedCards.map((c) => c.suit);
  const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

  const isTrio = vals[0] === vals[1] && vals[1] === vals[2];

  // Check Sequence: In Teen Patti, A-K-Q is highest (seqScore 15), A-2-3 is 2nd highest (seqScore 14),
  // then K-Q-J (13) down to 4-3-2 (4).
  let isSequence = false;
  let seqStrength = 0;
  let orderedSeqCards = sortedCards;

  if (vals[0] === 14 && vals[1] === 13 && vals[2] === 12) {
    isSequence = true;
    seqStrength = 15; // A-K-Q highest sequence
  } else if (vals[0] === 14 && vals[1] === 3 && vals[2] === 2) {
    isSequence = true;
    seqStrength = 14; // A-2-3 second highest sequence in Teen Patti
    orderedSeqCards = [sortedCards[0], sortedCards[2], sortedCards[1]]; // A-2-3 display order
  } else if (vals[0] - vals[1] === 1 && vals[1] - vals[2] === 1) {
    isSequence = true;
    seqStrength = vals[0]; // e.g., K-Q-J = 13
  }

  let category = 1;
  let categoryName = 'High Card';
  let t1 = vals[0];
  let t2 = vals[1];
  let t3 = vals[2];
  let summary = `${VALUE_NAMES[vals[0]]}-High (${sortedCards.map((c) => c.rank).join('-')})`;

  if (isTrio) {
    category = 6;
    categoryName = 'Trio (Three of a Kind)';
    t1 = vals[0];
    t2 = 0;
    t3 = 0;
    summary = `Trio of ${VALUE_NAMES[vals[0]]}s`;
  } else if (isFlush && isSequence) {
    category = 5;
    categoryName = 'Pure Sequence';
    t1 = seqStrength;
    t2 = 0;
    t3 = 0;
    summary = `Pure Sequence (${orderedSeqCards.map((c) => `${c.rank}${c.suit}`).join(' ')})`;
  } else if (isSequence) {
    category = 4;
    categoryName = 'Sequence';
    t1 = seqStrength;
    t2 = 0;
    t3 = 0;
    summary = `Sequence (${orderedSeqCards.map((c) => c.rank).join('-')})`;
  } else if (isFlush) {
    category = 3;
    categoryName = 'Color (Flush)';
    summary = `Color Flush (${sortedCards.map((c) => `${c.rank}${c.suit}`).join(' ')})`;
  } else if (vals[0] === vals[1] || vals[1] === vals[2]) {
    category = 2;
    categoryName = 'Pair';
    const pairVal = vals[0] === vals[1] ? vals[0] : vals[1];
    const kickerVal = vals[0] === vals[1] ? vals[2] : vals[0];
    t1 = pairVal;
    t2 = kickerVal;
    t3 = 0;
    summary = `Pair of ${VALUE_NAMES[pairVal]}s (${VALUE_NAMES[kickerVal]} kicker)`;
  }

  const score = category * 1000000 + t1 * 10000 + t2 * 100 + t3;
  return {
    category,
    categoryName,
    t1,
    t2,
    t3,
    score,
    summary
  };
}

/**
 * Generates a rich explanation of why winnerEval beat loserEval.
 */
export function buildMatchupExplanation(winnerLabel, loserLabel, winEval, loseEval) {
  if (winEval.category !== loseEval.category) {
    return `${winnerLabel}'s ${winEval.summary} (Rank #${7 - winEval.category}) beats ${loserLabel}'s ${loseEval.summary} (Rank #${7 - loseEval.category})!`;
  }
  if (winEval.category === 2) {
    if (winEval.t1 !== loseEval.t1) {
      return `Both hands had a Pair, but ${winnerLabel}'s Pair of ${VALUE_NAMES[winEval.t1]}s outranks ${loserLabel}'s Pair of ${VALUE_NAMES[loseEval.t1]}s!`;
    }
    return `Both had a Pair of ${VALUE_NAMES[winEval.t1]}s, but ${winnerLabel} won with a ${VALUE_NAMES[winEval.t2]} kicker vs. ${loserLabel}'s ${VALUE_NAMES[loseEval.t2]} kicker!`;
  }
  if (winEval.category === 4 || winEval.category === 5) {
    return `Both had a ${winEval.categoryName}, but ${winnerLabel}'s higher sequence (${winEval.summary}) beats ${loserLabel}'s (${loseEval.summary})!`;
  }
  if (winEval.category === 1 || winEval.category === 3) {
    if (winEval.t1 !== loseEval.t1) {
      return `Both had ${winEval.categoryName}, and ${winnerLabel} won on a higher top card (${VALUE_NAMES[winEval.t1]} vs. ${VALUE_NAMES[loseEval.t1]}: ${winEval.summary} vs. ${loseEval.summary})!`;
    }
    if (winEval.t2 !== loseEval.t2) {
      return `Both had ${winEval.categoryName} with a ${VALUE_NAMES[winEval.t1]} high card, so ${winnerLabel} won on the second card (${VALUE_NAMES[winEval.t2]} vs. ${VALUE_NAMES[loseEval.t2]})!`;
    }
    return `Both had ${winEval.categoryName} sharing ${VALUE_NAMES[winEval.t1]}-${VALUE_NAMES[winEval.t2]}, so ${winnerLabel} won on the third kicker (${VALUE_NAMES[winEval.t3]} vs. ${VALUE_NAMES[loseEval.t3]})!`;
  }
  return `Both had ${winEval.categoryName}, and ${winnerLabel} won on higher card rank (${winEval.summary} vs. ${loseEval.summary})!`;
}

function createRandomNonTiedMatchup() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  // Curated tricky & classic matchups mixed with random deck deals
  const curatedPool = [
    {
      handA: [
        { rank: 'K', suit: '♠' },
        { rank: 'Q', suit: '♠' },
        { rank: 'J', suit: '♠' }
      ],
      handB: [
        { rank: 'A', suit: '♦' },
        { rank: 'K', suit: '♣' },
        { rank: 'Q', suit: '♥' }
      ]
    },
    {
      handA: [
        { rank: 'Q', suit: '♠' },
        { rank: 'Q', suit: '♥' },
        { rank: 'A', suit: '♦' }
      ],
      handB: [
        { rank: 'Q', suit: '♣' },
        { rank: 'Q', suit: '♦' },
        { rank: '9', suit: '♠' }
      ]
    },
    {
      handA: [
        { rank: '2', suit: '♠' },
        { rank: '2', suit: '♥' },
        { rank: '2', suit: '♦' }
      ],
      handB: [
        { rank: 'A', suit: '♠' },
        { rank: 'K', suit: '♠' },
        { rank: 'Q', suit: '♠' }
      ]
    },
    {
      handA: [
        { rank: 'A', suit: '♥' },
        { rank: '2', suit: '♣' },
        { rank: '3', suit: '♦' }
      ],
      handB: [
        { rank: 'K', suit: '♠' },
        { rank: 'Q', suit: '♦' },
        { rank: 'J', suit: '♣' }
      ]
    },
    {
      handA: [
        { rank: '9', suit: '♠' },
        { rank: '8', suit: '♦' },
        { rank: '7', suit: '♣' }
      ],
      handB: [
        { rank: 'A', suit: '♥' },
        { rank: 'J', suit: '♥' },
        { rank: '4', suit: '♥' }
      ]
    }
  ];

  if (Math.random() < 0.45) {
    const preset = curatedPool[Math.floor(Math.random() * curatedPool.length)];
    const swap = Math.random() < 0.5;
    return swap
      ? { handA: preset.handB, handB: preset.handA }
      : { handA: preset.handA, handB: preset.handB };
  }

  // Full 52-card shuffle
  for (let attempt = 0; attempt < 20; attempt++) {
    const deck = [];
    for (const s of suits) {
      for (const r of ranks) {
        deck.push({ rank: r, suit: s });
      }
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    const handA = deck.slice(0, 3);
    const handB = deck.slice(3, 6);
    if (evaluateTeenPattiHand(handA).score !== evaluateTeenPattiHand(handB).score) {
      return { handA, handB };
    }
  }

  return curatedPool[0];
}

function initQuizEngineSection() {
  const handAContainer = document.getElementById('quiz-hand-a');
  const handBContainer = document.getElementById('quiz-hand-b');
  const handACardsEl = document.getElementById('quiz-hand-a-cards');
  const handBCardsEl = document.getElementById('quiz-hand-b-cards');
  const handABadge = document.getElementById('quiz-hand-a-badge');
  const handBBadge = document.getElementById('quiz-hand-b-badge');

  const streakEl = document.getElementById('quiz-streak');
  const bestStreakEl = document.getElementById('quiz-best-streak');
  const accuracyEl = document.getElementById('quiz-accuracy');
  const fractionEl = document.getElementById('quiz-score-fraction');
  const timerTextEl = document.getElementById('quiz-timer-text');
  const timerBarEl = document.getElementById('quiz-timer-bar');

  const feedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackIcon = document.getElementById('quiz-feedback-icon');
  const feedbackTitle = document.getElementById('quiz-feedback-title');
  const feedbackExplanation = document.getElementById('quiz-feedback-explanation');
  const btnNext = document.getElementById('quiz-btn-next');
  const btnPauseTimer = document.getElementById('quiz-btn-pause-timer');

  if (!handAContainer || !handBContainer) return null;

  let streak = 0;
  let bestStreak = 0;
  let correctCount = 0;
  let totalAttempts = 0;

  let currentRound = null;
  let roundResolved = false;
  let timeRemaining = 10.0;
  let timerInterval = null;
  let timerPaused = false;
  let sectionInView = false;

  function updateScoreboardUI() {
    const acc = totalAttempts === 0 ? 100 : Math.round((correctCount / totalAttempts) * 100);
    if (streakEl) streakEl.textContent = `${streak} 🔥`;
    if (bestStreakEl) bestStreakEl.textContent = `Best: ${bestStreak}`;
    if (accuracyEl) accuracyEl.textContent = `${acc}%`;
    if (fractionEl) fractionEl.textContent = `${correctCount} / ${totalAttempts}`;
  }

  function stopRoundTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startRoundTimer() {
    stopRoundTimer();
    timeRemaining = 10.0;
    updateTimerUI();

    timerInterval = setInterval(() => {
      if (timerPaused || roundResolved || !sectionInView) return;
      timeRemaining = Math.max(0, +(timeRemaining - 0.1).toFixed(1));
      updateTimerUI();

      if (timeRemaining <= 0) {
        stopRoundTimer();
        handleAnswer(null); // Timeout
      }
    }, 100);
  }

  function updateTimerUI() {
    if (timerTextEl) timerTextEl.textContent = `${timeRemaining.toFixed(1)}s`;
    if (timerBarEl) {
      const pct = Math.max(0, Math.min(100, (timeRemaining / 10.0) * 100));
      timerBarEl.style.width = `${pct}%`;
    }
  }

  function dealNewQuizRound(playDealSound = true) {
    roundResolved = false;
    timerPaused = false;
    if (btnPauseTimer) btnPauseTimer.textContent = 'Pause Timer';
    const { handA, handB } = createRandomNonTiedMatchup();
    const evalA = evaluateTeenPattiHand(handA);
    const evalB = evaluateTeenPattiHand(handB);
    const winner = evalA.score > evalB.score ? 'A' : 'B';

    currentRound = { handA, handB, evalA, evalB, winner };

    handAContainer.classList.remove('quiz-correct-glow', 'quiz-wrong-shake');
    handBContainer.classList.remove('quiz-correct-glow', 'quiz-wrong-shake');

    if (handABadge) {
      handABadge.textContent = 'Inspect & Pick';
      handABadge.className = 'text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300';
    }
    if (handBBadge) {
      handBBadge.textContent = 'Inspect & Pick';
      handBBadge.className = 'text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300';
    }

    handACardsEl.innerHTML = handA.map((c) => render3DCardHTML(c, '', false)).join('');
    handBCardsEl.innerHTML = handB.map((c) => render3DCardHTML(c, '', false)).join('');

    if (feedbackTitle) {
      feedbackTitle.textContent = 'Which Hand Wins? Click Hand A or Hand B!';
      feedbackTitle.className = 'font-heading font-bold text-base sm:text-lg text-white';
    }
    if (feedbackExplanation) {
      feedbackExplanation.textContent =
        'Compare both 3-card hands before the 10-second timer expires (Trio > Pure Sequence > Sequence > Color > Pair > High Card).';
    }
    if (feedbackIcon) {
      feedbackIcon.textContent = '?';
      feedbackIcon.className =
        'w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0 text-gold font-bold';
    }
    if (feedbackBox) {
      feedbackBox.className =
        'rounded-2xl p-4 sm:p-5 bg-obsidian/90 border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all';
    }

    if (playDealSound) soundFX.cardSlide();
    startRoundTimer();
  }

  function handleAnswer(selectedSide) {
    if (!currentRound || roundResolved) return;
    roundResolved = true;
    stopRoundTimer();

    const { evalA, evalB, winner } = currentRound;
    const isCorrect = selectedSide === winner;
    totalAttempts += 1;

    // Reveal Hand Category Badges
    if (handABadge) {
      handABadge.textContent = evalA.categoryName;
      handABadge.className =
        winner === 'A'
          ? 'text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-neonEmerald border border-emerald-500/40 font-bold'
          : 'text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300';
    }
    if (handBBadge) {
      handBBadge.textContent = evalB.categoryName;
      handBBadge.className =
        winner === 'B'
          ? 'text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-neonEmerald border border-emerald-500/40 font-bold'
          : 'text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300';
    }

    const explanationText =
      winner === 'A'
        ? buildMatchupExplanation('Hand A', 'Hand B', evalA, evalB)
        : buildMatchupExplanation('Hand B', 'Hand A', evalB, evalA);

    if (isCorrect) {
      correctCount += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      soundFX.winChime();

      const chosenEl = selectedSide === 'A' ? handAContainer : handBContainer;
      chosenEl.classList.add('quiz-correct-glow');

      if (feedbackIcon) {
        feedbackIcon.textContent = '✓';
        feedbackIcon.className =
          'w-10 h-10 rounded-xl bg-emerald-500/20 border border-neonEmerald flex items-center justify-center shrink-0 text-neonEmerald font-bold';
      }
      if (feedbackTitle) {
        feedbackTitle.textContent = `Correct! Hand ${winner} Wins! (+1 Streak)`;
        feedbackTitle.className = 'font-heading font-bold text-base sm:text-lg text-neonEmerald';
      }
      if (feedbackBox) {
        feedbackBox.className =
          'rounded-2xl p-4 sm:p-5 bg-emerald-950/50 border border-neonEmerald/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all';
      }
    } else {
      streak = 0;
      soundFX.errorBuzz();

      if (selectedSide === 'A') {
        handAContainer.classList.add('quiz-wrong-shake');
        handBContainer.classList.add('quiz-correct-glow');
      } else if (selectedSide === 'B') {
        handBContainer.classList.add('quiz-wrong-shake');
        handAContainer.classList.add('quiz-correct-glow');
      } else {
        // Timeout
        handAContainer.classList.add(winner === 'A' ? 'quiz-correct-glow' : 'quiz-wrong-shake');
        handBContainer.classList.add(winner === 'B' ? 'quiz-correct-glow' : 'quiz-wrong-shake');
      }

      if (feedbackIcon) {
        feedbackIcon.textContent = '✕';
        feedbackIcon.className =
          'w-10 h-10 rounded-xl bg-red-500/20 border border-crimson flex items-center justify-center shrink-0 text-crimson font-bold';
      }
      if (feedbackTitle) {
        feedbackTitle.textContent =
          selectedSide === null
            ? `Time's Up! Hand ${winner} Was the Winner`
            : `Not Quite — Hand ${winner} Wins This Showdown!`;
        feedbackTitle.className = 'font-heading font-bold text-base sm:text-lg text-crimson';
      }
      if (feedbackBox) {
        feedbackBox.className =
          'rounded-2xl p-4 sm:p-5 bg-red-950/40 border border-crimson/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all';
      }
    }

    if (feedbackExplanation) {
      feedbackExplanation.textContent = explanationText;
    }

    updateScoreboardUI();
  }

  handAContainer.addEventListener('click', () => handleAnswer('A'));
  handBContainer.addEventListener('click', () => handleAnswer('B'));

  handAContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAnswer('A');
    }
  });
  handBContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAnswer('B');
    }
  });

  if (btnNext) {
    btnNext.addEventListener('click', () => dealNewQuizRound(true));
  }

  if (btnPauseTimer) {
    btnPauseTimer.addEventListener('click', () => {
      timerPaused = !timerPaused;
      btnPauseTimer.textContent = timerPaused ? 'Resume Timer' : 'Pause Timer';
    });
  }

  // Only tick down the 10-second timer when the quiz section is visible in viewport
  const quizSection = document.getElementById('quiz-engine');
  if ('IntersectionObserver' in window && quizSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionInView = entry.isIntersecting;
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(quizSection);
  } else {
    sectionInView = true;
  }

  // Deal Initial Round
  dealNewQuizRound(false);

  return {
    pickHandA: () => handleAnswer('A'),
    pickHandB: () => handleAnswer('B'),
    nextHand: () => dealNewQuizRound(true)
  };
}

/* ==========================================================================
   7. SECTION E CONTROLLER: TERMINOLOGY & RULE CHEAT SHEET GRID
   ========================================================================== */
const GLOSSARY_TERMS = [
  {
    term: 'Boot',
    hindi: 'बूट • Initial Stake',
    category: 'Betting',
    badgeColor: 'text-gold border-gold/40 bg-gold/10',
    definition: 'The minimum initial stake put in the pot by every player before cards are dealt.',
    proTip: 'Higher Boot tables create larger starting pots and reward aggressive early play.'
  },
  {
    term: 'Chaal',
    hindi: 'चाल • Seen Bet',
    category: 'Betting',
    badgeColor: 'text-amberGlow border-amber-500/40 bg-amber-500/10',
    definition: 'A bet made by a player after viewing their cards (Seen player). Must be at least 2× the Blind bet.',
    proTip: 'Once you switch from Blind to Chaal, you cannot return to Blind status in that hand.'
  },
  {
    term: 'Blind',
    hindi: 'ब्लाइंड • Unseen Bet',
    category: 'Betting',
    badgeColor: 'text-neonEmerald border-emerald-500/40 bg-emerald-500/10',
    definition: 'Betting without looking at your dealt cards. Blind players enjoy a 1× betting cost advantage.',
    proTip: 'Playing 1–2 rounds Blind keeps your pot investment low while pressuring Seen players at 2× cost.'
  },
  {
    term: 'Pack / Fold',
    hindi: 'पैक • Surrender Hand',
    category: 'Actions',
    badgeColor: 'text-crimson border-red-500/40 bg-red-500/10',
    definition: 'Forfeiting the current round and discarding your cards. You lose any chips already contributed to the pot.',
    proTip: '74% of hands are High Card — folding weak hands early saves your bankroll for premium spots.'
  },
  {
    term: 'Sideshow',
    hindi: 'साइडशो • Compromise',
    category: 'Actions',
    badgeColor: 'text-amberGlow border-amber-500/40 bg-amber-500/10',
    definition: 'Requesting a private card comparison with the immediately preceding player (both players must be Seen).',
    proTip: 'If both hands are tied during a Sideshow, the player who requested the Sideshow must Pack!'
  },
  {
    term: 'Show',
    hindi: 'शो • Final Reveal',
    category: 'Showdown',
    badgeColor: 'text-gold border-gold/40 bg-gold/10',
    definition: 'The final card reveal when only two active players remain in the hand to determine the pot winner.',
    proTip: 'In a head-to-head Show tie, the player who paid for the Show loses; otherwise the stronger hand wins.'
  },
  {
    term: 'Pot Limit',
    hindi: 'पॉट लिमिट • Table Cap',
    category: 'Showdown',
    badgeColor: 'text-neonEmerald border-emerald-500/40 bg-emerald-500/10',
    definition: 'Maximum betting limit capped for a single turn or total central pot (typically 1024× the Boot).',
    proTip: 'If the central pot hits the Pot Limit cap, all remaining active players automatically flip their cards!'
  },
  {
    term: 'Trail / Trio',
    hindi: 'ट्रेल • Three of a Kind',
    category: 'Showdown',
    badgeColor: 'text-gold border-gold/40 bg-gold/10',
    definition: 'Three cards of the exact same rank (e.g., A♠ A♥ A♦). The #1 highest hand ranking in Teen Patti.',
    proTip: 'Only 52 out of 22,100 possible 3-card hands (0.24%) form a Trail.'
  },
  {
    term: 'Pakki Rung (Pure Sequence)',
    hindi: 'पक्की रंग • Straight Flush',
    category: 'Actions',
    badgeColor: 'text-neonEmerald border-emerald-500/40 bg-emerald-500/10',
    definition: 'Three consecutive cards of the exact same suit (e.g., A♠ K♠ Q♠ or A♥ 2♥ 3♥). The #2 strongest hand.',
    proTip: 'Remember that A-2-3 suited outranks K-Q-J suited in traditional Teen Patti rules!'
  }
];

function initGlossarySection() {
  const gridEl = document.getElementById('glossary-grid');
  const searchInput = document.getElementById('glossary-search');
  const filterBtns = Array.from(document.querySelectorAll('.glossary-filter-btn'));
  const emptyState = document.getElementById('glossary-empty');
  const resetBtn = document.getElementById('glossary-reset-btn');

  if (!gridEl) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function renderGlossary() {
    const q = searchQuery.trim().toLowerCase();
    const filtered = GLOSSARY_TERMS.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const matchesText =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.hindi.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    gridEl.innerHTML = filtered
      .map(
        (item) => `
        <article class="glass-panel rounded-2xl p-5 border border-gold/25 hover:border-gold/65 transition-all flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase border ${item.badgeColor}">
                ${item.category}
              </span>
              <span class="text-xs font-mono text-slate-400">${item.hindi}</span>
            </div>
            <h3 class="font-heading font-bold text-xl text-white group-hover:text-gold transition-colors">
              ${item.term}
            </h3>
            <p class="text-sm text-slate-300 mt-2 leading-relaxed">
              ${item.definition}
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 text-xs font-mono text-slate-400">
            <strong class="text-gold">Strategy Tip:</strong> ${item.proTip}
          </div>
        </article>
      `
      )
      .join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderGlossary();
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      filterBtns.forEach((b) => b.classList.toggle('active-filter', b === btn));
      soundFX.cardFlip();
      renderGlossary();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      filterBtns.forEach((b) => b.classList.toggle('active-filter', b.dataset.category === 'all'));
      renderGlossary();
    });
  }

  renderGlossary();
}

/* ==========================================================================
   8. BOOTSTRAP APPLICATION, NAVIGATION, SOUND TOGGLES & KEYBOARD SHORTCUTS
   ========================================================================== */
function initScrollAnimations() {
  if (typeof window === 'undefined' || !window.gsap) return;
  const gsap = window.gsap;
  if (window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  // Hero entrance micro-animation
  gsap.fromTo(
    '.hero-animate-in > *',
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out' }
  );

  // Scroll-triggered section reveals
  if (window.ScrollTrigger) {
    const sections = ['#hand-rankings', '#game-simulator', '#quiz-engine', '#glossary'];
    sections.forEach((selector) => {
      const el = document.querySelector(selector);
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll('h2, .glass-panel-gold, #sim-step-pills'),
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            once: true
          }
        }
      );
    });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Initialize GSAP & ScrollTrigger Animations
    initScrollAnimations();

    // Initialize Section A: 3D Hero Scene (A♠, K♠, Q♠)
    const heroScene = initHero3DScene({
      onCardFlipSound: () => soundFX.cardFlip(),
      onCardDealSound: () => soundFX.cardSlide()
    });

    const btnHeroFlip = document.getElementById('hero-btn-flip-all');
    const btnHeroFan = document.getElementById('hero-btn-fan');
    const btnHeroReset = document.getElementById('hero-btn-reset');

    if (btnHeroFlip && heroScene) {
      btnHeroFlip.addEventListener('click', () => heroScene.flipAllCards());
    }
    if (btnHeroFan && heroScene) {
      btnHeroFan.addEventListener('click', () => heroScene.dealAndFanCards());
    }
    if (btnHeroReset && heroScene) {
      btnHeroReset.addEventListener('click', () => heroScene.resetHeroView());
    }

    // Initialize Sections B, C, D, E
    initHandRankingsSection();
    const simControls = initGameSimulatorSection();
    const quizControls = initQuizEngineSection();
    initGlossarySection();

    // Mobile Menu Drawer Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
      });
      mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
      });
    }

    // Sound Mute / Unmute Toggles (Navbar & Footer)
    const navSoundBtn = document.getElementById('nav-sound-toggle');
    const navSoundLabel = document.getElementById('nav-sound-label');
    const footerSoundBtn = document.getElementById('footer-sound-toggle');
    const footerSoundText = document.getElementById('footer-sound-text');

    function updateSoundButtonsUI(isEnabled) {
      if (navSoundLabel) navSoundLabel.textContent = isEnabled ? 'SFX: ON' : 'SFX: OFF';
      if (footerSoundText) {
        footerSoundText.textContent = isEnabled
          ? 'Mute / Unmute Card Audio: ON'
          : 'Mute / Unmute Card Audio: MUTED';
      }
    }

    if (navSoundBtn) {
      navSoundBtn.addEventListener('click', () => {
        const state = soundFX.toggle();
        updateSoundButtonsUI(state);
      });
    }
    if (footerSoundBtn) {
      footerSoundBtn.addEventListener('click', () => {
        const state = soundFX.toggle();
        updateSoundButtonsUI(state);
      });
    }

    // Global Keyboard Shortcuts (Ignored when typing inside search input)
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowRight' && simControls) {
        simControls.nextStep();
      } else if (e.key === 'ArrowLeft' && simControls) {
        simControls.prevStep();
      } else if (e.key === ' ' && simControls && tag !== 'button') {
        e.preventDefault();
        simControls.toggleAutoPlay();
      } else if (e.key === '1' && quizControls) {
        quizControls.pickHandA();
      } else if (e.key === '2' && quizControls) {
        quizControls.pickHandB();
      } else if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) {
        const state = soundFX.toggle();
        updateSoundButtonsUI(state);
      }
    });
  });
}
