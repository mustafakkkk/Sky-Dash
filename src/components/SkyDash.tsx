import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Pause, Play, Shield, Zap as SpeedZap, Timer, Moon, Magnet, Flame } from 'lucide-react';
import { ActivePowerup, GraphicsQuality, Language, MetaBuffs, ShipSkin } from '../types';
import { getTranslation } from '../translations';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'star' | 'cloud' | 'powerup' | 'spaceship' | 'asteroid' | 'drone' | 'fireAsteroid';
  speed: number;
  id: number;
  direction?: number;
  lastShot?: number;
  stunnedUntil?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface GameProps {
  onGameOver: (score: number, stats: { stars: number, difficulty: number, time: number, spaceshipHits: number, nearMisses: number }) => void;
  isMuted: boolean;
  activePowerups: ActivePowerup[];
  graphicsQuality: GraphicsQuality;
  language: Language;
  isEid?: boolean;
  fireAsteroids: number;
  onUseFireAsteroid: () => void;
  baseDifficulty?: number;
  metaBuffs?: MetaBuffs;
  activeSkin?: ShipSkin;
}

const SkyDash: React.FC<GameProps> = React.memo(({ 
  onGameOver, 
  isMuted, 
  activePowerups, 
  graphicsQuality, 
  language, 
  isEid = false,
  fireAsteroids,
  onUseFireAsteroid,
  baseDifficulty = 1,
  metaBuffs = {
    speedMultiplier: 1,
    magnetRangeBoost: 0,
    shieldDurationBoost: 0,
    fireAsteroidCooldownReduction: 0,
    starValueMultiplier: 1
  },
  activeSkin
}) => {
  const t = getTranslation(language);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreDisplayRef = useRef<HTMLDivElement>(null);
  const starCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameActive, setGameActive] = useState(true);
  const gameActiveRef = useRef(true);
  
  useEffect(() => {
    gameActiveRef.current = gameActive;
  }, [gameActive]);
  const [isPaused, setIsPaused] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // UI State for progression
  const [currentSector, setCurrentSector] = useState(1);
  const [currentPacing, setCurrentPacing] = useState<'NORMAL' | 'INTENSE' | 'RECOVERY'>('NORMAL');
  const [currentCombo, setCurrentCombo] = useState(0);
  const [showSectorAnnounce, setShowSectorAnnounce] = useState(false);
  
  // Game State Refs (to avoid re-renders during loop)
  const isPausedRef = useRef(false);
  const isCountingDownRef = useRef(false);
  const hasShieldRef = useRef(false);
  const isInvincibleRef = useRef(false);
  const pauseStartTimeRef = useRef<number | null>(null);
  const playerRef = useRef({ x: 0, y: 0, width: 40, height: 40, speed: 450 }); // Speed in pixels per second
  const objectsRef = useRef<GameObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const starsCollectedRef = useRef(0);
  const spaceshipHitsRef = useRef(0);
  const nearMissesRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const difficultyRef = useRef(baseDifficulty);
  const lastSpawnRef = useRef(0);
  const lastMilestoneRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const activePowerupsRef = useRef(activePowerups);
  const fireAsteroidsRef = useRef(fireAsteroids);
  const hasSpawnedUFO = useRef(false);
  const hasSpawnedDrone = useRef(false);

  // Pacing & Progression Refs
  const sectorRef = useRef(1);
  const pacingRef = useRef<'NORMAL' | 'INTENSE' | 'RECOVERY'>('NORMAL');
  const pacingTimerRef = useRef(0);
  const comboRef = useRef(0);
  const lastComboTimeRef = useRef(0);
  const lastAsteroidShotRef = useRef(0);
  const bgColorRef = useRef({ top: '#0f172a', bottom: '#1e293b' });
  const targetBgColorRef = useRef({ top: '#0f172a', bottom: '#1e293b' });
  
  useEffect(() => {
    activePowerupsRef.current = activePowerups;
  }, [activePowerups]);

  useEffect(() => {
    fireAsteroidsRef.current = fireAsteroids;
  }, [fireAsteroids]);

  const shakeRef = useRef(0);
  const flashRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchRef = useRef<number | null>(null);

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicOscsRef = useRef<OscillatorNode[]>([]);
  const musicGainsRef = useRef<GainNode[]>([]);
  const musicIntervalRef = useRef<number | null>(null);

  const playSound = useCallback((frequency: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    if (isMuted) return;
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + duration);
  }, [isMuted]);

  const startMusic = useCallback(() => {
    if (isMuted) return;
    if (musicIntervalRef.current) return; // Don't start if already running
    
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    // Melodic sequence (C Major Pentatonic - sounds happy and adventurous)
    const melody = [
      523.25, 0, 587.33, 0, 659.25, 0, 783.99, 0,
      659.25, 0, 587.33, 0, 523.25, 0, 392.00, 0,
      440.00, 0, 523.25, 0, 587.33, 0, 659.25, 0,
      587.33, 0, 523.25, 0, 440.00, 0, 392.00, 0
    ];
    
    // Simple bassline to add depth
    const bass = [
      130.81, 0, 130.81, 0, 164.81, 0, 164.81, 0,
      174.61, 0, 174.61, 0, 196.00, 0, 196.00, 0
    ];

    let step = 0;

    musicIntervalRef.current = window.setInterval(() => {
      if (isPausedRef.current || !gameActiveRef.current || isCountingDownRef.current) return;
      
      const ctx = audioCtxRef.current!;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (ctx.state === 'closed') return; // Safety check

      const now = ctx.currentTime;

      // Play Melody
      const melodyFreq = melody[step % melody.length];
      if (melodyFreq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine'; // Smoother sound
        osc.frequency.setValueAtTime(melodyFreq, now);
        gain.gain.setValueAtTime(0.08, now); // Increased from 0.04
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }

      // Play Bass (every other beat)
      if (step % 2 === 0) {
        const bassFreq = bass[(step / 2) % bass.length];
        if (bassFreq > 0) {
          const oscB = ctx.createOscillator();
          const gainB = ctx.createGain();
          oscB.type = 'triangle';
          oscB.frequency.setValueAtTime(bassFreq, now);
          gainB.gain.setValueAtTime(0.05, now); // Increased from 0.02
          gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          oscB.connect(gainB);
          gainB.connect(ctx.destination);
          oscB.start(now);
          oscB.stop(now + 0.6);
        }
      }
      
      step++;
    }, 200); // Faster tempo for a more energetic feel
  }, [isMuted, gameActive]);

  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
  }, []);

  const initStarCanvas = useCallback((width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw static stars
    const starCount = graphicsQuality === 'high' ? 150 : (graphicsQuality === 'medium' ? 80 : 40);
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.5 + 0.5;
      const opacity = Math.random() * 0.5 + 0.1;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas;
  }, [graphicsQuality]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    starCanvasRef.current = initStarCanvas(canvas.width, canvas.height);
  }, [initStarCanvas]);

  const playMilestoneSound = useCallback(() => {
    if (isMuted) return;
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    const now = audioCtxRef.current.currentTime;
    
    // Play a sequence of rising notes
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = audioCtxRef.current!.createOscillator();
      const gain = audioCtxRef.current!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
      osc.connect(gain);
      gain.connect(audioCtxRef.current!.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.2);
    });
  }, [isMuted]);

  useEffect(() => {
    if (gameActive) {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [gameActive, startMusic, stopMusic]);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    playerRef.current = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 100,
      width: 40,
      height: 40,
      speed: 450
    };
    objectsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    starsCollectedRef.current = 0;
    if (scoreDisplayRef.current) {
      scoreDisplayRef.current.textContent = `${t.score}: 0`;
    }
    startTimeRef.current = Date.now();
    difficultyRef.current = 1;
    lastMilestoneRef.current = 0;
    lastTimeRef.current = 0;
    shakeRef.current = 0;
    flashRef.current = 0;
    sectorRef.current = 1;
    setCurrentSector(1);
    pacingRef.current = 'NORMAL';
    setCurrentPacing('NORMAL');
    pacingTimerRef.current = Date.now();
    comboRef.current = 0;
    setCurrentCombo(0);
    bgColorRef.current = { top: '#0f172a', bottom: '#1e293b' };
    targetBgColorRef.current = { top: '#0f172a', bottom: '#1e293b' };
    setGameActive(true);
    setIsPaused(false);
    isPausedRef.current = false;
    isCountingDownRef.current = false;
    setCountdown(null);
    pauseStartTimeRef.current = null;

    // Initialize powerups
    const now = Date.now();
    const shield = activePowerupsRef.current.find(p => p.type === 'shield' && (p.expiresAt === 0 || p.expiresAt > now));
    if (shield) {
      setHasShield(true);
      hasShieldRef.current = true;
    } else {
      setHasShield(false);
      hasShieldRef.current = false;
    }
    isInvincibleRef.current = false;
  }, []); // Stable initGame

  const togglePause = useCallback(() => {
    if (!gameActive || isCountingDownRef.current) return;
    playSound(800, 'sine', 0.1);
    const newPaused = !isPausedRef.current;
    
    if (newPaused) {
      setIsPaused(true);
      isPausedRef.current = true;
      pauseStartTimeRef.current = Date.now();
    } else {
      // Start Countdown
      isCountingDownRef.current = true;
      setCountdown(3);
      playSound(400, 'sine', 0.1);
      
      const countInterval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(countInterval);
            isCountingDownRef.current = false;
            setIsPaused(false);
            isPausedRef.current = false;
            if (pauseStartTimeRef.current) {
              const pausedDuration = Date.now() - pauseStartTimeRef.current;
              startTimeRef.current += pausedDuration;
              pauseStartTimeRef.current = null;
            }
            lastTimeRef.current = 0; // Reset lastTime to avoid jump
            return null;
          }
          playSound(400, 'sine', 0.1);
          return prev - 1;
        });
      }, 1000);
    }
  }, [gameActive, playSound]);

  const spawnObject = useCallback((width: number, forcedType?: 'star' | 'cloud' | 'powerup' | 'spaceship' | 'drone') => {
    let type: 'star' | 'cloud' | 'powerup' | 'spaceship' | 'drone';

    if (forcedType) {
      type = forcedType;
    } else {
      // Sector-based spawn logic
      const score = scoreRef.current;
      const pacing = pacingRef.current;
      
      // Calculate drone chance based on score and sector
      let droneChance = 0;
      if (score >= 2500) droneChance = 0.25; // Sector 3+
      else if (score >= 1000) droneChance = 0.15; // Sector 2
      
      // Intense pacing increases enemy chances
      if (pacing === 'INTENSE') droneChance *= 1.5;
      if (pacing === 'RECOVERY') droneChance *= 0.5;

      const hasDrone = objectsRef.current.some(o => o.type === 'drone');

      if (!hasDrone && Math.random() < droneChance) {
        type = 'drone';
      } else {
        const otherTypes: ('star' | 'cloud' | 'powerup' | 'spaceship')[] = ['star', 'star'];
        
        // Increase cloud presence significantly
        let cloudWeight = pacing === 'INTENSE' ? 3 : (pacing === 'RECOVERY' ? 0 : 1);
        
        // Reduce cloud production by 5% if a drone is present
        if (objectsRef.current.some(o => o.type === 'drone') && Math.random() < 0.05) {
          cloudWeight = 0;
        }

        for (let i = 0; i < cloudWeight; i++) {
          otherTypes.push('cloud');
        }
        
        // Powerup chance - higher in recovery
        const powerupChance = pacing === 'RECOVERY' ? 0.15 : 0.05;
        if (Math.random() < powerupChance) {
          otherTypes.push('powerup');
        }
        
        // Spaceship chance
        if (score >= 500) {
          const hasSpaceship = objectsRef.current.some(o => o.type === 'spaceship');
          let spaceshipChance = 0.1;
          if (score >= 2000) spaceshipChance = 0.2;
          if (pacing === 'INTENSE') spaceshipChance *= 1.5;
          
          if (!hasSpaceship && Math.random() < spaceshipChance) {
            otherTypes.push('spaceship');
          }
        }
        
        type = otherTypes[Math.floor(Math.random() * otherTypes.length)];
      }
    }
    
    let objWidth = 24;
    let objHeight = 24;
    let y = -50;
    
    // Base speed modified by pacing
    let pacingSpeedMult = 1.0;
    if (pacingRef.current === 'INTENSE') pacingSpeedMult = 1.2;
    if (pacingRef.current === 'RECOVERY') pacingSpeedMult = 0.8;
    
    let speed = (2 + Math.random() * 2) * difficultyRef.current * pacingSpeedMult;

    switch (type) {
      case 'star':
        objWidth = 24; objHeight = 24;
        break;
      case 'cloud':
        objWidth = 70; objHeight = 45;
        break;
      case 'powerup':
        objWidth = 30; objHeight = 30;
        break;
      case 'spaceship':
        objWidth = 60; objHeight = 35;
        y = 30;
        speed = 2 * difficultyRef.current;
        break;
      case 'drone':
        objWidth = 35; objHeight = 35;
        speed = 2.2 * difficultyRef.current;
        break;
    }
    
    const isSlowMotion = activePowerupsRef.current.some(p => p.type === 'slowMotion' && (p.expiresAt === 0 || Date.now() < p.expiresAt));
    if (isSlowMotion && (type === 'cloud' || type === 'drone')) {
      speed *= 0.5;
    }
    
    const newObj: GameObject = {
      id: Date.now() + Math.random(),
      x: Math.random() * (width - objWidth),
      y: y,
      width: objWidth,
      height: objHeight,
      type: type as any,
      speed: speed,
      direction: Math.random() > 0.5 ? 1 : -1,
      lastShot: Date.now()
    };
    objectsRef.current.push(newObj);
  }, [difficultyRef]);

  const createParticles = (x: number, y: number, color: string, count: number, vxRange = 10, vyRange = 10, baseVy = 0) => {
    if (graphicsQuality === 'very-low') return;
    
    let finalCount = count;
    if (graphicsQuality === 'low') finalCount = Math.floor(count * 0.2);
    else if (graphicsQuality === 'medium') finalCount = Math.floor(count * 0.6);
    
    // Limit total particles for performance
    const maxParticles = graphicsQuality === 'high' ? 300 : 150;
    if (particlesRef.current.length > maxParticles) return;
    
    for (let i = 0; i < finalCount; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * vxRange,
        vy: (Math.random() - 0.5) * vyRange + baseVy,
        life: 1.0,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  const shootAsteroid = useCallback(() => {
    if (!gameActiveRef.current || isPausedRef.current || fireAsteroidsRef.current <= 0) return;
    
    const now = Date.now();
    const cooldown = 250 * (1 - metaBuffs.fireAsteroidCooldownReduction);
    if (now - lastAsteroidShotRef.current < cooldown) return; // Cooldown with meta reduction
    lastAsteroidShotRef.current = now;
    
    onUseFireAsteroid();
    playSound(600, 'square', 0.1);
    createParticles(playerRef.current.x + playerRef.current.width / 2, playerRef.current.y, '#ef4444', 8, 5, 5);
    
    const newAsteroid: GameObject = {
      id: Date.now() + Math.random(),
      x: playerRef.current.x + playerRef.current.width / 2 - 10,
      y: playerRef.current.y - 20,
      width: 20,
      height: 20,
      type: 'fireAsteroid',
      speed: 7
    };
    
    objectsRef.current.push(newAsteroid);
  }, [onUseFireAsteroid, playSound]);

  const update = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !gameActive) return;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000; // Delta time in seconds
    lastTimeRef.current = timestamp;

    // Cap dt to avoid huge jumps after tab switch or lag
    const cappedDt = Math.min(dt, 0.1);

    if (!isPausedRef.current) {
      const now = Date.now();

      // Update Pacing & Sectors
      if (now - pacingTimerRef.current > (pacingRef.current === 'NORMAL' ? 25000 : 12000)) {
        pacingTimerRef.current = now;
        if (pacingRef.current === 'NORMAL') {
          pacingRef.current = 'INTENSE';
        } else if (pacingRef.current === 'INTENSE') {
          pacingRef.current = 'RECOVERY';
        } else {
          pacingRef.current = 'NORMAL';
        }
        setCurrentPacing(pacingRef.current);
      }

      // Update Sector & Background Colors
      const score = scoreRef.current;
      let newSector = 1;
      if (score < 1000) {
        newSector = 1;
        targetBgColorRef.current = { top: '#0f172a', bottom: '#1e293b' };
      } else if (score < 1750) {
        newSector = 2;
        targetBgColorRef.current = { top: '#2e1065', bottom: '#4c1d95' }; // Purple Nebula
      } else if (score < 2600) {
        newSector = 3;
        targetBgColorRef.current = { top: '#450a0a', bottom: '#7f1d1d' }; // Red Asteroid Belt
      } else {
        newSector = 4;
        targetBgColorRef.current = { top: '#020617', bottom: '#0f172a' }; // Deep Space
      }

      if (newSector !== sectorRef.current) {
        sectorRef.current = newSector;
        setCurrentSector(newSector);
        playSound(1200, 'sine', 0.5);
      }

      // Smooth color transition
      const lerpColor = (current: string, target: string, factor: number) => {
        const c = parseInt(current.slice(1), 16);
        const t = parseInt(target.slice(1), 16);
        
        const r1 = c >> 16;
        const g1 = (c >> 8) & 0xff;
        const b1 = c & 0xff;
        
        const r2 = t >> 16;
        const g2 = (t >> 8) & 0xff;
        const b2 = t & 0xff;
        
        const lerpVal = (v1: number, v2: number) => {
          if (v1 === v2) return v1;
          const diff = v2 - v1;
          if (Math.abs(diff) <= 1) return v2;
          const move = diff * factor;
          // Ensure movement is at least 1 if difference is significant
          if (Math.abs(move) < 1) return v1 + Math.sign(diff);
          return v1 + move;
        };
        
        const r = Math.min(255, Math.max(0, Math.round(lerpVal(r1, r2))));
        const g = Math.min(255, Math.max(0, Math.round(lerpVal(g1, g2))));
        const b = Math.min(255, Math.max(0, Math.round(lerpVal(b1, b2))));
        
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      };

      bgColorRef.current.top = lerpColor(bgColorRef.current.top, targetBgColorRef.current.top, 0.05);
      bgColorRef.current.bottom = lerpColor(bgColorRef.current.bottom, targetBgColorRef.current.bottom, 0.05);

      // Move Player
      const moveAmount = playerRef.current.speed * metaBuffs.speedMultiplier * cappedDt;
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
        playerRef.current.x -= moveAmount;
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
        playerRef.current.x += moveAmount;
      }

      // Touch Support
      if (touchRef.current !== null) {
        const centerX = canvas.width / 2;
        if (touchRef.current < centerX) {
          playerRef.current.x -= moveAmount;
        } else {
          playerRef.current.x += moveAmount;
        }
      }

      // Boundary Check
      if (playerRef.current.x < 0) playerRef.current.x = 0;
      if (playerRef.current.x > canvas.width - playerRef.current.width) {
        playerRef.current.x = canvas.width - playerRef.current.width;
      }

      // Spawn Objects
      
      // Immediate Spawns
      if (scoreRef.current >= 500 && !hasSpawnedUFO.current) {
        spawnObject(canvas.width, 'spaceship');
        hasSpawnedUFO.current = true;
      }
      if (scoreRef.current >= 1000 && !hasSpawnedDrone.current) {
        spawnObject(canvas.width, 'drone');
        hasSpawnedDrone.current = true;
      }

      if (now - lastSpawnRef.current > 800 / difficultyRef.current) {
        spawnObject(canvas.width);
        lastSpawnRef.current = now;
      }

      // Update Objects
      const newProjectiles: GameObject[] = [];
      objectsRef.current = objectsRef.current.filter(obj => {
        const p = playerRef.current;
        const isSlowMotion = activePowerupsRef.current.some(p => p.type === 'slowMotion' && (p.expiresAt === 0 || Date.now() < p.expiresAt));

        if (obj.type === 'star') {
          const isMagnet = activePowerupsRef.current.some(p => p.type === 'magnet' && (p.expiresAt === 0 || Date.now() < p.expiresAt));
          if (isMagnet) {
            const dx = p.x + p.width / 2 - (obj.x + obj.width / 2);
            const dy = p.y + p.height / 2 - (obj.y + obj.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 200 + metaBuffs.magnetRangeBoost * 100) {
              const pullForce = 5;
              obj.x += (dx / distance) * pullForce * 60 * cappedDt;
              obj.y += (dy / distance) * pullForce * 60 * cappedDt;
            } else {
              obj.y += obj.speed * 60 * cappedDt;
            }
          } else {
            obj.y += obj.speed * 60 * cappedDt;
          }
        } else if (obj.type === 'spaceship') {
          // Spaceship moves side to side
          obj.x += obj.speed * obj.direction! * 60 * cappedDt;
          if (obj.x <= 0) {
            obj.direction = 1;
            obj.x = 0; // Clamp to edge
          } else if (obj.x >= canvas.width - obj.width) {
            obj.direction = -1;
            obj.x = canvas.width - obj.width; // Clamp to edge
          }
          
          // Shoot asteroids
          const isStunned = obj.stunnedUntil && Date.now() < obj.stunnedUntil;
          let shootInterval = 2000 / difficultyRef.current;
          
          // Reduce firing rate by 8% if a drone is present
          if (objectsRef.current.some(o => o.type === 'drone')) {
            shootInterval *= 1.08;
          }

          if (!isStunned && Date.now() - obj.lastShot! > shootInterval) {
            obj.lastShot = Date.now();
            playSound(200, 'square', 0.1);
            newProjectiles.push({
              id: Date.now() + Math.random(),
              x: obj.x + obj.width / 2 - 10,
              y: obj.y + obj.height,
              width: 20,
              height: 20,
              type: 'asteroid',
              speed: (4 + Math.random() * 2) * difficultyRef.current * (isSlowMotion ? 0.5 : 1)
            });
          }
        } else if (obj.type === 'drone') {
          const spaceship = objectsRef.current.find(o => o.type === 'spaceship');
          const isSpaceshipStunned = spaceship?.stunnedUntil && Date.now() < spaceship.stunnedUntil;
          const speedMultiplier = isSpaceshipStunned ? 0.9 : 1.0;
          
          obj.y += obj.speed * speedMultiplier * 60 * cappedDt;
          // Track player X
          const dx = p.x + p.width / 2 - (obj.x + obj.width / 2);
          obj.x += Math.sign(dx) * 1.5 * difficultyRef.current * speedMultiplier * 60 * cappedDt;
        } else if (obj.type === 'fireAsteroid') {
          obj.y -= obj.speed * 60 * cappedDt;
          
          // Track spaceship X (AI tracking)
          const spaceship = objectsRef.current.find(o => o.type === 'spaceship');
          if (spaceship) {
            const dx = (spaceship.x + spaceship.width / 2) - (obj.x + obj.width / 2);
            // Smooth tracking speed
            obj.x += Math.sign(dx) * 2.5 * 60 * cappedDt;

            // Check collision with spaceship
            if (obj.x < spaceship.x + spaceship.width &&
                obj.x + obj.width > spaceship.x &&
                obj.y < spaceship.y + spaceship.height &&
                obj.y + obj.height > spaceship.y) {
              
              spaceship.stunnedUntil = Date.now() + 4000;
              spaceshipHitsRef.current += 1;
              playSound(300, 'sawtooth', 0.2); // Headache sound
              createParticles(obj.x + obj.width / 2, obj.y + obj.height / 2, '#ef4444', 30, 15, 15);
              return false; // Remove asteroid
            }
          }
        } else {
          const spaceship = objectsRef.current.find(o => o.type === 'spaceship');
          const isSpaceshipStunned = spaceship?.stunnedUntil && Date.now() < spaceship.stunnedUntil;
          const speedMultiplier = (obj.type === 'cloud' && isSpaceshipStunned) ? 0.9 : 1.0;
          
          obj.y += obj.speed * speedMultiplier * 60 * cappedDt;
        }

        // Collision Detection
        if (
          p.x < obj.x + obj.width &&
          p.x + p.width > obj.x &&
          p.y < obj.y + obj.height &&
          p.y + p.height > obj.y
        ) {
          if (obj.type === 'star') {
            const isDoublePoints = activePowerupsRef.current.some(p => p.type === 'doublePoints' && (p.expiresAt === 0 || Date.now() < p.expiresAt));
            const comboBonus = Math.floor(comboRef.current / 5);
            const points = Math.floor(((isDoublePoints ? 20 : 10) + comboBonus) * metaBuffs.starValueMultiplier);
            
            scoreRef.current += points;
            starsCollectedRef.current += 1;
            if (scoreDisplayRef.current) {
              scoreDisplayRef.current.textContent = `${t.score}: ${scoreRef.current}`;
            }
            playSound(600 + comboRef.current * 10, 'sine', 0.1);
            flashRef.current = 0.3;
            
            // Particle burst
            createParticles(obj.x + obj.width / 2, obj.y + obj.height / 2, '#fbbf24', 20, 12, 12);
            
            // Milestone check (every 100 points)
            const currentMilestone = Math.floor(scoreRef.current / 100);
            if (currentMilestone > lastMilestoneRef.current) {
              lastMilestoneRef.current = currentMilestone;
              playMilestoneSound();
            }
            
            difficultyRef.current += 0.01 * (1 + (metaBuffs.riskDifficultyBoost || 0));
            return false; // Remove star
          } else if (obj.type === 'powerup') {
            // ... powerup logic ...
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
              audioCtxRef.current.resume().catch(() => {});
            }
            playSound(1000, 'sine', 0.2);
            createParticles(obj.x + obj.width / 2, obj.y + obj.height / 2, '#ec4899', 30, 15, 15);
            
            const powerupTypes: ('shield' | 'doublePoints' | 'slowMotion' | 'magnet')[] = [
              'shield', 'doublePoints', 'slowMotion', 'magnet', 'magnet', 'magnet'
            ];
            const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            
            const duration = randomType === 'shield' ? 0 : 15;
            const finalDuration = duration * (1 + metaBuffs.shieldDurationBoost);
            const newPowerup: ActivePowerup = {
              id: `powerup_${Date.now()}_${Math.random()}`,
              type: randomType,
              expiresAt: duration === 0 ? 0 : Date.now() + finalDuration * 1000
            };
            
            activePowerupsRef.current = [...activePowerupsRef.current, newPowerup];
            if (randomType === 'shield') {
              hasShieldRef.current = true;
              setHasShield(true);
            }
            
            scoreRef.current += 50;
            if (scoreDisplayRef.current) {
              scoreDisplayRef.current.textContent = `${t.score}: ${scoreRef.current}`;
            }
            return false;
          } else {
            // Enemies
            if (isInvincibleRef.current) return true;
            
            // Neon Raider Auto-Dodge (5% chance)
            if (activeSkin?.id === 'neon_raider' && Math.random() < 0.05) {
              createParticles(p.x + p.width / 2, p.y + p.height / 2, '#10b981', 15, 8, 8);
              return false; // Dodge!
            }
            
            if (hasShieldRef.current) {
              hasShieldRef.current = false;
              setHasShield(false);
              shakeRef.current = 10;
              playSound(300, 'square', 0.2);
              confetti({
                particleCount: 20,
                spread: 30,
                origin: { x: p.x / canvas.width, y: p.y / canvas.height }
              });
              return false; // Remove enemy
            }
            
            setGameActive(false);
            gameActiveRef.current = false;
            playSound(100, 'sawtooth', 0.3);
            const survivalTime = (Date.now() - startTimeRef.current) / 1000;
            onGameOver(scoreRef.current, {
              stars: starsCollectedRef.current,
              difficulty: difficultyRef.current,
              time: survivalTime,
              spaceshipHits: spaceshipHitsRef.current,
              nearMisses: nearMissesRef.current
            });
            return false;
          }
        }

        // Near Miss Detection (Skill Reward)
        if (obj.type !== 'star' && obj.type !== 'powerup' && obj.type !== 'fireAsteroid') {
          const dx = p.x + p.width / 2 - (obj.x + obj.width / 2);
          const dy = p.y + p.height / 2 - (obj.y + obj.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nearDist = (p.width + obj.width) / 2 + 15;
          
          if (dist < nearDist && !isInvincibleRef.current) {
            if (Date.now() - lastComboTimeRef.current > 500) {
              comboRef.current += 1;
              nearMissesRef.current += 1;
              setCurrentCombo(comboRef.current);
              lastComboTimeRef.current = Date.now();
              createParticles(p.x + p.width / 2, p.y, '#38bdf8', 5, 5, 5);
            }
          }
        }

        return obj.y < canvas.height + 100 && obj.y > -200;
      });

      if (newProjectiles.length > 0) {
        objectsRef.current.push(...newProjectiles);
      }

      // Update Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx * 60 * cappedDt;
        p.y += p.vy * 60 * cappedDt;
        p.life -= 1.2 * cappedDt; // Scale life reduction to be consistent
        return p.life > 0;
      });

      frameRef.current += 60 * cappedDt;
      shakeRef.current = Math.max(0, shakeRef.current - 60 * cappedDt);
      flashRef.current = Math.max(0, flashRef.current - 3 * cappedDt);

      // Combo Decay
      if (comboRef.current > 0 && now - lastComboTimeRef.current > 3000) {
        comboRef.current = 0;
        setCurrentCombo(0);
      }
    }

    // Draw
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (shakeRef.current > 0) {
      const sx = (Math.random() - 0.5) * shakeRef.current;
      const sy = (Math.random() - 0.5) * shakeRef.current;
      ctx.translate(sx, sy);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dynamic Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, bgColorRef.current.top);
    gradient.addColorStop(1, bgColorRef.current.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Stars (Background Starfield)
    if (starCanvasRef.current) {
      const speed = 0.5;
      const yOffset = (frameRef.current * speed) % canvas.height;
      ctx.drawImage(starCanvasRef.current, 0, yOffset);
      ctx.drawImage(starCanvasRef.current, 0, yOffset - canvas.height);
    }

    // Speed Lines
    if (graphicsQuality !== 'low' && graphicsQuality !== 'very-low') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const lineCount = graphicsQuality === 'medium' ? 5 : 10;
      for (let i = 0; i < lineCount; i++) {
        const x = (Math.sin(i * 999) * 0.5 + 0.5) * canvas.width;
        const y = (frameRef.current * 15 + i * 100) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 40);
        ctx.stroke();
      }
    }

    // Draw Player (Improved Rocket)
    const p = playerRef.current;
    
    // Invincibility Flash
    if (!(isInvincibleRef.current && !isPausedRef.current && Math.floor(frameRef.current / 5) % 2 === 0)) {
      // Shield Aura
      if (hasShieldRef.current) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        if (graphicsQuality === 'high') {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#38bdf8';
        }
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.fill();
        if (graphicsQuality === 'high') ctx.restore();
      }

      // Magnet Aura
      const isMagnet = activePowerupsRef.current.some(p => p.type === 'magnet' && (p.expiresAt === 0 || Date.now() < p.expiresAt));
      if (isMagnet) {
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
      }

      // Rocket Body
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      
      let tilt = 0;
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) tilt = -0.15;
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) tilt = 0.15;
      if (touchRef.current !== null) {
        const centerX = canvas.width / 2;
        tilt = touchRef.current < centerX ? -0.15 : 0.15;
      }
      ctx.rotate(tilt);
      ctx.translate(-p.width / 2, -p.height / 2);
      
      if (graphicsQuality === 'very-low') {
        // Retro blocky rocket
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(10, 0, 20, 40); // Body
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(0, 30, 10, 10); // Left fin
        ctx.fillRect(30, 30, 10, 10); // Right fin
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(15, 10, 10, 10); // Window
        
        // Minimal flame
        if (Math.floor(frameRef.current) % 4 < 2) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(15, 40, 10, 5);
        }
      } else {
        // Flame
        if (Math.floor(frameRef.current) % 4 < 2) {
          const flameGradient = ctx.createLinearGradient(0, p.height, 0, p.height + 25);
          flameGradient.addColorStop(0, '#f59e0b');
          flameGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = flameGradient;
          ctx.beginPath();
          ctx.moveTo(10, p.height);
          ctx.lineTo(p.width - 10, p.height);
          ctx.lineTo(p.width / 2, p.height + 20 + Math.random() * 10);
          ctx.fill();
        }

        // Fins
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(0, p.height);
        ctx.lineTo(10, p.height - 20);
        ctx.lineTo(10, p.height);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p.width, p.height);
        ctx.lineTo(p.width - 10, p.height - 20);
        ctx.lineTo(p.width - 10, p.height);
        ctx.fill();

        // Main Body
        ctx.fillStyle = activeSkin?.previewColor || '#ef4444';
        ctx.beginPath();
        ctx.moveTo(p.width / 2, 0);
        ctx.quadraticCurveTo(p.width, p.height * 0.3, p.width - 5, p.height);
        ctx.lineTo(5, p.height);
        ctx.quadraticCurveTo(0, p.height * 0.3, p.width / 2, 0);
        ctx.fill();

        // Window
        if (graphicsQuality !== 'low') {
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#38bdf8';
        }
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.width / 2, p.height * 0.4, 8, 0, Math.PI * 2);
        ctx.fill();
        if (graphicsQuality !== 'low') ctx.restore();
        
        ctx.strokeStyle = '#0c4a6e';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      ctx.restore();
    }

    // Draw Objects
    objectsRef.current.forEach(obj => {
      if (obj.type === 'star') {
        if (graphicsQuality === 'very-low') {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        } else {
          ctx.save();
          if (graphicsQuality !== 'low') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fbbf24';
            
            // Star Trail
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obj.x + obj.width / 2, obj.y + obj.height / 2);
            ctx.lineTo(obj.x + obj.width / 2, obj.y - 10);
            ctx.stroke();
          }

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          const cx = obj.x + obj.width / 2;
          const cy = obj.y + obj.height / 2;
          const rot = frameRef.current * 0.05;
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(cx + Math.cos(rot + (18 + i * 72) * Math.PI / 180) * 12, cy - Math.sin(rot + (18 + i * 72) * Math.PI / 180) * 12);
            ctx.lineTo(cx + Math.cos(rot + (54 + i * 72) * Math.PI / 180) * 6, cy - Math.sin(rot + (54 + i * 72) * Math.PI / 180) * 6);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      } else if (obj.type === 'spaceship') {
        // Alien Spaceship
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        
        if (graphicsQuality === 'very-low') {
          ctx.fillStyle = '#475569';
          ctx.fillRect(obj.x, obj.y + 5, obj.width, 15);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(cx - 10, obj.y, 20, 10);
        } else {
          ctx.save();
          // Glow
          if (graphicsQuality === 'high') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#10b981';
          }
          
          // Body
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(cx, cy, obj.width / 2, obj.height / 3, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Cockpit
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(cx, cy - 5, 10, 0, Math.PI * 2);
          ctx.fill();
          
          // Lights
          const time = Date.now() * 0.01;
          ctx.fillStyle = Math.sin(time) > 0 ? '#f87171' : '#ef4444';
          ctx.beginPath();
          ctx.arc(cx - 15, cy + 5, 3, 0, Math.PI * 2);
          ctx.arc(cx + 15, cy + 5, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        
        // Headache effect
        if (obj.stunnedUntil && Date.now() < obj.stunnedUntil) {
          ctx.save();
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 2;
          const time = Date.now() * 0.01;
          for (let i = 0; i < 3; i++) {
            const angle = time + (i * Math.PI * 2 / 3);
            const x = cx + Math.cos(angle) * 20;
            const y = cy - 15 + Math.sin(angle) * 5;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }
      } else if (obj.type === 'fireAsteroid') {
        // Red Fire Asteroid
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        const radius = obj.width / 2;
        
        if (graphicsQuality === 'very-low') {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.fillStyle = '#fee2e2';
          ctx.fillRect(cx - 3, cy - 3, 6, 6);
        } else {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((frameRef.current * 0.05) + (obj.id % 10));
          ctx.translate(-cx, -cy);

          // Fire Glow
          if (graphicsQuality !== 'low') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ef4444';
          }

          // Body
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const r = radius * (0.8 + Math.random() * 0.4);
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();

          // Fire Trail
          if (graphicsQuality !== 'low') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.arc(cx + (Math.random() - 0.5) * 10, cy + radius + 5 + i * 5, radius * (0.5 - i * 0.1), 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }
      } else if (obj.type === 'asteroid') {
        // Detailed Asteroid
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        const radius = obj.width / 2;
        
        if (graphicsQuality === 'very-low') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(obj.x + 4, obj.y + 4, 4, 4);
        } else {
          ctx.save();
          // Rotate asteroid based on its ID and frame
          ctx.translate(cx, cy);
          ctx.rotate((frameRef.current * 0.02) + (obj.id % 10));
          ctx.translate(-cx, -cy);

          if (graphicsQuality !== 'low') {
            // Glow/Atmosphere for higher quality
            if (graphicsQuality === 'high') {
              ctx.shadowBlur = 10;
              ctx.shadowColor = 'rgba(120, 53, 15, 0.5)';
            }
            
            // Irregular Shape (Polygon instead of Circle)
            ctx.beginPath();
            const points = 8;
            for (let i = 0; i < points; i++) {
              const angle = (i / points) * Math.PI * 2;
              // Use obj.id to make each asteroid uniquely irregular
              const variance = (Math.sin(angle * 3 + obj.id) * 0.2) + 0.9;
              const r = radius * variance;
              const px = cx + Math.cos(angle) * r;
              const py = cy + Math.sin(angle) * r;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            
            // Gradient for 3D look
            const grad = ctx.createRadialGradient(cx - radius/3, cy - radius/3, radius/4, cx, cy, radius);
            grad.addColorStop(0, '#a16207'); // Lighter brown
            grad.addColorStop(1, '#78350f'); // Darker brown
            ctx.fillStyle = grad;
            ctx.fill();

            // More detailed craters
            ctx.fillStyle = 'rgba(69, 26, 3, 0.6)';
            const craterPositions = [
              { r: 0.5, a: 0.4, s: 0.2 },
              { r: 0.6, a: 2.5, s: 0.15 },
              { r: 0.3, a: 4.8, s: 0.25 }
            ];
            
            craterPositions.forEach(c => {
              const cpx = cx + Math.cos(c.a) * (radius * c.r);
              const cpy = cy + Math.sin(c.a) * (radius * c.r);
              ctx.beginPath();
              ctx.arc(cpx, cpy, radius * c.s, 0, Math.PI * 2);
              ctx.fill();
              
              // Crater rim/highlight
              if (graphicsQuality === 'high') {
                ctx.strokeStyle = 'rgba(161, 98, 7, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            });
          } else {
            // Simple version for low quality
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            // Minimal craters
            ctx.fillStyle = '#451a03';
            ctx.beginPath();
            ctx.arc(cx - 4, cy - 4, 3, 0, Math.PI * 2);
            ctx.arc(cx + 4, cy + 2, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      } else if (obj.type === 'drone') {
        // Seeker Drone
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        
        if (graphicsQuality === 'very-low') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(cx - 3, cy - 3, 6, 6);
        } else {
          ctx.save();
          // Body
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(obj.x, obj.y + 10, obj.width, 15);
          
          // Eye
          const blink = Math.sin(Date.now() * 0.02) > 0;
          ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Rotors
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          const rot = frameRef.current * 0.5;
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y + 10);
          ctx.lineTo(obj.x + Math.cos(rot) * 10, obj.y + 10 + Math.sin(rot) * 5);
          ctx.moveTo(obj.x + obj.width, obj.y + 10);
          ctx.lineTo(obj.x + obj.width + Math.cos(rot + Math.PI) * 10, obj.y + 10 + Math.sin(rot + Math.PI) * 5);
          ctx.stroke();
        }
        
        ctx.restore();
      } else if (obj.type === 'powerup') {
        // Powerup Icon
        if (graphicsQuality === 'very-low') {
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('?', obj.x + obj.width / 2, obj.y + obj.height / 2 + 6);
        } else {
          ctx.save();
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.roundRect(obj.x, obj.y, obj.width, obj.height, 8);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('?', obj.x + obj.width / 2, obj.y + obj.height / 2 + 6);
          ctx.restore();
        }
      } else {
        // Fluffy Cloud
        const ox = obj.x + (graphicsQuality === 'high' ? Math.sin(frameRef.current * 0.05 + obj.id) * 5 : 0);
        const oy = obj.y;
        
        if (graphicsQuality === 'very-low') {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(ox + 10, oy + 10, 50, 25);
          ctx.fillRect(ox + 20, oy, 30, 15);
        } else {
          ctx.save();
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(ox + 20, oy + 25, 18, 0, Math.PI * 2);
          ctx.arc(ox + 35, oy + 15, 20, 0, Math.PI * 2);
          ctx.arc(ox + 50, oy + 25, 18, 0, Math.PI * 2);
          ctx.fill();
          
          // Cloud shadow
          if (graphicsQuality !== 'low') {
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(ox + 20, oy + 30, 15, 0, Math.PI * 2);
            ctx.arc(ox + 35, oy + 25, 15, 0, Math.PI * 2);
            ctx.arc(ox + 50, oy + 30, 15, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    if (flashRef.current > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashRef.current})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Add engine particles
    if (gameActive && !isPausedRef.current && Math.floor(frameRef.current) % (graphicsQuality === 'low' ? 6 : 2) === 0) {
      createParticles(p.x + p.width / 2, p.y + p.height, '#f59e0b', 1, 4, 4, 5);
    }

    ctx.restore();

    if (gameActive) {
      requestAnimationFrame(update);
    }
  }, [gameActive, onGameOver, playSound, spawnObject]);

  useEffect(() => {
    (window as any).reviveGame = () => {
      setGameActive(true);
      gameActiveRef.current = true;
      if (scoreDisplayRef.current) {
        scoreDisplayRef.current.textContent = `${t.score}: ${scoreRef.current}`;
      }
      isPausedRef.current = true; // Start paused for countdown
      setIsPaused(true);
      isInvincibleRef.current = true;
      
      // Clear nearby enemies
      objectsRef.current = objectsRef.current.filter(obj => 
        obj.type === 'star' || obj.type === 'powerup' || 
        Math.sqrt(Math.pow(obj.x - playerRef.current.x, 2) + Math.pow(obj.y - playerRef.current.y, 2)) > 200
      );
      
      // Start Countdown
      isCountingDownRef.current = true;
      setCountdown(3);
      playSound(400, 'sine', 0.1);
      
      const countInterval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(countInterval);
            isCountingDownRef.current = false;
            setIsPaused(false);
            isPausedRef.current = false;
            lastTimeRef.current = 0; // Reset lastTime to avoid jump
            
            // Give 3 seconds of invincibility AFTER countdown
            isInvincibleRef.current = true;
            setTimeout(() => {
              isInvincibleRef.current = false;
            }, 3000);
            
            return null;
          }
          playSound(400, 'sine', 0.1);
          return prev - 1;
        });
      }, 1000);
    };
    return () => { delete (window as any).reviveGame; };
  }, [startMusic, update, playSound]);

  useEffect(() => {
    initGame();
  }, []); // Only run once on mount

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === ' ' || e.key === 'f') {
        shootAsteroid();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.key] = false;
    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      touchRef.current = e.touches[0].clientX;
    };
    const handleTouchEnd = () => touchRef.current = null;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    lastTimeRef.current = 0;
    const frameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameId);
      stopMusic();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, shootAsteroid]);

  // Dedicated Audio Cleanup Effect
  useEffect(() => {
    return () => {
      stopMusic();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [stopMusic]);

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center ${isEid ? 'bg-gradient-to-b from-indigo-950 to-purple-950' : 'bg-slate-900'} overflow-hidden`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-10 flex flex-col gap-2`}>
        <div ref={scoreDisplayRef} className="text-white font-bold text-2xl drop-shadow-md">
          {t.score}: {scoreRef.current}
        </div>
        
        {/* Sector Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 w-fit">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
              {t.sector} {currentSector}: {t.sectors[currentSector]}
            </span>
          </div>
          
          {/* Pacing Info */}
          <div className={`flex items-center gap-2 px-3 py-1 backdrop-blur-md rounded-full border w-fit transition-all duration-500 ${
            currentPacing === 'INTENSE' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' :
            currentPacing === 'RECOVERY' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
            'bg-white/5 border-white/10 text-slate-400'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {t.intensity[currentPacing]}
            </span>
          </div>
        </div>

        {/* Active Powerups UI */}
        <div className="flex gap-2">
          {hasShield && (
            <div className={`p-1.5 ${isEid ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-sky-500/20 border-sky-500/50 text-sky-400'} rounded-lg border flex items-center gap-1`} title={t.activeShield}>
              <Shield className="w-4 h-4" />
              {isEid && <Moon className="w-3 h-3 fill-current" />}
            </div>
          )}
          {activePowerups.map(p => {
            if (p.type === 'shield') return null;
            const isExpired = p.expiresAt > 0 && Date.now() > p.expiresAt;
            if (isExpired) return null;
            
            return (
              <div key={p.id} className="p-1.5 bg-pink-500/20 rounded-lg border border-pink-500/50 text-pink-400 animate-pulse">
                {p.type === 'doublePoints' ? <SpeedZap className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fire Asteroids UI - Moved out of top-4 div and positioned for mobile */}
      {fireAsteroids > 0 && !isPaused && (
        <button 
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            shootAsteroid();
          }}
          className={`absolute bottom-24 right-8 z-50 w-12 h-12 bg-red-600/80 hover:bg-red-500 text-white rounded-full shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-90 transition-all flex flex-col items-center justify-center border-2 border-white/20 backdrop-blur-sm touch-none`}
          aria-label="Shoot Fire Asteroid"
        >
          <Flame className="w-5 h-5 fill-white animate-pulse" />
          <span className="text-[8px] font-bold mt-0.5">{fireAsteroids}</span>
        </button>
      )}
      
      <button
        onClick={togglePause}
        className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/10 transition-all active:scale-95`}
        title={isPaused ? t.resume : t.pause}
      >
        {isPaused ? <Play className={`w-6 h-6 fill-white text-white ${language === 'ar' ? 'rotate-180' : ''}`} /> : <Pause className="w-6 h-6 text-white" />}
      </button>

      {/* Combo Display */}
      <AnimatePresence>
        {currentCombo > 0 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, x: language === 'ar' ? -20 : 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.5, opacity: 0, x: language === 'ar' ? -20 : 20 }}
            className={`absolute top-20 ${language === 'ar' ? 'left-4' : 'right-4'} z-10 flex flex-col items-end`}
          >
            <div className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-lg">
              x{currentCombo}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60">
              {t.combo}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPaused && (
        <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            {countdown !== null ? (
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl font-black text-white"
              >
                {countdown}
              </motion.div>
            ) : (
              <div className="animate-pulse">
                <h2 className="text-4xl font-black text-white mb-4">{t.paused}</h2>
                <p className="text-slate-300">{t.continue}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="max-w-full max-h-full border-4 border-slate-700 rounded-lg shadow-2xl bg-slate-800"
      />
    </div>
  );
});

export default SkyDash;
