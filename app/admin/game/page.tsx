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

// ── Color helpers ────────────────────────────────────────────────────────────
function blockColor(num: number): string {
  if (num <= 3) return "#f5c542";
  if (num <= 7) return "#4caf50";
  if (num <= 15) return "#2196f3";
  if (num <= 25) return "#9c27b0";
  if (num <= 40) return "#e91e63";
  return "#f44336";
}

// ── Types ────────────────────────────────────────────────────────────────────
type Block = {
  col: number;
  row: number;
  hp: number;
};

type PickupType = "ball" | "lightning";

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
};

type GameState = "aiming" | "launching" | "running" | "gameover";

// ── Flash effect for lightning ───────────────────────────────────────────────
type FlashEffect = {
  row: number;
  alpha: number;
};

// ── Game logic ───────────────────────────────────────────────────────────────
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
  speed: number; // 1 = normal, 2/4 = fast-forward
  flashes: FlashEffect[];
  level: number;
  roundsThisLevel: number;
}

// Levels: every N rounds the level increases, blocks get denser and tougher
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
  try {
    hs = parseInt(localStorage.getItem("ballz-hs") ?? "0") || 0;
  } catch {}
  return {
    state: "aiming",
    round: 1,
    score: 0,
    highScore: hs,
    ballCount: 1,
    launchX: CANVAS_W / 2,
    aimAngle: null,
    aimPos: null,
    balls: [],
    blocks: [],
    pickups: [],
    ballsToLaunch: 0,
    launchTimer: 0,
    firstSettledX: null,
    extraBalls: 0,
    animFrame: 0,
    speed: 1,
    flashes: [],
    level: 0,
    roundsThisLevel: 0,
  };
}

function spawnRow(g: GameData) {
  for (const b of g.blocks) b.row++;
  for (const p of g.pickups) p.row++;

  const info = getLevelInfo(g.level);

  for (let col = 0; col < COLS; col++) {
    if (Math.random() < info.spawnChance) {
      const bonus = Math.random() < 0.15 ? 1 : 0;
      g.blocks.push({ col, row: 0, hp: g.round + bonus + info.hpBonus });
    }
  }

  const occupiedCols = new Set(g.blocks.filter((b) => b.row === 0).map((b) => b.col));
  const freeCols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (!occupiedCols.has(c)) freeCols.push(c);
  }

  // Ball pickup (always spawn 1 if room)
  if (freeCols.length > 0) {
    const idx = Math.floor(Math.random() * freeCols.length);
    g.pickups.push({ col: freeCols[idx], row: 0, collected: false, type: "ball" });
    freeCols.splice(idx, 1);
  }

  // Lightning pickup (~20% chance per round, starting from level 2)
  if (freeCols.length > 0 && g.level >= 2 && Math.random() < 0.20) {
    const idx = Math.floor(Math.random() * freeCols.length);
    g.pickups.push({ col: freeCols[idx], row: 0, collected: false, type: "lightning" });
  }
}

function blockRect(b: Block) {
  return {
    x: b.col * CELL + BLOCK_PAD,
    y: TOP_BAR + b.row * CELL + BLOCK_PAD,
    w: BLOCK_SIZE,
    h: BLOCK_SIZE,
  };
}

function pickupCenter(p: Pickup) {
  return {
    x: p.col * CELL + CELL / 2,
    y: TOP_BAR + p.row * CELL + CELL / 2,
  };
}

function triggerLightning(g: GameData, row: number) {
  g.blocks = g.blocks.filter((b) => {
    if (b.row === row) {
      g.score++;
      return false;
    }
    return true;
  });
  g.flashes.push({ row, alpha: 1.0 });
}

function resolveCollisions(ball: Ball, g: GameData) {
  if (ball.x - BALL_R < 0) {
    ball.x = BALL_R;
    ball.dx = Math.abs(ball.dx);
  }
  if (ball.x + BALL_R > CANVAS_W) {
    ball.x = CANVAS_W - BALL_R;
    ball.dx = -Math.abs(ball.dx);
  }
  if (ball.y - BALL_R < TOP_BAR) {
    ball.y = TOP_BAR + BALL_R;
    ball.dy = Math.abs(ball.dy);
  }

  for (let i = g.blocks.length - 1; i >= 0; i--) {
    const blk = g.blocks[i];
    const r = blockRect(blk);

    if (
      ball.x + BALL_R > r.x &&
      ball.x - BALL_R < r.x + r.w &&
      ball.y + BALL_R > r.y &&
      ball.y - BALL_R < r.y + r.h
    ) {
      blk.hp--;
      if (blk.hp <= 0) {
        g.blocks.splice(i, 1);
        g.score++;
      }

      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const overlapX = r.w / 2 + BALL_R - Math.abs(ball.x - cx);
      const overlapY = r.h / 2 + BALL_R - Math.abs(ball.y - cy);

      if (overlapX < overlapY) {
        ball.dx = -ball.dx;
        ball.x += ball.dx > 0 ? overlapX : -overlapX;
      } else {
        ball.dy = -ball.dy;
        ball.y += ball.dy > 0 ? overlapY : -overlapY;
      }
      break;
    }
  }

  for (const p of g.pickups) {
    if (p.collected) continue;
    const pc = pickupCenter(p);
    const dist = Math.hypot(ball.x - pc.x, ball.y - pc.y);
    if (dist < BALL_R + 12) {
      p.collected = true;
      if (p.type === "ball") {
        g.extraBalls++;
      } else if (p.type === "lightning") {
        triggerLightning(g, p.row);
      }
    }
  }

  if (ball.y + BALL_R >= FLOOR_Y) {
    ball.active = false;
    ball.settled = true;
    ball.settledX = ball.x;
    ball.y = FLOOR_Y - BALL_R;
    if (g.firstSettledX === null) {
      g.firstSettledX = ball.x;
    }
  }
}

function tick(g: GameData) {
  if (g.state === "gameover") return;

  // Fade flash effects
  for (let i = g.flashes.length - 1; i >= 0; i--) {
    g.flashes[i].alpha -= 0.03;
    if (g.flashes[i].alpha <= 0) g.flashes.splice(i, 1);
  }

  if (g.state === "launching") {
    g.launchTimer++;
    if (g.launchTimer >= LAUNCH_DELAY && g.ballsToLaunch > 0) {
      g.launchTimer = 0;
      g.ballsToLaunch--;
      const angle = g.aimAngle!;
      g.balls.push({
        x: g.launchX,
        y: FLOOR_Y - BALL_R,
        dx: Math.cos(angle) * BALL_SPEED,
        dy: Math.sin(angle) * BALL_SPEED,
        active: true,
        settled: false,
        settledX: g.launchX,
      });
    }
    if (g.ballsToLaunch <= 0 && g.balls.some((b) => b.active)) {
      g.state = "running";
    } else if (g.ballsToLaunch <= 0 && g.balls.every((b) => !b.active)) {
      endTurn(g);
    }
  }

  if (g.state === "running" || g.state === "launching") {
    for (const ball of g.balls) {
      if (!ball.active) continue;
      ball.x += ball.dx;
      ball.y += ball.dy;
      resolveCollisions(ball, g);
    }

    if (g.state === "running" && g.balls.every((b) => !b.active)) {
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
  g.pickups = g.pickups.filter((p) => !p.collected);

  if (g.blocks.some((b) => b.row >= GAME_OVER_ROW)) {
    g.state = "gameover";
    if (g.score > g.highScore) {
      g.highScore = g.score;
      try { localStorage.setItem("ballz-hs", String(g.score)); } catch {}
    }
    return;
  }

  g.round++;
  g.roundsThisLevel++;

  // Level up check
  const info = getLevelInfo(g.level);
  if (g.roundsThisLevel >= info.rounds && g.level < LEVELS.length - 1) {
    g.level++;
    g.roundsThisLevel = 0;
  }

  spawnRow(g);

  if (g.blocks.some((b) => b.row >= GAME_OVER_ROW)) {
    g.state = "gameover";
    if (g.score > g.highScore) {
      g.highScore = g.score;
      try { localStorage.setItem("ballz-hs", String(g.score)); } catch {}
    }
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
}

// ── Drawing ──────────────────────────────────────────────────────────────────
function draw(ctx: CanvasRenderingContext2D, g: GameData) {
  const dpr = window.devicePixelRatio || 1;
  ctx.save();
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // ── Top bar ────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(0, 0, CANVAS_W, TOP_BAR);

  // Level name (left)
  const info = getLevelInfo(g.level);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Lv.${g.level + 1} ${info.name}`, 12, TOP_BAR / 2);

  // Round (center)
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(g.round), CANVAS_W / 2, TOP_BAR / 2);

  // Score (right)
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`Best: ${g.highScore}`, CANVAS_W - 12, TOP_BAR / 2 - 7);
  ctx.fillText(`Score: ${g.score}`, CANVAS_W - 12, TOP_BAR / 2 + 7);

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, TOP_BAR);
  ctx.lineTo(CANVAS_W, TOP_BAR);
  ctx.stroke();

  // ── Flash effects (lightning row clear) ────────────────────────────────
  for (const f of g.flashes) {
    ctx.fillStyle = `rgba(255, 255, 100, ${f.alpha * 0.4})`;
    ctx.fillRect(0, TOP_BAR + f.row * CELL, CANVAS_W, CELL);
  }

  // ── Blocks ─────────────────────────────────────────────────────────────
  for (const blk of g.blocks) {
    const r = blockRect(blk);
    ctx.fillStyle = blockColor(blk.hp);
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 4);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = blk.hp >= 100 ? "bold 11px sans-serif" : "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(blk.hp), r.x + r.w / 2, r.y + r.h / 2);
  }

  // ── Pickups ────────────────────────────────────────────────────────────
  for (const p of g.pickups) {
    if (p.collected) continue;
    const pc = pickupCenter(p);

    if (p.type === "ball") {
      ctx.beginPath();
      ctx.arc(pc.x, pc.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pc.x, pc.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    } else {
      // Lightning pickup — yellow bolt
      const pulse = 0.8 + 0.2 * Math.sin(g.animFrame * 0.1);
      ctx.beginPath();
      ctx.arc(pc.x, pc.y, 12 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 59, 0.15)`;
      ctx.fill();
      ctx.fillStyle = "#ffeb3b";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", pc.x, pc.y);
    }
  }

  // ── Floor line ─────────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR_Y);
  ctx.lineTo(CANVAS_W, FLOOR_Y);
  ctx.stroke();

  // ── Aiming line (dotted) ───────────────────────────────────────────────
  if (g.state === "aiming" && g.aimAngle !== null) {
    ctx.save();
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(g.launchX, FLOOR_Y - BALL_R);
    const len = 350;
    ctx.lineTo(
      g.launchX + Math.cos(g.aimAngle) * len,
      FLOOR_Y - BALL_R + Math.sin(g.aimAngle) * len
    );
    ctx.stroke();
    ctx.restore();
  }

  // ── Balls ──────────────────────────────────────────────────────────────
  for (const ball of g.balls) {
    if (!ball.active && !ball.settled) continue;
    ctx.beginPath();
    ctx.arc(
      ball.active ? ball.x : ball.settledX,
      ball.active ? ball.y : FLOOR_Y - BALL_R,
      BALL_R,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  // ── Launcher ball (when aiming) ────────────────────────────────────────
  if (g.state === "aiming") {
    ctx.beginPath();
    ctx.arc(g.launchX, FLOOR_Y - BALL_R, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  // ── Ball count + speed indicator (bottom area) ─────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  if (g.state === "aiming") {
    ctx.fillText(`x${g.ballCount}`, g.launchX, FLOOR_Y + 6);
  }

  if ((g.state === "launching" || g.state === "running") && g.speed > 1) {
    ctx.fillStyle = "rgba(255,235,59,0.6)";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${g.speed}x`, CANVAS_W - 12, FLOOR_Y + 6);
  }

  // ── Game over overlay ──────────────────────────────────────────────────
  if (g.state === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", CANVAS_W / 2, CANVAS_H / 2 - 50);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`Level ${g.level + 1} — ${getLevelInfo(g.level).name}`, CANVAS_W / 2, CANVAS_H / 2 - 15);

    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(`Score: ${g.score}`, CANVAS_W / 2, CANVAS_H / 2 + 18);

    if (g.score >= g.highScore) {
      ctx.fillStyle = "#ffeb3b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("NEW BEST!", CANVAS_W / 2, CANVAS_H / 2 + 48);
    }

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText("Tap to play again", CANVAS_W / 2, CANVAS_H / 2 + 80);
  }

  ctx.restore();
}

// ── React component ──────────────────────────────────────────────────────────
export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameData>(createGame());
  const rafRef = useRef<number>(0);
  const [, forceRender] = useState(0);

  const restart = useCallback(() => {
    const hs = gameRef.current.highScore;
    gameRef.current = createGame();
    gameRef.current.highScore = hs;
    spawnRow(gameRef.current);
    forceRender((n) => n + 1);
  }, []);

  useEffect(() => {
    if (gameRef.current.blocks.length === 0) {
      spawnRow(gameRef.current);
    }
  }, []);

  // Game loop — runs multiple ticks per frame when speed > 1
  useEffect(() => {
    let lastTime = 0;
    const TICK_MS = 1000 / 60;

    function loop(time: number) {
      if (time - lastTime >= TICK_MS) {
        lastTime = time;
        const sp = gameRef.current.speed;
        for (let i = 0; i < sp; i++) {
          tick(gameRef.current);
        }
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
    if (dy >= -5) {
      g.aimAngle = null;
      g.aimPos = null;
      return;
    }
    g.aimAngle = Math.atan2(dy, dx);
    g.aimPos = pos;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const g = gameRef.current;
      if (g.state === "gameover") {
        restart();
        return;
      }
      // Tap during ball flight = toggle fast-forward
      if (g.state === "launching" || g.state === "running") {
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
      if (g.state === "aiming" && g.aimAngle !== null) {
        launch(g);
      }
    },
    []
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 select-none">
      <div className="mb-3 flex items-center gap-4">
        <h1 className="text-xl font-bold text-brown">Ballz</h1>
        <button
          onClick={restart}
          className="text-sm text-brown/50 hover:text-orange transition-colors px-3 py-1 rounded-lg border border-brown/10 hover:border-orange/30"
        >
          Restart
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
