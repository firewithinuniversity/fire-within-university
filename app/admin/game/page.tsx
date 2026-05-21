"use client";

import { useRef, useEffect, useCallback, useState } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const CANVAS_W = 400;
const CANVAS_H = 650;
const TOP_BAR = 50;
const COLS = 8;
const CELL = Math.floor(CANVAS_W / COLS);
const BLOCK_PAD = 3;
const BLOCK_SIZE = CELL - BLOCK_PAD * 2;
const BALL_R = 7;
const BALL_SPEED = 8;
const LAUNCH_DELAY = 3;
const FLOOR_Y = CANVAS_H - 50;
const ROWS_VISIBLE = 10;
const GAME_OVER_ROW = ROWS_VISIBLE;
const TRAIL_LENGTH = 6;
const COMBO_WINDOW = 20; // frames between kills to keep combo alive
const BOSS_INTERVAL = 10; // boss spawns every N rounds
const SLOWMO_SPEED = 0.65;
const SLOWMO_DURATION = 90; // frames (~1.5s) before auto-cancel

// ── Sound engine ─────────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (audioCtx) return audioCtx;
  try { audioCtx = new AudioContext(); } catch { return null; }
  return audioCtx;
}

function playTone(type: OscillatorType, freq: number, dur: number, vol: number, ramp?: number) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  if (ramp) osc.frequency.exponentialRampToValueAtTime(ramp, ctx.currentTime + dur);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

function playHitSound(pitch = 1) { playTone("sine", 400 * pitch, 0.06, 0.08); }
function playDestroySound() { playTone("triangle", 600, 0.12, 0.12, 1200); }
function playLaunchSound() { playTone("sine", 300, 0.15, 0.06, 500); }
function playExplosionSound() { playTone("sawtooth", 200, 0.2, 0.15, 80); }

function playComboSound(combo: number) {
  const freq = 500 + Math.min(combo, 10) * 80;
  playTone("sine", freq, 0.1, 0.1);
}

function playLightningSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
  noise.buffer = buf;
  const gain = ctx.createGain();
  noise.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  noise.start(ctx.currentTime);
}

function playLevelUpSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

function playGameOverSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  [400, 350, 300, 200].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

function playBossDeathSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  [300, 400, 500, 600, 800, 1000].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.05;
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

// ── Color helpers ────────────────────────────────────────────────────────────
function hpColor(hp: number, maxHp: number): string {
  const ratio = Math.min(hp / Math.max(maxHp, 1), 1);
  if (ratio <= 0.15) return "#4caf50";
  if (ratio <= 0.35) return "#f5c542";
  if (ratio <= 0.55) return "#ff9800";
  if (ratio <= 0.75) return "#e91e63";
  if (ratio <= 0.9) return "#9c27b0";
  return "#f44336";
}

// ── Types ────────────────────────────────────────────────────────────────────
type BlockShape = "square" | "circle" | "triangle";
type BlockAbility = "normal" | "steel" | "explosive" | "ice";
type BallType = "normal" | "fire" | "split" | "giant";
type PickupType = "ball" | "lightning" | "fire" | "split" | "giant";

type Block = {
  col: number;
  row: number;
  hp: number;
  maxHp: number;
  shape: BlockShape;
  ability: BlockAbility;
  hitScale: number;
  isBoss: boolean;
  bossW: number;
  bossH: number;
  slideOffset: number; // for entry animation
};

type Pickup = {
  col: number;
  row: number;
  collected: boolean;
  type: PickupType;
};

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  active: boolean;
  settled: boolean;
  settledX: number;
  trail: { x: number; y: number }[];
  ballType: BallType;
  radius: number;
  hitsLeft: number; // for fire balls (pierce count)
  hasSplit: boolean;
};

type GameState = "aiming" | "launching" | "running" | "gameover";

type Particle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

type FloatingText = {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  scale: number;
};

type FlashEffect = { row: number; alpha: number };
type LevelBanner = { text: string; life: number };
type Confetti = { x: number; y: number; dx: number; dy: number; life: number; color: string; rot: number; rotSpeed: number };

interface GameData {
  state: GameState;
  round: number;
  score: number;
  highScore: number;
  ballCount: number;
  launchX: number;
  aimAngle: number | null;
  aimPos: { x: number; y: number } | null;
  balls: Ball[];
  blocks: Block[];
  pickups: Pickup[];
  ballsToLaunch: number;
  launchTimer: number;
  firstSettledX: number | null;
  extraBalls: number;
  animFrame: number;
  speed: number;
  flashes: FlashEffect[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  confetti: Confetti[];
  level: number;
  roundsThisLevel: number;
  shakeX: number;
  shakeY: number;
  levelBanner: LevelBanner | null;
  blocksDestroyed: number;
  ballsCollected: number;
  soundEnabled: boolean;
  gameOverPlayed: boolean;
  combo: number;
  comboTimer: number;
  maxCombo: number;
  nextBallType: BallType;
  slowmo: boolean;
  slowmoTimer: number;
  starRating: number;
  roundBlocksStart: number;
  roundBlocksDestroyed: number;
}

const LEVELS = [
  { name: "Warm Up", rounds: 5, spawnChance: 0.40, hpBonus: 0 },
  { name: "Getting Started", rounds: 8, spawnChance: 0.45, hpBonus: 0 },
  { name: "Heating Up", rounds: 10, spawnChance: 0.50, hpBonus: 1 },
  { name: "On Fire", rounds: 12, spawnChance: 0.55, hpBonus: 2 },
  { name: "Blazing", rounds: 15, spawnChance: 0.58, hpBonus: 3 },
  { name: "Inferno", rounds: 20, spawnChance: 0.62, hpBonus: 4 },
  { name: "Meltdown", rounds: 25, spawnChance: 0.65, hpBonus: 6 },
  { name: "Nuclear", rounds: Infinity, spawnChance: 0.70, hpBonus: 8 },
];

function getLevelInfo(level: number) {
  return LEVELS[Math.min(level, LEVELS.length - 1)];
}

function createGame(): GameData {
  let hs = 0;
  try { hs = parseInt(localStorage.getItem("ballz-hs") ?? "0") || 0; } catch {}
  return {
    state: "aiming", round: 1, score: 0, highScore: hs,
    ballCount: 1, launchX: CANVAS_W / 2,
    aimAngle: null, aimPos: null,
    balls: [], blocks: [], pickups: [],
    ballsToLaunch: 0, launchTimer: 0, firstSettledX: null,
    extraBalls: 0, animFrame: 0, speed: 1,
    flashes: [], particles: [], floatingTexts: [], confetti: [],
    level: 0, roundsThisLevel: 0,
    shakeX: 0, shakeY: 0, levelBanner: null,
    blocksDestroyed: 0, ballsCollected: 0,
    soundEnabled: true, gameOverPlayed: false,
    combo: 0, comboTimer: 0, maxCombo: 0,
    nextBallType: "normal", slowmo: false, slowmoTimer: 0,
    starRating: 0, roundBlocksStart: 0, roundBlocksDestroyed: 0,
  };
}

// ── Block shape / ability selection ──────────────────────────────────────────
function pickBlockShape(level: number): BlockShape {
  if (level < 1) return "square";
  const r = Math.random();
  if (level >= 3 && r < 0.15) return "triangle";
  if (r < 0.3) return "circle";
  return "square";
}

function pickBlockAbility(level: number): BlockAbility {
  if (level < 2) return "normal";
  const r = Math.random();
  if (level >= 4 && r < 0.08) return "explosive";
  if (level >= 3 && r < 0.18) return "ice";
  if (r < 0.28) return "steel";
  return "normal";
}

// ── Particles & effects ──────────────────────────────────────────────────────
function spawnParticles(g: GameData, x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    g.particles.push({
      x, y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 15, maxLife: 35,
      color, size: 2 + Math.random() * 3,
    });
  }
}

function spawnConfetti(g: GameData, count: number) {
  const colors = ["#ffeb3b", "#ff5722", "#4caf50", "#2196f3", "#e91e63", "#9c27b0", "#ff9800"];
  for (let i = 0; i < count; i++) {
    g.confetti.push({
      x: CANVAS_W / 2 + (Math.random() - 0.5) * 200,
      y: CANVAS_H / 2 - 50,
      dx: (Math.random() - 0.5) * 8,
      dy: -3 - Math.random() * 5,
      life: 80 + Math.random() * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
    });
  }
}

// ── Spawning ─────────────────────────────────────────────────────────────────
function makeBlock(col: number, row: number, hp: number, shape: BlockShape, ability: BlockAbility): Block {
  return { col, row, hp, maxHp: hp, shape, ability, hitScale: 1, isBoss: false, bossW: 1, bossH: 1, slideOffset: -CELL };
}

function spawnRow(g: GameData) {
  for (const b of g.blocks) b.row++;
  for (const p of g.pickups) p.row++;

  const info = getLevelInfo(g.level);
  const isBossRound = g.round > 1 && g.round % BOSS_INTERVAL === 0;

  if (isBossRound) {
    // Boss block: occupies 2 columns, higher HP
    const bossCol = Math.floor(Math.random() * (COLS - 1));
    const bossHp = g.round * 3 + info.hpBonus * 5;
    const boss: Block = {
      col: bossCol, row: 0, hp: bossHp, maxHp: bossHp,
      shape: "square", ability: "normal", hitScale: 1,
      isBoss: true, bossW: 2, bossH: 1, slideOffset: -CELL,
    };
    g.blocks.push(boss);

    // Fill remaining cols with normal blocks
    const bossOccupied = new Set([bossCol, bossCol + 1]);
    for (let col = 0; col < COLS; col++) {
      if (bossOccupied.has(col)) continue;
      if (Math.random() < info.spawnChance * 0.6) {
        const hp = g.round + info.hpBonus;
        g.blocks.push(makeBlock(col, 0, hp, pickBlockShape(g.level), pickBlockAbility(g.level)));
      }
    }
  } else {
    for (let col = 0; col < COLS; col++) {
      if (Math.random() < info.spawnChance) {
        const bonus = Math.random() < 0.15 ? 1 : 0;
        const hp = g.round + bonus + info.hpBonus;
        g.blocks.push(makeBlock(col, 0, hp, pickBlockShape(g.level), pickBlockAbility(g.level)));
      }
    }
  }

  const occupiedCols = new Set<number>();
  for (const b of g.blocks) {
    if (b.row !== 0) continue;
    occupiedCols.add(b.col);
    if (b.isBoss) for (let w = 1; w < b.bossW; w++) occupiedCols.add(b.col + w);
  }

  const freeCols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (!occupiedCols.has(c)) freeCols.push(c);
  }

  // Always spawn a ball pickup
  if (freeCols.length > 0) {
    const idx = Math.floor(Math.random() * freeCols.length);
    g.pickups.push({ col: freeCols[idx], row: 0, collected: false, type: "ball" });
    freeCols.splice(idx, 1);
  }

  // Lightning pickup (~20% from level 2)
  if (freeCols.length > 0 && g.level >= 2 && Math.random() < 0.20) {
    const idx = Math.floor(Math.random() * freeCols.length);
    g.pickups.push({ col: freeCols[idx], row: 0, collected: false, type: "lightning" });
    freeCols.splice(idx, 1);
  }

  // Special ball pickups (~12% from level 3)
  if (freeCols.length > 0 && g.level >= 3 && Math.random() < 0.12) {
    const types: PickupType[] = ["fire", "split", "giant"];
    const type = types[Math.floor(Math.random() * types.length)];
    const idx = Math.floor(Math.random() * freeCols.length);
    g.pickups.push({ col: freeCols[idx], row: 0, collected: false, type });
  }

  g.roundBlocksStart = g.blocks.length;
  g.roundBlocksDestroyed = 0;
}

// ── Geometry helpers ─────────────────────────────────────────────────────────
function blockRect(b: Block) {
  const w = b.isBoss ? CELL * b.bossW - BLOCK_PAD * 2 : BLOCK_SIZE;
  const h = b.isBoss ? CELL * b.bossH - BLOCK_PAD * 2 : BLOCK_SIZE;
  return {
    x: b.col * CELL + BLOCK_PAD,
    y: TOP_BAR + b.row * CELL + BLOCK_PAD + b.slideOffset,
    w, h,
  };
}

function blockCenter(b: Block) {
  const r = blockRect(b);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

function pickupCenter(p: Pickup) {
  return { x: p.col * CELL + CELL / 2, y: TOP_BAR + p.row * CELL + CELL / 2 };
}

// ── Combo system ─────────────────────────────────────────────────────────────
function addComboKill(g: GameData) {
  g.combo++;
  g.comboTimer = COMBO_WINDOW;
  if (g.combo > g.maxCombo) g.maxCombo = g.combo;
}

function getComboMultiplier(combo: number): number {
  if (combo < 3) return 1;
  if (combo < 6) return 2;
  if (combo < 10) return 3;
  if (combo < 15) return 4;
  return 5;
}

// ── Block destruction ────────────────────────────────────────────────────────
function destroyBlock(g: GameData, idx: number) {
  const blk = g.blocks[idx];
  const c = blockCenter(blk);
  const color = hpColor(1, blk.maxHp);

  addComboKill(g);
  const mult = getComboMultiplier(g.combo);
  const points = mult;
  g.score += points;
  g.blocksDestroyed++;
  g.roundBlocksDestroyed++;

  spawnParticles(g, c.x, c.y, color, blk.isBoss ? 20 : 8);

  const comboText = mult > 1 ? ` x${mult}` : "";
  g.floatingTexts.push({
    x: c.x, y: c.y,
    text: `+${points}${comboText}`,
    life: 35,
    color: mult > 1 ? "#ffeb3b" : "#ffffff",
    scale: mult > 1 ? 1.3 : 1,
  });

  if (blk.isBoss) {
    g.extraBalls += 3;
    g.ballsCollected += 3;
    g.shakeX = (Math.random() - 0.5) * 12;
    g.shakeY = (Math.random() - 0.5) * 12;
    if (g.soundEnabled) playBossDeathSound();
    g.floatingTexts.push({
      x: c.x, y: c.y - 20,
      text: "BOSS DOWN! +3 🔵",
      life: 60,
      color: "#ff5722",
      scale: 1.5,
    });
  } else {
    if (g.soundEnabled) {
      if (g.combo >= 3) playComboSound(g.combo);
      else playDestroySound();
    }
  }

  // Explosive ability: destroy adjacent blocks
  if (blk.ability === "explosive") {
    g.shakeX += (Math.random() - 0.5) * 6;
    g.shakeY += (Math.random() - 0.5) * 6;
    if (g.soundEnabled) playExplosionSound();
    spawnParticles(g, c.x, c.y, "#ff5722", 15);

    const toDestroy: number[] = [];
    for (let j = g.blocks.length - 1; j >= 0; j--) {
      if (j === idx) continue;
      const other = g.blocks[j];
      const oc = blockCenter(other);
      if (Math.abs(oc.x - c.x) < CELL * 1.5 && Math.abs(oc.y - c.y) < CELL * 1.5) {
        toDestroy.push(j);
      }
    }
    // Remove from highest index first
    toDestroy.sort((a, b) => b - a);
    for (const j of toDestroy) {
      const ob = g.blocks[j];
      const obc = blockCenter(ob);
      spawnParticles(g, obc.x, obc.y, hpColor(1, ob.maxHp), 5);
      g.score++;
      g.blocksDestroyed++;
      g.roundBlocksDestroyed++;
      g.blocks.splice(j, 1);
    }
  }

  // Remove the block (adjust index if explosions already removed lower indices)
  const currentIdx = g.blocks.indexOf(blk);
  if (currentIdx >= 0) g.blocks.splice(currentIdx, 1);
}

// ── Lightning ────────────────────────────────────────────────────────────────
function triggerLightning(g: GameData, row: number) {
  const toRemove: number[] = [];
  for (let i = g.blocks.length - 1; i >= 0; i--) {
    if (g.blocks[i].row === row) toRemove.push(i);
  }
  for (const i of toRemove) {
    const c = blockCenter(g.blocks[i]);
    spawnParticles(g, c.x, c.y, hpColor(g.blocks[i].hp, g.blocks[i].maxHp), 6);
    g.score++;
    g.blocksDestroyed++;
    g.roundBlocksDestroyed++;
    g.blocks.splice(i, 1);
  }
  g.flashes.push({ row, alpha: 1.0 });
  g.shakeX = (Math.random() - 0.5) * 8;
  g.shakeY = (Math.random() - 0.5) * 8;
  if (g.soundEnabled) playLightningSound();
}

// ── Collision detection ──────────────────────────────────────────────────────
function circleBlockCollision(ball: Ball, blk: Block): boolean {
  const c = blockCenter(blk);
  const radius = (blk.isBoss ? blockRect(blk).w : BLOCK_SIZE) / 2;
  const dist = Math.hypot(ball.x - c.x, ball.y - c.y);
  if (dist < ball.radius + radius) {
    const nx = (ball.x - c.x) / dist;
    const ny = (ball.y - c.y) / dist;
    const dot = ball.dx * nx + ball.dy * ny;
    ball.dx -= 2 * dot * nx;
    ball.dy -= 2 * dot * ny;
    const overlap = ball.radius + radius - dist;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    return true;
  }
  return false;
}

function triangleBlockCollision(ball: Ball, blk: Block): boolean {
  const r = blockRect(blk);
  const cx = r.x + r.w / 2;
  const top = { x: cx, y: r.y };
  const bl = { x: r.x, y: r.y + r.h };
  const br = { x: r.x + r.w, y: r.y + r.h };

  function sign(p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number) {
    return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
  }

  const d1 = sign(ball.x, ball.y, top.x, top.y, bl.x, bl.y);
  const d2 = sign(ball.x, ball.y, bl.x, bl.y, br.x, br.y);
  const d3 = sign(ball.x, ball.y, br.x, br.y, top.x, top.y);
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  const inside = !(hasNeg && hasPos);

  const tc = { x: (top.x + bl.x + br.x) / 3, y: (top.y + bl.y + br.y) / 3 };
  const dist = Math.hypot(ball.x - tc.x, ball.y - tc.y);

  if (inside || dist < ball.radius + BLOCK_SIZE * 0.4) {
    const edges = [
      { x1: top.x, y1: top.y, x2: bl.x, y2: bl.y },
      { x1: bl.x, y1: bl.y, x2: br.x, y2: br.y },
      { x1: br.x, y1: br.y, x2: top.x, y2: top.y },
    ];
    let minDist = Infinity;
    let bestNx = 0, bestNy = 0;
    for (const edge of edges) {
      const edx = edge.x2 - edge.x1;
      const edy = edge.y2 - edge.y1;
      const len = Math.hypot(edx, edy);
      let nx = -edy / len;
      let ny = edx / len;
      const midx = (edge.x1 + edge.x2) / 2;
      const midy = (edge.y1 + edge.y2) / 2;
      if (nx * (tc.x - midx) + ny * (tc.y - midy) > 0) { nx = -nx; ny = -ny; }
      const d = Math.abs((ball.x - edge.x1) * nx + (ball.y - edge.y1) * ny);
      if (d < minDist) { minDist = d; bestNx = nx; bestNy = ny; }
    }
    const dot = ball.dx * bestNx + ball.dy * bestNy;
    ball.dx -= 2 * dot * bestNx;
    ball.dy -= 2 * dot * bestNy;
    ball.x += bestNx * (ball.radius - minDist + 1);
    ball.y += bestNy * (ball.radius - minDist + 1);
    return true;
  }
  return false;
}

function squareBlockCollision(ball: Ball, blk: Block): boolean {
  const r = blockRect(blk);
  if (
    ball.x + ball.radius > r.x &&
    ball.x - ball.radius < r.x + r.w &&
    ball.y + ball.radius > r.y &&
    ball.y - ball.radius < r.y + r.h
  ) {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const overlapX = r.w / 2 + ball.radius - Math.abs(ball.x - cx);
    const overlapY = r.h / 2 + ball.radius - Math.abs(ball.y - cy);
    if (overlapX < overlapY) {
      ball.dx = -ball.dx;
      ball.x += ball.dx > 0 ? overlapX : -overlapX;
    } else {
      ball.dy = -ball.dy;
      ball.y += ball.dy > 0 ? overlapY : -overlapY;
    }
    return true;
  }
  return false;
}

function resolveCollisions(ball: Ball, g: GameData) {
  if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.dx = Math.abs(ball.dx); }
  if (ball.x + ball.radius > CANVAS_W) { ball.x = CANVAS_W - ball.radius; ball.dx = -Math.abs(ball.dx); }
  if (ball.y - ball.radius < TOP_BAR) { ball.y = TOP_BAR + ball.radius; ball.dy = Math.abs(ball.dy); }

  for (let i = g.blocks.length - 1; i >= 0; i--) {
    const blk = g.blocks[i];
    if (blk.slideOffset > 0.5) continue; // still sliding in
    let hit = false;

    if (blk.shape === "circle" && !blk.isBoss) {
      hit = circleBlockCollision(ball, blk);
    } else if (blk.shape === "triangle" && !blk.isBoss) {
      hit = triangleBlockCollision(ball, blk);
    } else {
      hit = squareBlockCollision(ball, blk);
    }

    if (hit) {
      // Steel blocks take half damage
      const dmg = blk.ability === "steel" ? 0.5 : 1;
      blk.hp -= dmg;
      blk.hitScale = 0.85;

      // Ice blocks slow ball
      if (blk.ability === "ice" && ball.ballType !== "fire") {
        const currentSpeed = Math.hypot(ball.dx, ball.dy);
        const slowSpeed = Math.max(currentSpeed * 0.7, BALL_SPEED * 0.5);
        const ratio = slowSpeed / currentSpeed;
        ball.dx *= ratio;
        ball.dy *= ratio;
      }

      if (blk.hp <= 0) {
        destroyBlock(g, i);
      } else {
        if (g.soundEnabled) playHitSound(0.8 + (blk.hp / blk.maxHp) * 0.6);
      }

      // Fire ball pierces (doesn't bounce)
      if (ball.ballType === "fire") {
        ball.hitsLeft--;
        if (ball.hitsLeft <= 0) {
          ball.ballType = "normal";
          ball.radius = BALL_R;
        }
        // Restore direction (undo reflection)
        // Actually, let it bounce for feel but keep going fast
      }
      break;
    }
  }

  // Pickup collection
  for (const p of g.pickups) {
    if (p.collected) continue;
    const pc = pickupCenter(p);
    const dist = Math.hypot(ball.x - pc.x, ball.y - pc.y);
    if (dist < ball.radius + 12) {
      p.collected = true;
      if (p.type === "ball") {
        g.extraBalls++;
        g.ballsCollected++;
      } else if (p.type === "lightning") {
        triggerLightning(g, p.row);
      } else if (p.type === "fire") {
        g.nextBallType = "fire";
        g.floatingTexts.push({ x: pc.x, y: pc.y, text: "🔥 FIRE!", life: 40, color: "#ff5722", scale: 1.3 });
      } else if (p.type === "split") {
        g.nextBallType = "split";
        g.floatingTexts.push({ x: pc.x, y: pc.y, text: "✦ SPLIT!", life: 40, color: "#2196f3", scale: 1.3 });
      } else if (p.type === "giant") {
        g.nextBallType = "giant";
        g.floatingTexts.push({ x: pc.x, y: pc.y, text: "⬤ GIANT!", life: 40, color: "#9c27b0", scale: 1.3 });
      }
    }
  }

  // Split ball: on first block hit, create 2 extra balls at angles
  if (ball.ballType === "split" && !ball.hasSplit) {
    // Check if any block was just hit by checking hitScale
    for (const blk of g.blocks) {
      if (blk.hitScale < 0.9) {
        ball.hasSplit = true;
        const speed = Math.hypot(ball.dx, ball.dy);
        const baseAngle = Math.atan2(ball.dy, ball.dx);
        for (const offset of [-0.4, 0.4]) {
          const a = baseAngle + offset;
          g.balls.push({
            x: ball.x, y: ball.y,
            dx: Math.cos(a) * speed, dy: Math.sin(a) * speed,
            active: true, settled: false, settledX: ball.x,
            trail: [], ballType: "normal", radius: BALL_R,
            hitsLeft: 0, hasSplit: true,
          });
        }
        ball.ballType = "normal";
        break;
      }
    }
  }

  if (ball.y + ball.radius >= FLOOR_Y) {
    ball.active = false;
    ball.settled = true;
    ball.settledX = ball.x;
    ball.y = FLOOR_Y - ball.radius;
    if (g.firstSettledX === null) g.firstSettledX = ball.x;
  }
}

// ── Game tick ─────────────────────────────────────────────────────────────────
function tick(g: GameData) {
  if (g.state === "gameover") {
    // Keep animating confetti in game over
    for (let i = g.confetti.length - 1; i >= 0; i--) {
      const c = g.confetti[i];
      c.x += c.dx; c.y += c.dy; c.dy += 0.12; c.rot += c.rotSpeed; c.life--;
      if (c.life <= 0) g.confetti.splice(i, 1);
    }
    return;
  }

  // Flashes
  for (let i = g.flashes.length - 1; i >= 0; i--) {
    g.flashes[i].alpha -= 0.03;
    if (g.flashes[i].alpha <= 0) g.flashes.splice(i, 1);
  }

  // Particles
  for (let i = g.particles.length - 1; i >= 0; i--) {
    const p = g.particles[i];
    p.x += p.dx; p.y += p.dy; p.dy += 0.1; p.life--;
    if (p.life <= 0) g.particles.splice(i, 1);
  }

  // Confetti
  for (let i = g.confetti.length - 1; i >= 0; i--) {
    const c = g.confetti[i];
    c.x += c.dx; c.y += c.dy; c.dy += 0.12; c.rot += c.rotSpeed; c.life--;
    if (c.life <= 0) g.confetti.splice(i, 1);
  }

  // Floating texts
  for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
    g.floatingTexts[i].y -= 0.8;
    g.floatingTexts[i].life--;
    if (g.floatingTexts[i].life <= 0) g.floatingTexts.splice(i, 1);
  }

  // Shake decay
  g.shakeX *= 0.85; g.shakeY *= 0.85;
  if (Math.abs(g.shakeX) < 0.1) g.shakeX = 0;
  if (Math.abs(g.shakeY) < 0.1) g.shakeY = 0;

  // Block hit recovery + slide animation
  for (const blk of g.blocks) {
    if (blk.hitScale < 1) { blk.hitScale += 0.05; if (blk.hitScale > 1) blk.hitScale = 1; }
    if (blk.slideOffset < 0) { blk.slideOffset += 3; if (blk.slideOffset > 0) blk.slideOffset = 0; }
  }

  // Level banner
  if (g.levelBanner) { g.levelBanner.life--; if (g.levelBanner.life <= 0) g.levelBanner = null; }

  // Combo timer
  if (g.comboTimer > 0) {
    g.comboTimer--;
    if (g.comboTimer <= 0) g.combo = 0;
  }

  // Slow-mo: brief dramatic effect when down to last ball
  if ((g.state === "running" || g.state === "launching") && !g.slowmo && g.slowmoTimer === 0) {
    const activeBalls = g.balls.filter(b => b.active).length;
    if (activeBalls === 1 && g.ballsToLaunch <= 0 && g.ballCount > 3) {
      g.slowmo = true;
      g.slowmoTimer = SLOWMO_DURATION;
    }
  }
  if (g.slowmo) {
    g.slowmoTimer--;
    if (g.slowmoTimer <= 0) { g.slowmo = false; g.slowmoTimer = 0; }
  }

  if (g.state === "launching") {
    g.launchTimer++;
    if (g.launchTimer >= LAUNCH_DELAY && g.ballsToLaunch > 0) {
      g.launchTimer = 0;
      g.ballsToLaunch--;
      const angle = g.aimAngle!;
      const bt = g.nextBallType;
      g.nextBallType = "normal";
      g.balls.push({
        x: g.launchX, y: FLOOR_Y - BALL_R,
        dx: Math.cos(angle) * BALL_SPEED,
        dy: Math.sin(angle) * BALL_SPEED,
        active: true, settled: false, settledX: g.launchX,
        trail: [],
        ballType: bt,
        radius: bt === "giant" ? BALL_R * 2 : BALL_R,
        hitsLeft: bt === "fire" ? 5 : 0,
        hasSplit: false,
      });
    }
    if (g.ballsToLaunch <= 0 && g.balls.some(b => b.active)) {
      g.state = "running";
    } else if (g.ballsToLaunch <= 0 && g.balls.every(b => !b.active)) {
      endTurn(g);
    }
  }

  if (g.state === "running" || g.state === "launching") {
    const effectiveSpeed = g.slowmo ? SLOWMO_SPEED : 1;
    for (const ball of g.balls) {
      if (!ball.active) continue;
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > TRAIL_LENGTH) ball.trail.shift();
      ball.x += ball.dx * effectiveSpeed;
      ball.y += ball.dy * effectiveSpeed;
      resolveCollisions(ball, g);
    }

    if (g.state === "running" && g.balls.every(b => !b.active)) {
      endTurn(g);
    }
  }

  g.animFrame++;
}

function endTurn(g: GameData) {
  if (g.firstSettledX !== null) {
    g.launchX = Math.max(BALL_R, Math.min(CANVAS_W - BALL_R, g.firstSettledX));
  }
  g.firstSettledX = null;
  g.balls = [];
  g.ballCount += g.extraBalls;
  g.extraBalls = 0;
  g.pickups = g.pickups.filter(p => !p.collected);
  g.slowmo = false;
  g.slowmoTimer = 0;
  g.combo = 0;
  g.comboTimer = 0;

  // Star rating: based on % of blocks destroyed this round
  const pct = g.roundBlocksStart > 0 ? g.roundBlocksDestroyed / g.roundBlocksStart : 0;
  g.starRating = pct >= 0.5 ? 3 : pct >= 0.3 ? 2 : pct >= 0.1 ? 1 : 0;

  if (g.blocks.some(b => b.row >= GAME_OVER_ROW)) {
    g.state = "gameover";
    const isNewBest = g.score > g.highScore;
    if (isNewBest) {
      g.highScore = g.score;
      try { localStorage.setItem("ballz-hs", String(g.score)); } catch {}
      spawnConfetti(g, 60);
    }
    if (!g.gameOverPlayed && g.soundEnabled) { playGameOverSound(); g.gameOverPlayed = true; }
    return;
  }

  g.round++;
  g.roundsThisLevel++;

  const info = getLevelInfo(g.level);
  if (g.roundsThisLevel >= info.rounds && g.level < LEVELS.length - 1) {
    g.level++;
    g.roundsThisLevel = 0;
    g.levelBanner = { text: `Level ${g.level + 1}: ${getLevelInfo(g.level).name}`, life: 90 };
    if (g.soundEnabled) playLevelUpSound();
  }

  spawnRow(g);

  if (g.blocks.some(b => b.row >= GAME_OVER_ROW)) {
    g.state = "gameover";
    const isNewBest = g.score > g.highScore;
    if (isNewBest) {
      g.highScore = g.score;
      try { localStorage.setItem("ballz-hs", String(g.score)); } catch {}
      spawnConfetti(g, 60);
    }
    if (!g.gameOverPlayed && g.soundEnabled) { playGameOverSound(); g.gameOverPlayed = true; }
    return;
  }

  g.state = "aiming";
  g.speed = 1;
}

function launch(g: GameData) {
  if (g.state !== "aiming" || g.aimAngle === null) return;
  g.state = "launching";
  g.ballsToLaunch = g.ballCount;
  g.launchTimer = LAUNCH_DELAY;
  g.firstSettledX = null;
  g.extraBalls = 0;
  if (g.soundEnabled) playLaunchSound();
}

// ── Drawing ──────────────────────────────────────────────────────────────────
function drawTriangle(ctx: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }) {
  const cx = r.x + r.w / 2;
  ctx.beginPath();
  ctx.moveTo(cx, r.y);
  ctx.lineTo(r.x, r.y + r.h);
  ctx.lineTo(r.x + r.w, r.y + r.h);
  ctx.closePath();
}

function drawAbilityBadge(ctx: CanvasRenderingContext2D, blk: Block, cx: number, cy: number) {
  if (blk.ability === "normal") return;
  const badgeY = cy - (blk.isBoss ? 18 : 15);
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (blk.ability === "steel") {
    ctx.fillStyle = "rgba(158,158,158,0.8)";
    ctx.fillText("🛡", cx, badgeY);
  } else if (blk.ability === "explosive") {
    ctx.fillStyle = "rgba(255,87,34,0.9)";
    ctx.fillText("💥", cx, badgeY);
  } else if (blk.ability === "ice") {
    ctx.fillStyle = "rgba(33,150,243,0.9)";
    ctx.fillText("❄", cx, badgeY);
  }
}

function draw(ctx: CanvasRenderingContext2D, g: GameData) {
  const dpr = window.devicePixelRatio || 1;
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.translate(g.shakeX, g.shakeY);

  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(-5, -5, CANVAS_W + 10, CANVAS_H + 10);

  // Top bar
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(0, 0, CANVAS_W, TOP_BAR);

  const info = getLevelInfo(g.level);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Lv.${g.level + 1} ${info.name}`, 12, TOP_BAR / 2);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(g.round), CANVAS_W / 2, TOP_BAR / 2);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`Best: ${g.highScore}`, CANVAS_W - 12, TOP_BAR / 2 - 7);
  ctx.fillText(`Score: ${g.score}`, CANVAS_W - 12, TOP_BAR / 2 + 7);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, TOP_BAR);
  ctx.lineTo(CANVAS_W, TOP_BAR);
  ctx.stroke();

  // Combo display
  if (g.combo >= 3) {
    const mult = getComboMultiplier(g.combo);
    const pulse = 1 + 0.05 * Math.sin(g.animFrame * 0.2);
    ctx.save();
    ctx.translate(CANVAS_W / 2, TOP_BAR + 20);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#ffeb3b";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`COMBO x${mult}`, 0, 0);
    ctx.fillStyle = "rgba(255,235,59,0.3)";
    ctx.font = "11px sans-serif";
    ctx.fillText(`${g.combo} hits`, 0, 14);
    ctx.restore();
  }

  // Flash effects
  for (const f of g.flashes) {
    ctx.fillStyle = `rgba(255, 255, 100, ${f.alpha * 0.4})`;
    ctx.fillRect(0, TOP_BAR + f.row * CELL, CANVAS_W, CELL);
  }

  // Blocks
  for (const blk of g.blocks) {
    const r = blockRect(blk);
    const color = hpColor(blk.hp, blk.maxHp);
    const scale = blk.hitScale;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    // Steel blocks get a metallic border
    if (blk.ability === "steel") {
      ctx.strokeStyle = "rgba(200,200,200,0.5)";
      ctx.lineWidth = 2;
    }

    ctx.fillStyle = blk.ability === "ice" ? "#29b6f6" : blk.ability === "explosive" ? "#ff7043" : color;

    if (blk.shape === "circle" && !blk.isBoss) {
      ctx.beginPath();
      ctx.arc(cx, cy, r.w / 2, 0, Math.PI * 2);
      ctx.fill();
      if (blk.ability === "steel") ctx.stroke();
    } else if (blk.shape === "triangle" && !blk.isBoss) {
      drawTriangle(ctx, r);
      ctx.fill();
      if (blk.ability === "steel") ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, r.w, r.h, blk.isBoss ? 6 : 4);
      ctx.fill();
      if (blk.ability === "steel") ctx.stroke();
    }

    // Boss health bar
    if (blk.isBoss) {
      const barW = r.w - 8;
      const barH = 4;
      const barX = r.x + 4;
      const barY = r.y + r.h - 8;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = "#f44336";
      ctx.fillRect(barX, barY, barW * (blk.hp / blk.maxHp), barH);
    }

    // HP text
    ctx.fillStyle = "#ffffff";
    ctx.font = blk.hp >= 100 ? "bold 11px sans-serif" : "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textY = blk.shape === "triangle" && !blk.isBoss ? cy + 4 : cy - (blk.isBoss ? 2 : 0);
    ctx.fillText(String(Math.ceil(blk.hp)), cx, textY);

    // Boss label
    if (blk.isBoss) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "bold 8px sans-serif";
      ctx.fillText("BOSS", cx, r.y + 10);
    }

    drawAbilityBadge(ctx, blk, cx, r.y);
    ctx.restore();
  }

  // Pickups
  for (const p of g.pickups) {
    if (p.collected) continue;
    const pc = pickupCenter(p);
    const pulse = 0.8 + 0.2 * Math.sin(g.animFrame * 0.1);

    if (p.type === "ball") {
      ctx.beginPath(); ctx.arc(pc.x, pc.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fill();
      ctx.beginPath(); ctx.arc(pc.x, pc.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff"; ctx.fill();
    } else if (p.type === "lightning") {
      ctx.beginPath(); ctx.arc(pc.x, pc.y, 12 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 235, 59, 0.15)"; ctx.fill();
      ctx.fillStyle = "#ffeb3b"; ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("⚡", pc.x, pc.y);
    } else if (p.type === "fire") {
      ctx.beginPath(); ctx.arc(pc.x, pc.y, 12 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 87, 34, 0.2)"; ctx.fill();
      ctx.fillStyle = "#ff5722"; ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🔥", pc.x, pc.y);
    } else if (p.type === "split") {
      ctx.beginPath(); ctx.arc(pc.x, pc.y, 12 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(33, 150, 243, 0.2)"; ctx.fill();
      ctx.fillStyle = "#2196f3"; ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("✦", pc.x, pc.y);
    } else if (p.type === "giant") {
      ctx.beginPath(); ctx.arc(pc.x, pc.y, 14 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(156, 39, 176, 0.2)"; ctx.fill();
      ctx.fillStyle = "#9c27b0"; ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("⬤", pc.x, pc.y);
    }
  }

  // Floor line
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, FLOOR_Y); ctx.lineTo(CANVAS_W, FLOOR_Y); ctx.stroke();

  // Aim line with bounce preview
  if (g.state === "aiming" && g.aimAngle !== null) {
    ctx.save();
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;

    const sx = g.launchX, sy = FLOOR_Y - BALL_R;
    const dx = Math.cos(g.aimAngle), dy = Math.sin(g.aimAngle);

    let hitDist = 600;
    let bounceX = sx + dx * hitDist, bounceY = sy + dy * hitDist, bounceDx = dx;

    if (dx < 0) {
      const t = (BALL_R - sx) / dx;
      if (t > 0 && t < hitDist) { hitDist = t; bounceX = BALL_R; bounceY = sy + dy * t; bounceDx = -dx; }
    } else if (dx > 0) {
      const t = (CANVAS_W - BALL_R - sx) / dx;
      if (t > 0 && t < hitDist) { hitDist = t; bounceX = CANVAS_W - BALL_R; bounceY = sy + dy * t; bounceDx = -dx; }
    }
    if (dy < 0) {
      const t = (TOP_BAR + BALL_R - sy) / dy;
      if (t > 0 && t < hitDist) { hitDist = t; bounceX = sx + dx * t; bounceY = TOP_BAR + BALL_R; bounceDx = dx; }
    }

    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bounceX, bounceY); ctx.stroke();

    if (bounceY > TOP_BAR + BALL_R + 5) {
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath(); ctx.moveTo(bounceX, bounceY);
      ctx.lineTo(bounceX + bounceDx * 80, bounceY + dy * 80); ctx.stroke();
    }
    ctx.restore();
  }

  // Ball trails
  for (const ball of g.balls) {
    if (!ball.active || ball.trail.length < 2) continue;
    const trailColor = ball.ballType === "fire" ? "255, 100, 30"
      : ball.ballType === "giant" ? "180, 80, 220"
      : "255, 255, 255";
    for (let t = 0; t < ball.trail.length; t++) {
      const alpha = (t / ball.trail.length) * 0.3;
      const size = ball.radius * (0.3 + (t / ball.trail.length) * 0.7);
      ctx.beginPath();
      ctx.arc(ball.trail[t].x, ball.trail[t].y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${trailColor}, ${alpha})`;
      ctx.fill();
    }
  }

  // Balls
  for (const ball of g.balls) {
    if (!ball.active && !ball.settled) continue;
    const bx = ball.active ? ball.x : ball.settledX;
    const by = ball.active ? ball.y : FLOOR_Y - ball.radius;

    ctx.beginPath();
    ctx.arc(bx, by, ball.radius, 0, Math.PI * 2);

    if (ball.ballType === "fire") {
      ctx.fillStyle = "#ff5722";
      ctx.fill();
      // Fire glow
      ctx.beginPath();
      ctx.arc(bx, by, ball.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 87, 34, 0.3)";
      ctx.fill();
    } else if (ball.ballType === "giant") {
      ctx.fillStyle = "#ce93d8";
      ctx.fill();
    } else if (ball.ballType === "split") {
      ctx.fillStyle = "#64b5f6";
      ctx.fill();
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
  }

  // Particles
  for (const p of g.particles) {
    const alpha = p.life / p.maxLife;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
    ctx.fill();
  }

  // Confetti
  for (const c of g.confetti) {
    const alpha = Math.min(c.life / 20, 1);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }

  // Floating texts
  for (const ft of g.floatingTexts) {
    const alpha = ft.life / 35;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = `bold ${Math.round(12 * ft.scale)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  // Launcher ball (when aiming)
  if (g.state === "aiming") {
    ctx.beginPath();
    ctx.arc(g.launchX, FLOOR_Y - BALL_R, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  // Ball count
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  if (g.state === "aiming") {
    ctx.fillText(`x${g.ballCount}`, g.launchX, FLOOR_Y + 6);
  }

  if (g.state === "launching" || g.state === "running") {
    const remaining = g.balls.filter(b => b.active).length;
    if (remaining > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`x${remaining}`, g.launchX, FLOOR_Y + 6);
    }
  }

  // Speed / slowmo indicator
  if ((g.state === "launching" || g.state === "running")) {
    if (g.slowmo) {
      ctx.fillStyle = "rgba(100,181,246,0.6)";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("SLOW-MO", CANVAS_W - 12, FLOOR_Y + 6);
    } else if (g.speed > 1) {
      ctx.fillStyle = "rgba(255,235,59,0.6)";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${g.speed}x`, CANVAS_W - 12, FLOOR_Y + 6);
    }
  }

  // Star rating (bottom left, after turn)
  if (g.state === "aiming" && g.starRating > 0 && g.round > 1) {
    ctx.fillStyle = "rgba(255,235,59,0.6)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("★".repeat(g.starRating) + "☆".repeat(3 - g.starRating), 12, FLOOR_Y + 6);
  }

  // Level up banner
  if (g.levelBanner) {
    const progress = g.levelBanner.life / 90;
    const fadeIn = Math.min(progress * 5, 1);
    const fadeOut = Math.min((1 - progress) * 5, 1);
    const alpha = Math.min(fadeIn, fadeOut);
    const scale = 0.8 + alpha * 0.2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
    ctx.scale(scale, scale);
    ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath(); ctx.roundRect(CANVAS_W / 2 - 130, CANVAS_H / 2 - 25, 260, 50, 12); ctx.fill();
    ctx.fillStyle = "#ffeb3b";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(g.levelBanner.text, CANVAS_W / 2, CANVAS_H / 2);
    ctx.restore();
  }

  // Game over overlay
  if (g.state === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(-5, -5, CANVAS_W + 10, CANVAS_H + 10);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", CANVAS_W / 2, CANVAS_H / 2 - 80);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`Level ${g.level + 1} — ${getLevelInfo(g.level).name}`, CANVAS_W / 2, CANVAS_H / 2 - 45);

    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(`Score: ${g.score}`, CANVAS_W / 2, CANVAS_H / 2 - 12);

    if (g.score >= g.highScore && g.score > 0) {
      ctx.fillStyle = "#ffeb3b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("⭐ NEW BEST! ⭐", CANVAS_W / 2, CANVAS_H / 2 + 16);
    }

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "12px sans-serif";
    const statsY = CANVAS_H / 2 + 42;
    ctx.fillText(`${g.blocksDestroyed} blocks  ·  ${g.ballsCollected} balls  ·  ${g.round - 1} rounds`, CANVAS_W / 2, statsY);
    if (g.maxCombo >= 3) {
      ctx.fillText(`Best combo: x${getComboMultiplier(g.maxCombo)} (${g.maxCombo} hits)`, CANVAS_W / 2, statsY + 18);
    }

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText("Tap to play again", CANVAS_W / 2, CANVAS_H / 2 + 90);
  }

  ctx.restore();
}

// ── React component ──────────────────────────────────────────────────────────
export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameData>(createGame());
  const rafRef = useRef<number>(0);
  const [, forceRender] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const restart = useCallback(() => {
    const hs = gameRef.current.highScore;
    const sound = gameRef.current.soundEnabled;
    gameRef.current = createGame();
    gameRef.current.highScore = hs;
    gameRef.current.soundEnabled = sound;
    spawnRow(gameRef.current);
    forceRender(n => n + 1);
  }, []);

  useEffect(() => {
    if (gameRef.current.blocks.length === 0) spawnRow(gameRef.current);
  }, []);

  useEffect(() => {
    let lastTime = 0;
    const TICK_MS = 1000 / 60;
    function loop(time: number) {
      if (time - lastTime >= TICK_MS) {
        lastTime = time;
        const sp = gameRef.current.speed;
        for (let i = 0; i < sp; i++) tick(gameRef.current);
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) draw(ctx, gameRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
  }, []);

  const getCanvasPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    if ("touches" in e) {
      const t = e.touches[0] || (e as React.TouchEvent).changedTouches[0];
      if (!t) return null;
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const updateAim = useCallback((pos: { x: number; y: number }) => {
    const g = gameRef.current;
    if (g.state !== "aiming") return;
    const dx = pos.x - g.launchX;
    const dy = pos.y - (FLOOR_Y - BALL_R);
    if (dy >= -5) { g.aimAngle = null; g.aimPos = null; return; }
    g.aimAngle = Math.atan2(dy, dx);
    g.aimPos = pos;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const g = gameRef.current;
      if (audioCtx?.state === "suspended") audioCtx.resume();
      if (g.state === "gameover") { restart(); return; }
      if (g.state === "launching" || g.state === "running") {
        if (g.slowmo) { g.slowmo = false; return; }
        g.speed = g.speed === 1 ? 4 : 1;
        return;
      }
      const pos = getCanvasPos(e);
      if (pos) updateAim(pos);
    },
    [getCanvasPos, updateAim, restart]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const pos = getCanvasPos(e);
      if (pos) updateAim(pos);
    },
    [getCanvasPos, updateAim]
  );

  const handlePointerUp = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const g = gameRef.current;
      if (g.state === "aiming" && g.aimAngle !== null) launch(g);
    },
    []
  );

  const toggleSound = useCallback(() => {
    gameRef.current.soundEnabled = !gameRef.current.soundEnabled;
    setSoundOn(gameRef.current.soundEnabled);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 select-none">
      <div className="mb-3 flex items-center gap-4">
        <h1 className="text-xl font-bold text-brown">Ballz</h1>
        <button onClick={restart} className="text-sm text-brown/50 hover:text-orange transition-colors px-3 py-1 rounded-lg border border-brown/10 hover:border-orange/30">
          Restart
        </button>
        <button onClick={toggleSound} className="text-sm text-brown/50 hover:text-orange transition-colors px-3 py-1 rounded-lg border border-brown/10 hover:border-orange/30">
          {soundOn ? "🔊" : "🔇"}
        </button>
      </div>
      <p className="text-xs text-brown/30 mb-3">Tap while balls are moving to fast-forward (4x)</p>
      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-lg cursor-crosshair touch-none"
        style={{ width: CANVAS_W, height: CANVAS_H, maxWidth: "100%" }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
}
