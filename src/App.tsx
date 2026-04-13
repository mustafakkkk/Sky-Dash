import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Play, Trophy, Settings, Volume2, VolumeX, Home, RotateCcw, Star, Medal, Lock, CheckCircle2, ListTodo, Clock, Zap, ZapOff, ShoppingBag, Shield, Zap as SpeedZap, Coins, Moon, Sparkles, Calendar, Timer, Gift, Magnet, Target, Rocket, Bot, Send, X, Plus, Menu, Image as ImageIcon, Check, Bell, Inbox, Factory, Building2, Crown } from 'lucide-react';
import SkyDash from './components/SkyDash';
import StarForge from './components/forge/StarForge';
import { getMetaBuffs } from './lib/forgeUtils';
import confetti from 'canvas-confetti';
import { WeeklyTask, GameStats, DailyTask, Powerup, ActivePowerup, GraphicsQuality, Language, LeaderboardEntry, League, InboxItem, ForgeStats, MetaBuffs } from './types';
import { getTranslation } from './translations';
import AIModal from './components/AIModal';
import LeaderboardModal from './components/LeaderboardModal';
import InboxScreen from './components/InboxScreen';
import EconomyHub from './components/EconomyHub';
import SkyPassModal from './components/SkyPassModal';

import { INITIAL_ARTIFACTS, INITIAL_SKINS, INITIAL_CONTRACTS, SKY_PASS_TIERS } from './constants/economy';

type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER' | 'SETTINGS' | 'WEEKLY_TASKS' | 'DAILY_TASKS' | 'STORE' | 'INSTRUCTIONS' | 'EVENTS' | 'INBOX' | 'ECONOMY_HUB';

const LEAGUES: League[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'heroic'];

const LEAGUE_CONFIG = {
  bronze: { scoreMultiplier: 0.6, skillMultiplier: 0.72, scoreGainFactor: 58 },
  silver: { scoreMultiplier: 1.2, skillMultiplier: 0.99, scoreGainFactor: 117 },
  gold: { scoreMultiplier: 2.5, skillMultiplier: 1.35, scoreGainFactor: 252 },
  platinum: { scoreMultiplier: 5.0, skillMultiplier: 1.8, scoreGainFactor: 495 },
  diamond: { scoreMultiplier: 10.0, skillMultiplier: 2.7, scoreGainFactor: 990 },
  heroic: { scoreMultiplier: 20.0, skillMultiplier: 4.5, scoreGainFactor: 1980 },
};

const BOT_NAMES_SA = [
  'محمد', 'أحمد', 'ياسين', 'عمر', 'علي', 'يوسف', 'إبراهيم', 'خالد', 'عبدالله', 'سلطان',
  'فيصل', 'سعود', 'فهد', 'منصور', 'زياد', 'بدر', 'سعد', 'نايف', 'مشعل', 'تركي',
  'عبدالرحمن', 'عبدالعزيز', 'ماجد', 'راكان', 'نواف', 'طلال', 'ثامر', 'سلمان', 'بندر', 'مشاري',
  'خليل', 'سعيد', 'صالح', 'ناصر', 'حمزة', 'أسامة', 'ريان', 'وليد', 'عادل', 'سامي'
];

const BOT_NAMES_EG = [
  'محمود', 'مصطفى', 'كريم', 'هاني', 'وائل', 'تامر', 'شادي', 'رامي', 'إيهاب', 'طارق',
  'علاء', 'مجدي', 'شريف', 'حسين', 'عمرو', 'خالد', 'وليد', 'ياسر', 'أشرف', 'سامح',
  'أدهم', 'باسم', 'حمادة', 'زيزو', 'ميدو', 'عصام', 'حازم', 'جمال', 'سعيد', 'فتحي',
  'مدحت', 'نبيل', 'يحيى', 'زكريا', 'كمال', 'رفعت', 'شوقي', 'فتحي', 'مراد', 'منير'
];

const BOT_NAMES_AE = [
  'هزاع', 'سيف', 'راشد', 'حمدان', 'مكتوم', 'خليفة', 'زايد', 'سلطان', 'منصور', 'سالم',
  'عبدالله', 'محمد', 'أحمد', 'جمعة', 'مبارك', 'سعيد', 'عيسى', 'خلفان', 'حارب', 'بطي',
  'غانم', 'مطر', 'فلاح', 'سهيل', 'عبيد', 'جمعة', 'راشد', 'سيف', 'حميد', 'سلطان'
];

const BOT_NAMES_KW = [
  'مبارك', 'فهد', 'جاسم', 'سالم', 'حمد', 'مشعل', 'نواف', 'طلال', 'بدر', 'ضاري',
  'عبدالعزيز', 'عبدالرحمن', 'يوسف', 'علي', 'حسين', 'خالد', 'ناصر', 'سعد', 'فيصل', 'صالح',
  'مشاري', 'أحمد', 'محمد', 'سليمان', 'يعقوب', 'إبراهيم', 'عبدالله', 'عيسى', 'أنور', 'بدر'
];

const BOT_NAMES_US = [
  'James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher',
  'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Gary', 'Nicholas', 'Eric', 'Stephen', 'Jonathan', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin'
];

const BOT_NAMES_UK = [
  'Oliver', 'George', 'Noah', 'Arthur', 'Harry', 'Leo', 'Jack', 'Charlie', 'Oscar', 'Jacob',
  'Henry', 'Thomas', 'Freddie', 'Alfie', 'Theo', 'William', 'Theodore', 'Archie', 'Joshua', 'James',
  'Edward', 'Sebastian', 'Lucas', 'Max', 'Isaac', 'Finley', 'Teddy', 'Alexander', 'Adam', 'Daniel',
  'Harrison', 'Lewis', 'Toby', 'Mason', 'Ethan', 'Harvey', 'Jude', 'Harley', 'Luca', 'Hugo'
];

const BOT_NAMES_JP = [
  'Haruto', 'Riku', 'Haruki', 'Sora', 'Kaito', 'Itsuki', 'Yuma', 'Ren', 'Minato', 'Asahi',
  'Yuuto', 'Akito', 'Hiroto', 'Soma', 'Yamato', 'Hinata', 'Yuto', 'Yusei', 'Ryusei', 'Kenji',
  'Takumi', 'Sho', 'Daiki', 'Kenta', 'Tsubasa', 'Kazuki', 'Hayato', 'Ryo', 'Naoki', 'Shin',
  'Takuya', 'Satoshi', 'Yuki', 'Kouta', 'Shouta', 'Ryohei', 'Keisuke', 'Masato', 'Takahiro', 'Yusuke'
];

const BOT_NAMES_FR = [
  'Thomas', 'Nicolas', 'Julien', 'Benoît', 'Lucas', 'Hugo', 'Arthur', 'Louis', 'Nathan', 'Enzo',
  'Léo', 'Gabriel', 'Jules', 'Adam', 'Raphaël', 'Maël', 'Noah', 'Ethan', 'Paul', 'Mathis',
  'Clément', 'Maxime', 'Alexandre', 'Antoine', 'Quentin', 'Romain', 'Valentin', 'Bastien', 'Théo', 'Axel',
  'Mathieu', 'Florian', 'Damien', 'Alexis', 'Guillaume', 'Sébastien', 'Jérôme', 'Mickaël', 'Fabien', 'Cédric'
];

const BOT_NAMES_DE = [
  'Lukas', 'Maximilian', 'Jakob', 'Leon', 'Finn', 'Jonas', 'Elias', 'Emil', 'Luis', 'Paul',
  'Felix', 'Ben', 'Noah', 'Luca', 'David', 'Henry', 'Liam', 'Theo', 'Matteo', 'Leo',
  'Julian', 'Moritz', 'Niklas', 'Philipp', 'Simon', 'Tim', 'Tom', 'Jan', 'Erik', 'Fabian',
  'Sebastian', 'Christian', 'Alexander', 'Andreas', 'Stefan', 'Markus', 'Patrick', 'Dominik', 'Marcel', 'Tobias'
];

const BOT_NAMES_ES = [
  'Alejandro', 'Daniel', 'Pablo', 'David', 'Adrián', 'Áلvaro', 'Hugo', 'Javier', 'Diego', 'Sergio',
  'Marcos', 'Mario', 'Manuel', 'Lucas', 'Nicolás', 'Jorge', 'Iván', 'Carlos', 'Miguel', 'Antonio',
  'Rubén', 'Víctor', 'Ángel', 'Raúl', 'José', 'Mateo', 'Enzo', 'Leo', 'Bruno', 'Hugo',
  'Fernando', 'Luis', 'Francisco', 'Juan', 'Pedro', 'Rafael', 'Alberto', 'Roberto', 'Ignacio', 'Marcos'
];

const BOT_NAMES_IT = [
  'Leonardo', 'Francesco', 'Alessandro', 'Lorenzo', 'Mattia', 'Andrea', 'Gabriele', 'Riccardo', 'Tommaso', 'Edoardo',
  'Matteo', 'Giuseppe', 'Nicolo', 'Antonio', 'Federico', 'Diego', 'Davide', 'Christian', 'Giovanni', 'Pietro',
  'Filippo', 'Samuele', 'Marco', 'Michele', 'Luca', 'Emanuele', 'Simone', 'Alessio', 'Gioele', 'Elia',
  'Daniele', 'Salvatore', 'Vincenzo', 'Stefano', 'Roberto', 'Paolo', 'Claudio', 'Massimo', 'Giorgio', 'Enrico'
];

const BOT_AVATARS = ['🚀', '🛸', '👾', '🤖', '⭐', '🌙', '🌌', '☄️', '🛰️', '🪐', '👽', '🔭', '🌍', '🌞', '💫'];

const COUNTRY_CONFIG = [
  { flag: '🇸🇦', names: BOT_NAMES_SA, isArabic: true },
  { flag: '🇪🇬', names: BOT_NAMES_EG, isArabic: true },
  { flag: '🇦🇪', names: BOT_NAMES_AE, isArabic: true },
  { flag: '🇰🇼', names: BOT_NAMES_KW, isArabic: true },
  { flag: '🇺🇸', names: BOT_NAMES_US, isArabic: false },
  { flag: '🇬🇧', names: BOT_NAMES_UK, isArabic: false },
  { flag: '🇯🇵', names: BOT_NAMES_JP, isArabic: false },
  { flag: '🇫🇷', names: BOT_NAMES_FR, isArabic: false },
  { flag: '🇩🇪', names: BOT_NAMES_DE, isArabic: false },
  { flag: '🇪🇸', names: BOT_NAMES_ES, isArabic: false },
  { flag: '🇮🇹', names: BOT_NAMES_IT, isArabic: false }
];

/**
 * Validates if a bot's name is appropriate for its country.
 * This is the "Verification Layer" requested by the user.
 */
const validateAndFixBot = (bot: LeaderboardEntry, season: number): LeaderboardEntry => {
  if (bot.isPlayer) return bot;

  const country = COUNTRY_CONFIG.find(c => c.flag === bot.country);
  if (!country) {
    // If country is invalid, pick a new one and a new name
    const newCountry = COUNTRY_CONFIG[Math.floor(Math.random() * COUNTRY_CONFIG.length)];
    return {
      ...bot,
      country: newCountry.flag,
      name: newCountry.names[Math.floor(Math.random() * newCountry.names.length)]
    };
  }

  // Check if the base name (before suffixes/numbers) exists in the country's list
  // We split by space and take the first part, but also handle names that might be multiple words
  const baseName = bot.name.split(' ')[0];
  const isNameValid = country.names.some(n => n === baseName || bot.name.startsWith(n + ' ') || bot.name === n);

  if (!isNameValid) {
    // Fix the name to match the country
    let newName = country.names[Math.floor(Math.random() * country.names.length)];
    
    // Re-apply variation logic to keep it looking like a bot
    const rnd = Math.random();
    if (rnd < 0.15) {
      const suffixes = country.isArabic ? [' المحترف', ' البطل', ' النجم', ' الصقر'] : [' Pro', ' Ace', ' Star', ' King'];
      newName += suffixes[Math.floor(Math.random() * suffixes.length)];
    } else if (rnd < 0.3) {
      newName += ` ${Math.floor(Math.random() * 99)}`;
    } else if (rnd < 0.4) {
      newName += ` S${season}`;
    }

    return { ...bot, name: newName };
  }

  return bot;
};

const generateBots = (lang: Language = 'ar', withStats = true, seed = Date.now(), league: League = 'bronze', season = 1): LeaderboardEntry[] => {
  let currentSeed = seed;
  const rnd = () => {
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  const bots: LeaderboardEntry[] = [];
  const totalBots = 60;
  const config = LEAGUE_CONFIG[league];

  for (let i = 0; i < totalBots; i++) {
    const isElite = i < 5;
    const countryObj = COUNTRY_CONFIG[Math.floor(rnd() * COUNTRY_CONFIG.length)];
    
    let name = countryObj.names[Math.floor(rnd() * countryObj.names.length)];
    const country = countryObj.flag;

    // Add slight variation based on season or randomness
    const variationRoll = rnd();
    if (variationRoll < 0.15) {
      const suffixes = countryObj.isArabic ? [' المحترف', ' البطل', ' النجم', ' الصقر'] : [' Pro', ' Ace', ' Star', ' King'];
      name += suffixes[Math.floor(rnd() * suffixes.length)];
    } else if (variationRoll < 0.3) {
      name += ` ${Math.floor(rnd() * 99)}`;
    } else if (variationRoll < 0.4) {
      name += ` S${season}`;
    }

    const baseSkill = (isElite ? (1.8 + rnd() * 1.8) : (1.0 + rnd() * 1.5)) * config.skillMultiplier;
    const baseScore = (isElite ? 18000 : 2500) * config.scoreMultiplier;
    const randomScore = (isElite ? 25000 : 10000) * config.scoreMultiplier;

    bots.push({
      id: `bot_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 7)}`,
      name,
      score: withStats ? Math.floor(rnd() * randomScore) + baseScore : 0,
      coins: withStats ? Math.floor(rnd() * 5000) + 500 : 0,
      stars: withStats ? Math.floor(rnd() * 1000) + 100 : 0,
      avatar: BOT_AVATARS[Math.floor(rnd() * BOT_AVATARS.length)],
      country,
      lastActive: Date.now() - Math.floor(rnd() * 3600000),
      previousRank: i + 1,
      isPlayer: false,
      baseSkill,
      growthRate: 0.7 + rnd() * 1.8,
      variability: 0.2 + rnd() * 0.4,
      streakChance: 0.08 + rnd() * 0.12,
      slumpChance: 0.04 + rnd() * 0.08,
      comebackChance: 0.1 + rnd() * 0.2,
      rankBias: 0.8 + rnd() * 0.4,
      maxDailyGain: 2000 + rnd() * 3000,
      minDailyGain: 100 + rnd() * 400,
      scoreFloor: 500,
      scoreCeiling: 100000 + rnd() * 50000,
      activityLevel: 0.3 + rnd() * 0.7,
      consistency: 0.4 + rnd() * 0.6,
      volatility: 0.1 + rnd() * 0.5,
      currentStatus: 'normal',
      statusExpiry: 0
    });
  }

  return bots;
};

const updateLeaderboardOffline = (stats: GameStats): GameStats => {
  const now = Date.now();
  const lastUpdate = stats.lastLeaderboardUpdateTimestamp || (now - 60000); // Default to 1 min ago if missing
  const elapsedTime = now - lastUpdate;
  
  const CHUNK_SIZE = 15 * 60 * 1000; // 15 minute chunks
  const chunks = Math.floor(elapsedTime / CHUNK_SIZE);
  
  // If not enough time has passed for a full chunk, return stats as is
  if (chunks === 0) return stats;
  
  // Diminishing returns for very long periods (e.g., more than 3 days)
  let effectiveElapsedTime = elapsedTime;
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  if (effectiveElapsedTime > threeDays) {
    effectiveElapsedTime = threeDays + (effectiveElapsedTime - threeDays) * 0.1;
  }

  const effectiveChunks = Math.min(Math.floor(effectiveElapsedTime / CHUNK_SIZE), 300); // Max 300 chunks
  
  let currentLeaderboard = [...stats.leaderboard];
  let currentSeed = stats.leaderboardSeed || Math.floor(Date.now() / 1000);
  const leagueConfig = LEAGUE_CONFIG[stats.currentLeague || 'bronze'];

  for (let c = 0; c < effectiveChunks; c++) {
    const chunkSeed = currentSeed + c;
    const rnd = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    // Sort to apply rank bias
    const sorted = [...currentLeaderboard].sort((a, b) => b.score - a.score);

    currentLeaderboard = currentLeaderboard.map(bot => {
      if (bot.isPlayer) return bot;

      const botRank = sorted.findIndex(e => e.id === bot.id) + 1;
      
      // Rank Bias: Refined to prevent extreme clustering and allow bottom bots to move
      let rankEffect = 1.0;
      if (botRank <= 5) rankEffect = 0.7; // Top bots (maintain lead but don't explode)
      else if (botRank > 5 && botRank <= 20) rankEffect = 1.4; // Contenders (very aggressive)
      else if (botRank > 20 && botRank <= 45) rankEffect = 1.1; // Middle pack
      else rankEffect = 0.75; // Bottom bots (now have a higher floor to prevent 1-300 clustering)

      // Status management (streak/slump)
      let status = bot.currentStatus || 'normal';
      let expiry = bot.statusExpiry || 0;
      
      if (now > expiry) {
        const statusRoll = rnd(chunkSeed + bot.name.length);
        // Increased chances for more dynamic movement
        if (statusRoll < (bot.streakChance || 0.12)) {
          status = 'streak';
          expiry = now + (2 + rnd(chunkSeed) * 6) * 3600000; // 2-8 hours
        } else if (statusRoll < (bot.streakChance || 0.12) + (bot.slumpChance || 0.08)) {
          status = 'slump';
          expiry = now + (4 + rnd(chunkSeed) * 10) * 3600000; // 4-14 hours
        } else {
          status = 'normal';
        }
      }

      const statusMultiplier = status === 'streak' ? 2.5 : (status === 'slump' ? 0.15 : 1.0);
      
      // Base growth with added volatility
      const baseGrowth = (bot.growthRate || 1) * (bot.baseSkill || 1) * rankEffect * statusMultiplier;
      const variability = 1 + (rnd(chunkSeed + botRank) - 0.5) * (bot.variability || 0.3);
      
      // Activity check: Top bots are more active
      const activityThreshold = (bot.activityLevel || 0.5) * (botRank <= 10 ? 1.5 : 1.0);
      const isActive = rnd(chunkSeed * (botRank + 1)) < Math.min(activityThreshold, 0.95);
      if (!isActive) return bot;

      // Volatility Jump: Rare chance for a "big session"
      const jumpRoll = rnd(chunkSeed * 2 + botRank);
      const jumpMultiplier = jumpRoll < (bot.volatility || 0.05) ? (2 + rnd(chunkSeed) * 3) : 1;

      const scoreGain = Math.floor(baseGrowth * variability * jumpMultiplier * leagueConfig.scoreGainFactor);
      
      let newScore = bot.score + scoreGain;
      
      // Ceiling check
      if (newScore > (bot.scoreCeiling || 1000000)) {
        newScore = bot.score + Math.floor(scoreGain * 0.05); // Very slow near ceiling
      }
      
      // Floor check
      if (newScore < (bot.scoreFloor || 0)) newScore = bot.scoreFloor || 0;

      return {
        ...bot,
        score: newScore,
        currentStatus: status,
        statusExpiry: expiry,
        lastActive: now - rnd(chunkSeed) * CHUNK_SIZE
      };
    });
  }

  // Final sort and rank update
  const finalSorted = [...currentLeaderboard].sort((a, b) => b.score - a.score);
  const seen = new Set();
  const updatedLeaderboard = currentLeaderboard.filter(b => b !== null).map((bot, idx) => {
    let id = bot.id;
    if (!id || seen.has(id)) {
      id = bot.isPlayer ? 'player' : `bot_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
      while (seen.has(id)) {
        id = bot.isPlayer ? 'player' : `bot_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 3)}`;
      }
    }
    seen.add(id);
    
    const rank = finalSorted.findIndex(e => e.id === bot.id) + 1;
    // Sanity check validation during update to ensure identity integrity
    const validatedBot = validateAndFixBot(bot, stats.season || 1);
    return {
      ...validatedBot,
      id,
      previousRank: bot.previousRank || rank
    };
  });

  return {
    ...stats,
    leaderboard: updatedLeaderboard,
    lastLeaderboardUpdateTimestamp: lastUpdate + (chunks * CHUNK_SIZE), // Only advance by full chunks processed
    leaderboardSeed: currentSeed + chunks
  };
};

const WEEKLY_TASK_POOL: Omit<WeeklyTask, 'currentValue' | 'isCompleted'>[] = [
  { id: 'weekly_score_5000', title: 'بطل الأسبوع', description: 'اجمع 5000 نقطة إجمالية في أسبوع واحد', icon: '🏆', targetValue: 5000, reward: 400, type: 'score' },
  { id: 'weekly_stars_200', title: 'صائد النجوم المحترف', description: 'اجمع 200 نجمة إجمالية', icon: '⭐', targetValue: 200, reward: 300, type: 'stars' },
  { id: 'weekly_games_20', title: 'طيار لا يتعب', description: 'العب 20 جولة (بشرط الوصول لـ 500 نقطة)', icon: '🚀', targetValue: 20, reward: 250, type: 'games' },
  { id: 'weekly_spaceship_hits_40', title: 'مُعذّب المركبات الفضائية', description: 'اضرب المركبة الفضائية بالكويكبات الحمر 40 مرة', icon: '🎯', targetValue: 40, reward: 500, type: 'spaceship_hits' },
  { id: 'weekly_time_600', title: 'سيد التحليق', description: 'حلق لمدة 10 دقائق (600 ثانية) إجمالية', icon: '⏱️', targetValue: 600, reward: 350, type: 'time' },
  { id: 'weekly_score_10000', title: 'الأسطورة الأسبوعية', description: 'اجمع 10000 نقطة إجمالية', icon: '👑', targetValue: 10000, reward: 800, type: 'score' },
  { id: 'weekly_stars_500', title: 'جامع المجرات', description: 'اجمع 500 نجمة إجمالية', icon: '🌌', targetValue: 500, reward: 600, type: 'stars' },
];

const INITIAL_WEEKLY_TASKS: WeeklyTask[] = WEEKLY_TASK_POOL.slice(0, 5).map(t => ({ ...t, currentValue: 0, isCompleted: false }));

const TASK_POOL: Omit<DailyTask, 'currentValue' | 'isCompleted'>[] = [
  { id: 'task_score_1500', title: 'جامع النقاط', description: 'اجمع 1500 نقطة إجمالية', targetValue: 1500, reward: 50, type: 'score' },
  { id: 'task_stars_30', title: 'صياد النجوم', description: 'اجمع 30 نجمة إجمالية', targetValue: 30, reward: 30, type: 'stars' },
  { id: 'task_games_3', title: 'الطيار النشط', description: 'العب 3 جولات (بشرط الوصول لـ 500 نقطة)', targetValue: 3, reward: 40, type: 'games' },
  { id: 'task_time_120', title: 'المحلق الصبور', description: 'حلق لمدة 120 ثانية إجمالية', targetValue: 120, reward: 40, type: 'time' },
  { id: 'task_difficulty_1_5', title: 'تحدي السرعة', description: 'وصل لمستوى صعوبة 1.5 في أي جولة', targetValue: 1.5, reward: 50, type: 'difficulty' },
  { id: 'task_score_500', title: 'المحترف اليومي', description: 'اجمع 500 نقطة إجمالية', targetValue: 500, reward: 25, type: 'score' },
  { id: 'task_stars_15', title: 'مبتدئ النجوم', description: 'اجمع 15 نجمة إجمالية', targetValue: 15, reward: 20, type: 'stars' },
  { id: 'task_games_5', title: 'إدمان اللعب', description: 'العب 5 جولات (بشرط الوصول لـ 500 نقطة)', targetValue: 5, reward: 60, type: 'games' },
];

const STORE_ITEMS: Powerup[] = [
  { id: 'shield', name: 'الدرع الواقي', description: 'يحميك من اصطدام واحد بالسحب', cost: 100, duration: 0, type: 'shield', icon: '🛡️' },
  { id: 'double_points', name: 'النقاط المضاعفة', description: 'تحصل على ضعف النقاط طوال الجولة', cost: 150, duration: 0, type: 'doublePoints', icon: '💎' },
  { id: 'slow_motion', name: 'الحركة البطيئة', description: 'يبطئ حركة السحب طوال الجولة', cost: 200, duration: 0, type: 'slowMotion', icon: '❄️' },
  { id: 'magnet', name: 'مغناطيس النجوم', description: 'يجذب النجوم القريبة إليك طوال الجولة', cost: 180, duration: 0, type: 'magnet', icon: '🧲' },
  { id: 'fire_asteroid', name: 'كويكبات نارية', description: 'تضرب المركبة الفضائية وتمنعها من الرمي', cost: 30, duration: 0, type: 'fireAsteroid', icon: '🔴' },
];

// Memoized Screen Components for better performance
const MenuScreen = React.memo(({ t, isEid, stats, startGame, setIsLeaderboardOpen, setGameState, playClickSound, setIsAIModalOpen, setIsForgeOpen, setIsEconomyHubOpen }: any) => (
  <motion.div
    key="menu"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`flex flex-col items-center gap-8 p-8 ${isEid ? 'bg-slate-900/40 border-amber-500/30' : 'bg-slate-900/50 border-white/10'} backdrop-blur-xl rounded-3xl border shadow-2xl max-w-md w-full mx-4 will-change-transform`}
  >
    <div className="flex flex-col items-center gap-2 relative w-full">
      <motion.div
        animate={stats.animationsEnabled ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 4 }}
        className={`p-4 ${isEid ? 'bg-amber-500' : 'bg-indigo-500'} rounded-2xl shadow-lg ${isEid ? 'shadow-amber-500/20' : 'shadow-indigo-500/20'}`}
      >
        {isEid ? (
          <Moon className="w-12 h-12 text-white fill-white" />
        ) : (
          <Star className="w-12 h-12 text-white fill-white" />
        )}
      </motion.div>
      <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mt-4 text-center">
        {t.gameTitle}
      </h1>
      {isEid && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center mt-2"
        >
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg animate-pulse">
            <Moon className="w-5 h-5 fill-current" />
            <span>{t.eidMubarak}</span>
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
        </motion.div>
      )}
      <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">{t.skyDashAdventure}</p>
    </div>

    <div className="flex flex-col gap-4 w-full">
      <button
        onClick={() => { playClickSound(); startGame(); }}
        className={`group relative flex items-center justify-center gap-3 w-full py-4 ${isEid ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-950'} font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10`}
      >
        <Play className={`w-6 h-6 fill-current ${stats.language === 'ar' ? 'rotate-180' : ''}`} />
        <span className="text-xl">{t.play}</span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { playClickSound(); setGameState('WEEKLY_TASKS'); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <Trophy className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-semibold">{t.weeklyTasks}</span>
        </button>
        <button
          onClick={() => { playClickSound(); setGameState('DAILY_TASKS'); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <ListTodo className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{t.dailyTasks}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { playClickSound(); setIsLeaderboardOpen(true); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold">{t.leaderboard}</span>
        </button>
        <button
          onClick={() => { playClickSound(); setGameState('STORE'); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <ShoppingBag className="w-5 h-5 text-pink-400" />
          <span className="text-xs font-semibold">{t.store}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { playClickSound(); setIsForgeOpen(true); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <Factory className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-semibold">{stats.language === 'ar' ? 'مصنع النجوم' : 'Star Forge'}</span>
        </button>
        <button
          onClick={() => { playClickSound(); setIsEconomyHubOpen(true); }}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <Building2 className="w-5 h-5 text-yellow-400" />
          <span className="text-xs font-semibold">{stats.language === 'ar' ? 'مركز الاقتصاد' : 'Economy Hub'}</span>
        </button>
      </div>

      <button
        onClick={() => { playClickSound(); setIsAIModalOpen(true); }}
        className="flex items-center justify-center gap-3 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm">{t.aiAssistant}</span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { playClickSound(); setGameState('SETTINGS'); }}
          className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-white/5"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span className="text-xs font-semibold">{t.settings}</span>
        </button>
        <div className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 rounded-2xl border border-white/5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold">{stats.highScore}</span>
        </div>
      </div>

      <button
        onClick={() => { playClickSound(); setGameState('EVENTS'); }}
        className={`flex items-center justify-center gap-2 py-3 ${isEid ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-white/5 text-indigo-400'} hover:bg-slate-700 rounded-2xl transition-colors border w-full`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider">{t.events}</span>
        {isEid && <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
      </button>
    </div>

    <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
      {t.versionInfo}
    </div>
  </motion.div>
));

const GameOverScreen = React.memo(({ t, score, stats, startGame, goToMenu, playClickSound }: any) => (
  <motion.div
    key="gameover"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="flex flex-col items-center gap-8 p-10 bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl max-w-sm w-full mx-4 text-center will-change-transform"
  >
    <div className="flex flex-col gap-2">
      <h2 className="text-4xl font-black text-red-500 tracking-tight">{t.gameOver}</h2>
      <p className="text-slate-400 font-medium">{t.greatJob}</p>
    </div>

    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-3xl border border-white/5">
          <div className="text-xs text-slate-500 uppercase font-bold mb-1">{t.score}</div>
          <div className="text-3xl font-black text-white">{score}</div>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-3xl border border-white/5">
          <div className="text-xs text-slate-500 uppercase font-bold mb-1">{t.highScore}</div>
          <div className="text-3xl font-black text-amber-400">{stats.highScore}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => { playClickSound(); startGame(); }}
          className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{t.tryAgain}</span>
        </button>
        <button
          onClick={() => { playClickSound(); goToMenu(); }}
          className="flex items-center justify-center gap-3 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
        >
          <Home className="w-5 h-5" />
          <span>{t.home}</span>
        </button>
      </div>
    </div>
  </motion.div>
));

const StoreScreen = React.memo(({ t, stats, isEid, buyPowerup, goToMenu, playClickSound }: any) => (
  <motion.div
    key="store"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden will-change-transform"
  >
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-pink-400" />
        <h2 className="text-3xl font-black">{t.store}</h2>
      </div>
      <div className="flex items-center gap-2 px-4 py-1 bg-slate-800 rounded-full border border-white/5">
        <Coins className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-bold text-yellow-400">{stats.coins} {t.coins}</span>
      </div>
    </div>

    <div className="w-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
      {STORE_ITEMS.map((item) => {
        const isFree = isEid && item.type === 'shield';
        const isAsteroid = item.type === 'fireAsteroid';
        const now = Date.now();
        const isActive = !isAsteroid && stats.activePowerups.some((p: any) => p.type === item.type && (p.expiresAt === 0 || p.expiresAt > now));
        const isMaxAsteroids = isAsteroid && stats.fireAsteroids >= 25;
        const canAfford = stats.coins >= item.cost;
        const itemName = t.powerupNames[item.id as keyof typeof t.powerupNames] || item.name;
        const itemDesc = t.powerupDescs[item.id as keyof typeof t.powerupDescs] || item.description;

        return (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all bg-slate-800/50 border-white/5 ${isActive ? 'ring-2 ring-pink-500/50' : ''} ${isFree ? 'border-amber-500/30 bg-amber-500/5' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`text-3xl p-3 rounded-2xl ${isFree ? 'bg-amber-500/20' : 'bg-slate-700'}`}>{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${isFree ? 'text-amber-400' : 'text-white'}`}>{itemName}</h3>
                  {isActive && <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">{t.active}</span>}
                  {isAsteroid && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">{stats.fireAsteroids} / 25</span>}
                  {isFree && !isActive && <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase font-bold">{t.eventFree}</span>}
                </div>
                <p className="text-xs text-slate-500 mt-1">{itemDesc}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    <span className={`text-xs font-bold ${isFree ? 'text-slate-500 line-through' : 'text-yellow-400'}`}>{item.cost}</span>
                  </div>
                  <button
                    disabled={isActive || isFree || !canAfford || isMaxAsteroids}
                    onClick={() => buyPowerup(item)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : isFree
                          ? 'bg-amber-500/20 text-amber-500 cursor-not-allowed border border-amber-500/30'
                          : isMaxAsteroids
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : canAfford 
                              ? 'bg-pink-500 hover:bg-pink-400 text-white active:scale-95' 
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isActive ? t.purchased : isFree ? t.eventFree : isMaxAsteroids ? t.completed : canAfford ? t.buy : t.insufficientCoins}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <button
      onClick={goToMenu}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.back}
    </button>
  </motion.div>
));

const SettingsScreen = React.memo(({ t, stats, isMuted, setIsMuted, setLanguage, toggleAnimations, setGraphicsQuality, setGameState, playClickSound }: any) => (
  <motion.div
    key="settings"
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    className="flex flex-col items-center gap-8 p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md w-full mx-4 will-change-transform"
  >
    <h2 className="text-3xl font-bold">{t.settings}</h2>
    
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2 p-4 bg-slate-800 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-pink-400 w-5 h-5" />
          <span className="font-semibold">{t.graphicsQuality}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(['very-low', 'low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
            <button
              key={q}
              onClick={() => setGraphicsQuality(q)}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                stats.graphicsQuality === q
                  ? 'bg-pink-500 border-pink-400 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-slate-700 border-white/5 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {(t as any)[q] || (q === 'very-low' ? t.veryLow : q)}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-slate-500 mt-1 text-center italic">
          {stats.graphicsQuality === 'very-low' && t.veryLowDesc}
          {stats.graphicsQuality === 'low' && t.lowDesc}
          {stats.graphicsQuality === 'medium' && t.mediumDesc}
          {stats.graphicsQuality === 'high' && t.highDesc}
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          {isMuted ? <VolumeX className="text-red-400" /> : <Volume2 className="text-indigo-400" />}
          <span className="font-semibold">{t.sound}</span>
        </div>
        <button
          onClick={() => { playClickSound(); setIsMuted(!isMuted); }}
          className={`w-12 h-6 rounded-full transition-colors relative ${isMuted ? 'bg-slate-600' : 'bg-indigo-500'}`}
        >
          <motion.div
            animate={{ x: isMuted ? 2 : 26 }}
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          {stats.animationsEnabled ? <Zap className="text-amber-400" /> : <ZapOff className="text-slate-400" />}
          <div className="flex flex-col">
            <span className="font-semibold">{t.animations}</span>
            <span className="text-[10px] text-slate-500">{t.powerSaving}</span>
          </div>
        </div>
        <button
          onClick={toggleAnimations}
          className={`w-12 h-6 rounded-full transition-colors relative ${!stats.animationsEnabled ? 'bg-slate-600' : 'bg-amber-500'}`}
        >
          <motion.div
            animate={{ x: !stats.animationsEnabled ? 2 : 26 }}
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
          />
        </button>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-slate-800 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Star className="text-indigo-400 w-5 h-5" />
          <span className="font-semibold">{t.language}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['ar', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                stats.language === l
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-700 border-white/5 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {l === 'ar' ? t.arabic : t.english}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => { playClickSound(); setGameState('INSTRUCTIONS'); }}
        className="flex items-center justify-center gap-3 p-4 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-2xl transition-all group"
      >
        <ListTodo className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-indigo-100">{t.instructionsBtn}</span>
      </button>
    </div>

    <button
      onClick={() => { playClickSound(); setGameState('MENU'); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
    >
      {t.back}
    </button>
  </motion.div>
));

const WeeklyTasksScreen = React.memo(({ t, stats, weeklyTasks, goToMenu, playClickSound, timeUntilWeeklyReset }: any) => (
  <motion.div
    key="weekly_tasks"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden will-change-transform"
  >
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-indigo-400" />
        <h2 className="text-3xl font-black">{t.weeklyTasks}</h2>
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-xs">
        <Clock className="w-3 h-3" />
        <span>{t.endsIn}: {timeUntilWeeklyReset}</span>
      </div>
    </div>

    <div className="w-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
      {weeklyTasks.map((task: any) => {
        const taskTitle = t.weeklyTasksTitles[task.id as keyof typeof t.weeklyTasksTitles] || task.title;
        const taskDesc = t.weeklyTasksDescs[task.id as keyof typeof t.weeklyTasksDescs] || task.description;

        return (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition-all ${
              task.isCompleted 
                ? 'bg-indigo-500/10 border-indigo-500/30' 
                : 'bg-slate-800/50 border-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{task.isCompleted ? '✅' : task.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${task.isCompleted ? 'text-white' : 'text-slate-300'}`}>{taskTitle}</h3>
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-bold text-yellow-400">+{task.reward}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{taskDesc}</p>
                
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>{t.progress}</span>
                    <span>{Math.floor(task.currentValue)} / {task.targetValue}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (task.currentValue / task.targetValue) * 100)}%` }}
                      className={`h-full ${task.isCompleted ? 'bg-indigo-500' : 'bg-slate-500'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <button
      onClick={() => { playClickSound(); goToMenu(); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.back}
    </button>
  </motion.div>
));

const DailyTasksScreen = React.memo(({ t, stats, goToMenu, playClickSound, timeUntilReset, allDailyTasksCompleted, claimDailyChest }: any) => (
  <motion.div
    key="daily_tasks"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden will-change-transform"
  >
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <ListTodo className="w-8 h-8 text-emerald-400" />
        <h2 className="text-3xl font-black">{t.dailyTasks}</h2>
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-xs">
        <Clock className="w-3 h-3" />
        <span>{t.renewsIn}: {timeUntilReset}</span>
      </div>
    </div>

    <div className="w-full overflow-y-auto pr-2 space-y-3 custom-scrollbar">
      {allDailyTasksCompleted && !stats.dailyChestClaimed && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/50 flex flex-col items-center gap-4 text-center mb-4 shadow-lg shadow-amber-500/10"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, -5, 5, 0],
                scale: [1, 1.05, 1, 1.05, 1]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-4 bg-amber-500 rounded-full shadow-xl shadow-amber-500/40"
            >
              <Gift className="w-10 h-10 text-slate-950" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>
          
          <div>
            <h3 className="text-xl font-black text-amber-400">{t.dailyChest}</h3>
            <p className="text-xs text-slate-300 font-medium">{t.allTasksDone}</p>
          </div>
          
          <button
            onClick={claimDailyChest}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            {t.openChest}
          </button>
        </motion.div>
      )}

      {stats.dailyTasks.map((task: any) => {
        const taskTitle = t.dailyTasksTitles[task.id as keyof typeof t.dailyTasksTitles] || task.title;
        const taskDesc = t.dailyTasksDescs[task.id as keyof typeof t.dailyTasksDescs] || task.description;

        return (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition-all ${
              task.isCompleted 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-slate-800/50 border-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${task.isCompleted ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                {task.isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Star className="w-6 h-6 text-slate-400" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${task.isCompleted ? 'text-white' : 'text-slate-300'}`}>{taskTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{taskDesc}</p>
                
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>{task.isCompleted ? t.completed : t.progress}</span>
                    <span>{Math.floor(task.currentValue)} / {task.targetValue}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (task.currentValue / task.targetValue) * 100)}%` }}
                      className={`h-full ${task.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <button
      onClick={() => { playClickSound(); goToMenu(); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.back}
    </button>
  </motion.div>
));

const EventsScreen = React.memo(({ t, isEid, eidCountdown, goToMenu, playClickSound }: any) => (
  <motion.div
    key="events"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden will-change-transform"
  >
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-amber-400" />
        <h2 className="text-3xl font-black tracking-tight">{t.events}</h2>
      </div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{t.activeEvents}</p>
    </div>

    <div className="w-full space-y-4 overflow-y-auto pr-2 custom-scrollbar">
      {isEid ? (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Moon className="w-16 h-16 text-amber-400 fill-current" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-tighter">
                {t.activeEvents}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                <Clock className="w-3 h-3" />
                <span>{t.eventEndsIn} {eidCountdown}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-amber-400 mb-1">{t.eidEventTitle}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{t.eidEventDesc}</p>
            
            <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-2xl border border-white/5">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{t.freeShield}</span>
                <span className="text-[10px] text-slate-500">{t.eidEventDesc}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-4">
          <Calendar className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">{t.noActiveEvents}</p>
        </div>
      )}
    </div>

    <button
      onClick={() => { playClickSound(); goToMenu(); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.back}
    </button>
  </motion.div>
));

const InstructionsScreen = React.memo(({ t, stats, setGameState, playClickSound }: any) => (
  <motion.div
    key="instructions"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center gap-6 p-6 bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 max-h-[85vh] overflow-hidden will-change-transform"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-indigo-500 rounded-xl">
        <ListTodo className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-3xl font-black">{t.instructionsTitle}</h2>
    </div>

    <div className="w-full overflow-y-auto pr-2 space-y-6 custom-scrollbar text-right" dir={stats.language === 'ar' ? 'rtl' : 'ltr'}>
      <section>
        <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          {t.howToPlay}
        </h3>
        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside pr-2">
          <li>{t.controlsPC}</li>
          <li>{t.controlsMobile}</li>
          <li>{t.collectStars}</li>
          <li>{t.avoidObstacles}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          {t.weaponsTitle}
        </h3>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
          <div className="font-bold text-white text-sm">{t.fireAsteroidsTitle}</div>
          <p className="text-xs text-slate-400">{t.fireAsteroidsDesc}</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-pink-400 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {t.powerupsTitle}
        </h3>
        <ul className="space-y-2 text-sm text-slate-300 list-none pr-2">
          <li>{t.shieldDesc}</li>
          <li>{t.magnetDesc}</li>
          <li>{t.slowMoDesc}</li>
          <li>{t.doublePointsDesc}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {t.enemiesTitle}
        </h3>
        <div className="space-y-3">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <div className="font-bold text-white text-sm">{t.clouds}</div>
            <p className="text-xs text-slate-400">{t.cloudsDesc}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <div className="font-bold text-emerald-400 text-sm">{t.spaceships}</div>
            <p className="text-xs text-slate-400">{t.spaceshipsDesc}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <div className="font-bold text-pink-400 text-sm">{t.drones}</div>
            <p className="text-xs text-slate-400">{t.dronesDesc}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
          <Rocket className="w-4 h-4" />
          {t.proTips}
        </h3>
        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside pr-2">
          <li>{t.storeTip}</li>
          <li>{t.dailyTasksTip}</li>
          <li>{t.difficultyTip}</li>
          <li>{t.trackingTip}</li>
        </ul>
      </section>
    </div>

    <button
      onClick={() => { playClickSound(); setGameState('SETTINGS'); }}
      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all mt-2"
    >
      {t.backToSettings}
    </button>
  </motion.div>
));

const RewardModal = React.memo(({ t, rewardModal, playClickSound, setRewardModal }: any) => (
  <motion.div
    key="reward_modal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 max-w-xs w-full text-center shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50" />
      
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"
        />
        <div className="relative p-6 bg-slate-800 rounded-3xl border border-white/10 shadow-xl">
          {rewardModal.icon}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-black text-white mb-2">{t.chestReward}</h3>
        <p className="text-amber-400 font-bold text-xl">{rewardModal.label}</p>
      </div>

      <button
        onClick={() => { playClickSound(); setRewardModal(null); }}
        className="relative z-10 w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
      >
        {t.claim}
      </button>
    </motion.div>
  </motion.div>
));

const ReviveModal = React.memo(({ t, handleRevive, cancelRevive }: any) => (
  <motion.div
    key="revive-modal"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
  >
    <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl">
      <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
        <RotateCcw className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-black mb-1">{t.reviveTitle}</h2>
      <p className="text-amber-400 text-xs font-bold mb-3 uppercase tracking-wider">
        {t.reviveOneTime}
      </p>
      <p className="text-slate-400 mb-8 leading-relaxed">
        {t.reviveDesc}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleRevive}
          className="flex flex-col items-center gap-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <span>{t.yes}</span>
          <div className="flex items-center gap-1 text-xs opacity-80">
            <Coins className="w-3 h-3" />
            <span>100</span>
          </div>
        </button>
        <button
          onClick={cancelRevive}
          className="py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 border border-white/5"
        >
          {t.no}
        </button>
      </div>
    </div>
  </motion.div>
));


// Simple Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Uncaught Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-slate-400 mb-8 max-w-md">Something went wrong. Please refresh the page to continue.</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold">Refresh App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [rewardModal, setRewardModal] = useState<{ type: string, value: any, icon: any, label: string } | null>(null);
  const [reviveModal, setReviveModal] = useState<{ score: number, stats: any } | null>(null);
  const [hasRevived, setHasRevived] = useState(false);
  const [shouldShowConfetti, setShouldShowConfetti] = useState(false);
  
  const generateDailyTasks = useCallback((): DailyTask[] => {
    const shuffled = [...TASK_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map(task => ({
      ...task,
      currentValue: 0,
      isCompleted: false
    }));
  }, []);

  const generateWeeklyTasks = useCallback((): WeeklyTask[] => {
    const shuffled = [...WEEKLY_TASK_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map(task => ({
      ...task,
      currentValue: 0,
      isCompleted: false
    }));
  }, []);

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('sky-dash-stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = Date.now();
      const lastReset = parsed.lastResetTimestamp || 0;
      const lastWeeklyReset = parsed.lastWeeklyResetTimestamp || 0;
      
      // Merge logic to ensure new prices/rewards from constants are always used
      const mergedDailyTasks = (parsed.dailyTasks || []).map((saved: any) => {
        const poolTask = TASK_POOL.find(t => t.id === saved.id);
        return poolTask ? { ...poolTask, currentValue: saved.currentValue, isCompleted: saved.isCompleted } : saved;
      });

      const mergedWeeklyTasks = (parsed.weeklyTasks || INITIAL_WEEKLY_TASKS).map((saved: any) => {
        const poolTask = WEEKLY_TASK_POOL.find(t => t.id === saved.id);
        return poolTask ? { ...poolTask, currentValue: saved.currentValue, isCompleted: saved.isCompleted } : saved;
      });

      // Ensure all fields exist
      const defaultStats: GameStats = {
        totalStars: parsed.totalStars || 0,
        totalGames: parsed.totalGames || 0,
        highScore: parsed.highScore || 0,
        maxDifficulty: parsed.maxDifficulty || 1,
        completedWeeklyTasks: parsed.completedWeeklyTasks || [],
        weeklyTasks: mergedWeeklyTasks,
        dailyTasks: mergedDailyTasks,
        lastResetTimestamp: parsed.lastResetTimestamp || now,
        lastWeeklyResetTimestamp: parsed.lastWeeklyResetTimestamp || now,
        animationsEnabled: parsed.animationsEnabled !== undefined ? parsed.animationsEnabled : true,
        graphicsQuality: parsed.graphicsQuality || 'high',
        coins: parsed.coins || 0,
        activePowerups: parsed.activePowerups || [],
        language: parsed.language || 'ar',
        dailyChestClaimed: parsed.dailyChestClaimed || false,
        fireAsteroids: parsed.fireAsteroids || 0,
        chatSessions: parsed.chatSessions || [],
        activeChatId: parsed.activeChatId || null,
        lastLeaderboardResetTimestamp: parsed.lastLeaderboardResetTimestamp || now,
        lastLeaderboardUpdateTimestamp: parsed.lastLeaderboardUpdateTimestamp || now,
        leaderboardSeed: parsed.leaderboardSeed || Math.floor(Math.random() * 1000000),
        currentLeague: parsed.currentLeague || 'bronze',
        season: parsed.season || 1,
        skyPass: parsed.skyPass ? {
          ...parsed.skyPass,
          tiers: SKY_PASS_TIERS.map(initial => {
            const saved = (parsed.skyPass.tiers || []).find((t: any) => t.level === initial.level);
            return saved ? { ...initial, isClaimed: saved.isClaimed, isProClaimed: saved.isProClaimed } : initial;
          })
        } : {
          level: 1,
          exp: 0,
          isPro: false,
          tiers: SKY_PASS_TIERS,
          lastResetTimestamp: now
        },
        inbox: parsed.inbox || [],
        forgeStats: {
          stardust: parsed.forgeStats?.stardust || 0,
          modules: parsed.forgeStats?.modules || { engine: 0, magnet: 0, shield: 0, arsenal: 0, sensor: 0 },
          expeditions: parsed.forgeStats?.expeditions || [],
          artifacts: INITIAL_ARTIFACTS.map(initial => {
            const saved = (parsed.forgeStats?.artifacts || []).find((a: any) => a.id === initial.id);
            // Always use price/buff from constants, only progress from save
            return saved ? { ...initial, isRestored: saved.isRestored } : initial;
          }),
          skins: INITIAL_SKINS.map(initial => {
            const saved = (parsed.forgeStats?.skins || []).find((s: any) => s.id === initial.id);
            // Always use cost/ability from constants, only progress from save
            return saved ? { ...initial, isUnlocked: saved.isUnlocked } : initial;
          }),
          activeSkinId: parsed.forgeStats?.activeSkinId || 'default_ship',
          syndicate: parsed.forgeStats?.syndicate || {
            weeklyDonation: 0,
            totalDonation: 0,
            currentRank: 0,
            lastDonationTimestamp: Date.now()
          },
          contracts: INITIAL_CONTRACTS.map(initial => {
            const saved = (parsed.forgeStats?.contracts || []).find((c: any) => c.id === initial.id);
            // Always use cost/reward/target from constants, only progress from save
            return saved ? { 
              ...initial, 
              isPurchased: saved.isPurchased, 
              isCompleted: saved.isCompleted, 
              isClaimed: saved.isClaimed, 
              currentValue: saved.currentValue 
            } : initial;
          })
        },
        leaderboard: parsed.leaderboard && parsed.leaderboard.length > 0 ? parsed.leaderboard : [
          { 
            id: 'player', 
            name: 'Mustafa', 
            score: parsed.highScore || 0, 
            coins: parsed.coins || 0, 
            stars: parsed.totalStars || 0, 
            isPlayer: true, 
            avatar: '👨‍🚀',
            country: '🇸🇦',
            lastActive: Date.now()
          },
          ...generateBots(parsed.language || 'ar', false, parsed.leaderboardSeed || Date.now(), parsed.currentLeague || 'bronze', parsed.season || 1)
        ]
      };

      const updatedStats = { 
        ...defaultStats
      };

      // Migration & Validation: Ensure all bots match their nationalities
      // This handles stale data, old config errors, and ensures perfect matching
      const currentSeason = parsed.season || 1;
      const validatedLeaderboard = (parsed.leaderboard || []).map((bot: LeaderboardEntry) => 
        validateAndFixBot(bot, currentSeason)
      );

      // If the leaderboard is empty or mostly invalid, regenerate it
      if (validatedLeaderboard.length < 10) {
        updatedStats.leaderboard = [
          updatedStats.leaderboard.find(e => e.isPlayer) || defaultStats.leaderboard[0],
          ...generateBots(updatedStats.language, false, updatedStats.leaderboardSeed, updatedStats.currentLeague, currentSeason)
        ];
      } else {
        updatedStats.leaderboard = validatedLeaderboard;
      }
      
      updatedStats.season = currentSeason;

      // Migration: Ensure player has lastActive, country, and name
      updatedStats.leaderboard = updatedStats.leaderboard.map(entry => {
        if (entry.isPlayer) {
          return {
            ...entry,
            name: entry.name === 'You' ? 'Mustafa' : entry.name,
            lastActive: entry.lastActive || now,
            country: entry.country || '🇸🇦'
          };
        }
        return entry;
      });

      // Migration: Force remove unwanted tasks if they exist in loaded state
      if (updatedStats.weeklyTasks.some(t => t.id === 'weekly_difficulty_3' || t.id === 'weekly_stars_1000')) {
        updatedStats.weeklyTasks = updatedStats.weeklyTasks.filter(t => t.id !== 'weekly_difficulty_3' && t.id !== 'weekly_stars_1000');
        // If we removed it, we should probably add a new one to keep the count at 5
        if (updatedStats.weeklyTasks.length < 5) {
          const available = WEEKLY_TASK_POOL.filter(t => !updatedStats.weeklyTasks.some(wt => wt.id === t.id));
          if (available.length > 0) {
            updatedStats.weeklyTasks.push({ ...available[0], currentValue: 0, isCompleted: false });
          }
        }
      }

      if (now - lastReset > 12 * 60 * 60 * 1000 || !parsed.dailyTasks || parsed.dailyTasks.length === 0) {
        updatedStats.dailyTasks = generateDailyTasks();
        updatedStats.lastResetTimestamp = now;
        updatedStats.dailyChestClaimed = false;
      }

      if (now - lastWeeklyReset > 7 * 24 * 60 * 60 * 1000 || !parsed.weeklyTasks || parsed.weeklyTasks.length === 0) {
        updatedStats.weeklyTasks = generateWeeklyTasks();
        updatedStats.lastWeeklyResetTimestamp = now;
        updatedStats.completedWeeklyTasks = [];
      }

      // Migration: Ensure welcome message exists for all users
      if (!updatedStats.inbox || updatedStats.inbox.length === 0) {
        updatedStats.inbox = [
          {
            id: 'welcome_msg',
            type: 'coins',
            amount: 500,
            title: updatedStats.language === 'ar' ? 'مرحباً بك في قفزة السماء!' : 'Welcome to Sky Dash!',
            description: updatedStats.language === 'ar' ? 'استلم هديتك الترحيبية وابدأ المغامرة!' : 'Claim your welcome gift and start the adventure!',
            timestamp: Date.now(),
            isClaimed: false,
            source: 'chest'
          }
        ];
      }

      // Migration: Ensure unique IDs for all collections to prevent React key errors
      const deduplicate = (arr: any[], prefix: string) => {
        const seen = new Set();
        return (arr || []).filter(item => item !== null && item !== undefined).map((item, idx) => {
          let newId = item.id;
          const isPlayer = item.isPlayer === true;
          
          if (isPlayer) {
            newId = 'player';
          } else if (!newId || seen.has(newId) || newId === 'player') {
            // Generate a more robust unique ID
            newId = `${prefix}_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
            while (seen.has(newId)) {
              newId = `${prefix}_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 4)}`;
            }
          }
          seen.add(newId);
          return { ...item, id: newId };
        });
      };

      updatedStats.inbox = deduplicate(updatedStats.inbox, 'inbox');
      updatedStats.activePowerups = deduplicate(updatedStats.activePowerups, 'powerup');
      updatedStats.leaderboard = deduplicate(updatedStats.leaderboard, 'bot');
      updatedStats.dailyTasks = deduplicate(updatedStats.dailyTasks, 'task');
      updatedStats.weeklyTasks = deduplicate(updatedStats.weeklyTasks, 'weekly');

      const chatIdsMap = new Map();
      const usedChatIds = new Set();
      updatedStats.chatSessions = (updatedStats.chatSessions || []).map(s => {
        let newId = s.id;
        if (!newId || usedChatIds.has(newId)) {
          newId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          while (usedChatIds.has(newId)) {
            newId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${Math.random().toString(36).substr(2, 3)}`;
          }
        }
        chatIdsMap.set(s.id, newId);
        usedChatIds.add(newId);
        
        // Also ensure messages have unique IDs
        const seenMsgIds = new Set();
        const messages = (s.messages || []).map((msg, idx) => {
          let msgId = msg.id;
          if (!msgId || seenMsgIds.has(msgId)) {
            msgId = `msg_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
            while (seenMsgIds.has(msgId)) {
              msgId = `msg_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}_${Math.random().toString(36).substr(2, 3)}`;
            }
          }
          seenMsgIds.add(msgId);
          return { ...msg, id: msgId };
        });
        
        return { ...s, id: newId, messages };
      });

      if (updatedStats.activeChatId && chatIdsMap.has(updatedStats.activeChatId)) {
        updatedStats.activeChatId = chatIdsMap.get(updatedStats.activeChatId);
      }

      return updatedStats;
    }
    return {
      totalStars: 0,
      totalGames: 0,
      highScore: 0,
      maxDifficulty: 1,
      completedWeeklyTasks: [],
      weeklyTasks: generateWeeklyTasks(),
      dailyTasks: generateDailyTasks(),
      lastResetTimestamp: Date.now(),
      lastWeeklyResetTimestamp: Date.now(),
      animationsEnabled: true,
      graphicsQuality: 'high',
      coins: 0,
      activePowerups: [],
      language: 'ar',
      dailyChestClaimed: false,
      fireAsteroids: 0,
      chatSessions: [],
      activeChatId: null,
      lastLeaderboardResetTimestamp: Date.now(),
      lastLeaderboardUpdateTimestamp: Date.now(),
      leaderboardSeed: Math.floor(Math.random() * 1000000),
      currentLeague: 'bronze',
      season: 1,
      skyPass: {
        level: 1,
        exp: 0,
        isPro: false,
        tiers: SKY_PASS_TIERS,
        lastResetTimestamp: Date.now()
      },
      forgeStats: {
        stardust: 0,
        modules: { engine: 0, magnet: 0, shield: 0, arsenal: 0, sensor: 0 },
        expeditions: [],
        artifacts: INITIAL_ARTIFACTS,
        skins: INITIAL_SKINS,
        activeSkinId: 'default_ship',
        syndicate: {
          weeklyDonation: 0,
          totalDonation: 0,
          currentRank: 0,
          lastDonationTimestamp: Date.now()
        },
        contracts: INITIAL_CONTRACTS
      },
      inbox: [
        {
          id: 'welcome_msg',
          type: 'coins',
          amount: 500,
          title: 'مرحباً بك في قفزة السماء!',
          description: 'استلم هديتك الترحيبية وابدأ المغامرة!',
          timestamp: Date.now(),
          isClaimed: false,
          source: 'chest'
        }
      ],
      leaderboard: [
        { 
          id: 'player', 
          name: 'Mustafa', 
          score: 0, 
          coins: 0, 
          stars: 0, 
          isPlayer: true, 
          avatar: '👨‍🚀',
          country: '🇸🇦',
          lastActive: Date.now()
        },
        ...generateBots('ar', true, Math.floor(Math.random() * 1000000), 'bronze', 1)
      ]
    };
  });

  // Initial offline progress update
  useEffect(() => {
    setStats(prev => updateLeaderboardOffline(prev));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sky-dash-stats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats to localStorage:', e);
      if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        // Prune images from chat sessions to save space
        const prunedStats = {
          ...stats,
          chatSessions: stats.chatSessions.map(session => ({
            ...session,
            messages: session.messages.map(msg => ({ ...msg, image: undefined }))
          }))
        };
        try {
          localStorage.setItem('sky-dash-stats', JSON.stringify(prunedStats));
        } catch (innerError) {
          console.error('Failed to save pruned stats to localStorage:', innerError);
        }
      }
    }
  }, [stats]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setStats(prev => {
        let hasChanged = false;
        let nextStats = { ...prev };

        // Daily Reset
        if (now - prev.lastResetTimestamp > 12 * 60 * 60 * 1000) {
          nextStats = {
            ...nextStats,
            dailyTasks: generateDailyTasks(),
            lastResetTimestamp: now,
            dailyChestClaimed: false
          };
          hasChanged = true;
        }

        // Weekly Reset
        if (now - prev.lastWeeklyResetTimestamp > 7 * 24 * 60 * 60 * 1000) {
          nextStats = {
            ...nextStats,
            weeklyTasks: generateWeeklyTasks(),
            lastWeeklyResetTimestamp: now,
            completedWeeklyTasks: []
          };
          hasChanged = true;
        }

        // Leaderboard Reset
        if (now - prev.lastLeaderboardResetTimestamp > 7 * 24 * 60 * 60 * 1000) {
          const sorted = [...prev.leaderboard].sort((a, b) => b.score - a.score);
          const playerRank = sorted.findIndex(e => e.isPlayer) + 1;
          
          let nextLeague = prev.currentLeague;
          const currentLeagueIndex = LEAGUES.indexOf(prev.currentLeague);
          
          // Promotion/Relegation Logic
          if (playerRank <= 10) {
            // Promote
            if (currentLeagueIndex < LEAGUES.length - 1) {
              nextLeague = LEAGUES[currentLeagueIndex + 1];
            }
          } else if (playerRank >= 31) {
            // Relegate
            if (currentLeagueIndex > 0) {
              nextLeague = LEAGUES[currentLeagueIndex - 1];
            }
          }
          
          let rCoins = 0;
          if (playerRank === 1) { rCoins = 2000; }
          else if (playerRank === 2) { rCoins = 1500; }
          else if (playerRank === 3) { rCoins = 1000; }

          if (rCoins > 0) {
            const leagueName = t[`${prev.currentLeague}League` as keyof typeof t] || prev.currentLeague;
            const rewardItem: InboxItem = {
              id: `leaderboard_reward_${now}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'coins',
              amount: rCoins,
              title: stats.language === 'ar' ? `جائزة الموسم: المركز ${playerRank}` : `Season Reward: Rank ${playerRank}`,
              description: stats.language === 'ar' 
                ? `لقد حصلت على مكافأة لكونك في المركز ${playerRank} في ${leagueName}!` 
                : `You received a reward for being rank ${playerRank} in the ${leagueName}!`,
              timestamp: now,
              isClaimed: false,
              source: 'leaderboard'
            };
            nextStats.inbox = [rewardItem, ...nextStats.inbox];
          }

          nextStats = {
            ...nextStats,
            currentLeague: nextLeague,
            season: prev.season + 1,
            leaderboardSeed: Math.floor(Math.random() * 1000000),
            lastLeaderboardResetTimestamp: now,
            lastLeaderboardUpdateTimestamp: now,
            leaderboard: [
              { 
                id: 'player', 
                name: 'Mustafa', 
                score: 0, 
                coins: 0, 
                stars: 0, 
                isPlayer: true, 
                avatar: '👨‍🚀',
                country: '🇸🇦',
                lastActive: Date.now()
              },
              ...generateBots(nextStats.language, true, Math.floor(Math.random() * 1000000), nextLeague, prev.season + 1)
            ]
          };
          hasChanged = true;
        }

        // Power-up Cleanup
        const activeCount = nextStats.activePowerups.length;
        const validPowerups = nextStats.activePowerups.filter(p => p.expiresAt === 0 || p.expiresAt > now);
        if (validPowerups.length !== activeCount) {
          nextStats = { ...nextStats, activePowerups: validPowerups };
          hasChanged = true;
        }

        // Inbox Cleanup: Remove claimed items older than 24 hours
        const inboxCount = nextStats.inbox.length;
        const freshInbox = nextStats.inbox.filter(item => {
          if (!item.isClaimed) return true;
          return now - item.timestamp < 24 * 60 * 60 * 1000;
        });
        if (freshInbox.length !== inboxCount) {
          nextStats = { ...nextStats, inbox: freshInbox };
          hasChanged = true;
        }

        return hasChanged ? nextStats : prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [generateDailyTasks, generateWeeklyTasks]);

  // Keep player online status updated
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        leaderboard: prev.leaderboard.map(entry => 
          entry.isPlayer ? { ...entry, lastActive: Date.now() } : entry
        )
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);



  const weeklyTasks = useMemo(() => {
    return stats.weeklyTasks.map(task => {
      const isCompleted = stats.completedWeeklyTasks.includes(task.id);
      return { ...task, isCompleted };
    });
  }, [stats]);

  const handleGameOver = useCallback((finalScore: number, gameStats: { stars: number, difficulty: number, time: number, spaceshipHits: number, nearMisses: number }) => {
    if (!hasRevived && stats.coins >= 100) {
      setReviveModal({ score: finalScore, stats: gameStats });
      return;
    }
    
    setScore(finalScore);
    
    setStats(prev => {
      let earnedCoins = Math.floor(finalScore / 100) * 3;
      
      // Golden Monarch Bonus: x1.5 coins
      if (prev.forgeStats.activeSkinId === 'golden_monarch') {
        earnedCoins = Math.floor(earnedCoins * 1.5);
      }

      const totalStardust = prev.forgeStats.stardust + gameStats.stars;
      
      const updatedDailyTasks = prev.dailyTasks.map(task => {
        if (task.isCompleted) return task;
        
        let newValue = task.currentValue;
        switch (task.type) {
          case 'score': newValue += finalScore; break;
          case 'stars': newValue += gameStats.stars; break;
          case 'games': 
            if (finalScore >= 500) {
              newValue += 1;
            }
            break;
          case 'time': newValue += gameStats.time; break;
          case 'difficulty': newValue = Math.max(newValue, gameStats.difficulty); break;
          case 'spaceship_hits': newValue += gameStats.spaceshipHits; break;
        }

        const isCompleted = newValue >= task.targetValue;
        return { ...task, currentValue: newValue, isCompleted };
      });

      const newlyCompletedWeekly: string[] = [];
      const updatedWeeklyTasks = prev.weeklyTasks.map(task => {
        if (prev.completedWeeklyTasks.includes(task.id)) return task;

        let newValue = task.currentValue;
        switch (task.type) {
          case 'score': newValue += finalScore; break;
          case 'stars': newValue += gameStats.stars; break;
          case 'games': 
            if (finalScore >= 500) {
              newValue += 1;
            }
            break;
          case 'time': newValue += gameStats.time; break;
          case 'difficulty': newValue = Math.max(newValue, gameStats.difficulty); break;
          case 'spaceship_hits': newValue += gameStats.spaceshipHits; break;
        }

        const isCompleted = newValue >= task.targetValue;
        if (isCompleted) {
          newlyCompletedWeekly.push(task.id);
        }
        return { ...task, currentValue: newValue, isCompleted };
      });

      const newInboxItems: InboxItem[] = [];

      // Add game earned coins to inbox
      if (earnedCoins > 0) {
        newInboxItems.push({
          id: `game_reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'coins',
          amount: earnedCoins,
          title: stats.language === 'ar' ? 'مكافأة الجولة' : 'Round Reward',
          description: stats.language === 'ar' ? `لقد حصلت على ${earnedCoins} عملة من هذه الجولة` : `You earned ${earnedCoins} coins from this round`,
          timestamp: Date.now(),
          isClaimed: false,
          source: 'task'
        });
      }

      // Add weekly task rewards to inbox
      updatedWeeklyTasks.forEach(task => {
        if (task.isCompleted && !prev.completedWeeklyTasks.includes(task.id)) {
          newInboxItems.push({
            id: `weekly_task_${task.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'coins',
            amount: task.reward,
            title: stats.language === 'ar' ? `مكافأة مهمة: ${t.weeklyTasksTitles[task.id as keyof typeof t.weeklyTasksTitles] || task.title}` : `Task Reward: ${task.title}`,
            description: stats.language === 'ar' ? 'مكافأة إكمال المهمة الأسبوعية' : 'Weekly task completion reward',
            timestamp: Date.now(),
            isClaimed: false,
            source: 'task'
          });
        }
      });

      // Add daily task rewards to inbox
      updatedDailyTasks.forEach(task => {
        const oldTask = prev.dailyTasks.find(t => t.id === task.id);
        if (task.isCompleted && (!oldTask || !oldTask.isCompleted)) {
          newInboxItems.push({
            id: `daily_task_${task.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'coins',
            amount: task.reward,
            title: stats.language === 'ar' ? `مكافأة مهمة: ${t.dailyTasksTitles[task.id as keyof typeof t.dailyTasksTitles] || task.title}` : `Task Reward: ${task.title}`,
            description: stats.language === 'ar' ? 'مكافأة إكمال المهمة اليومية' : 'Daily task completion reward',
            timestamp: Date.now(),
            isClaimed: false,
            source: 'task'
          });
        }
      });

      const updatedContracts = prev.forgeStats.contracts.map(contract => {
        if (!contract.isPurchased || contract.isCompleted) return contract;

        let newValue = contract.currentValue;
        switch (contract.type) {
          case 'score': newValue = Math.max(newValue, finalScore); break;
          case 'stars': newValue += gameStats.stars; break;
          case 'time': newValue = Math.max(newValue, gameStats.time); break;
          case 'near_miss': newValue = Math.max(newValue, gameStats.nearMisses); break;
          case 'risk': newValue = Math.max(newValue, finalScore); break;
          case 'investment':
            // Handled separately if it's duration based
            break;
        }

        const isCompleted = newValue >= contract.targetValue;
        
        // Handle remaining games for temporary buffs
        let remainingGames = contract.remainingGames;
        if (contract.type === 'investment' && contract.isPurchased && remainingGames !== undefined && remainingGames > 0) {
          remainingGames -= 1;
        }

        return { ...contract, currentValue: newValue, isCompleted, remainingGames };
      });

      const updatedSkyPass = { ...prev.skyPass };
      let earnedExp = Math.floor(finalScore / 50);
      updatedDailyTasks.forEach(task => {
        const oldTask = prev.dailyTasks.find(t => t.id === task.id);
        if (task.isCompleted && (!oldTask || !oldTask.isCompleted)) {
          earnedExp += 50;
        }
      });
      updatedWeeklyTasks.forEach(task => {
        if (task.isCompleted && !prev.completedWeeklyTasks.includes(task.id)) {
          earnedExp += 200;
        }
      });

      updatedSkyPass.exp += earnedExp;
      let nextTier = updatedSkyPass.tiers.find(t => t.level === updatedSkyPass.level + 1);
      while (nextTier && updatedSkyPass.exp >= nextTier.requiredExp) {
        updatedSkyPass.exp -= nextTier.requiredExp;
        updatedSkyPass.level++;
        nextTier = updatedSkyPass.tiers.find(t => t.level === updatedSkyPass.level + 1);
      }

      const newStats = {
        ...prev,
        totalStars: prev.totalStars + gameStats.stars,
        totalGames: prev.totalGames + 1,
        highScore: Math.max(prev.highScore, finalScore),
        maxDifficulty: Math.max(prev.maxDifficulty, gameStats.difficulty),
        dailyTasks: updatedDailyTasks,
        weeklyTasks: updatedWeeklyTasks,
        completedWeeklyTasks: [...prev.completedWeeklyTasks, ...newlyCompletedWeekly],
        inbox: [...newInboxItems, ...prev.inbox],
        activePowerups: [], // Clear powerups after game
        skyPass: updatedSkyPass,
        forgeStats: {
          ...prev.forgeStats,
          stardust: totalStardust,
          contracts: updatedContracts
        },
        leaderboard: (() => {
          const updated = prev.leaderboard.map(entry => {
            if (entry.isPlayer) {
              return { 
                ...entry, 
                score: entry.score + finalScore, 
                coins: entry.coins + earnedCoins, 
                stars: entry.stars + gameStats.stars,
                lastActive: Date.now()
              };
            }
            
            const played = Math.random() > 0.3; // 70% chance (increased from 60%)
            if (played) {
              const skill = entry.baseSkill || 1;
              return {
                ...entry,
                score: entry.score + Math.floor(Math.random() * finalScore * 1.2 * skill), // Increased from 0.8
                stars: entry.stars + Math.floor(Math.random() * gameStats.stars * 1.5 * skill),
                coins: entry.coins + Math.floor(Math.random() * earnedCoins * 2 * skill),
                lastActive: Date.now()
              };
            }
            return entry;
          });

          // Sort and update previousRank
          const sorted = [...updated].sort((a, b) => b.score - a.score);
          
          // Ensure unique IDs and update ranks
          const seen = new Set();
          return updated.filter(e => e !== null).map((entry, idx) => {
            let id = entry.id;
            if (entry.isPlayer) {
              id = 'player';
            } else if (!id || seen.has(id) || id === 'player') {
              id = `bot_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
              while (seen.has(id)) {
                id = `bot_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 3)}`;
              }
            }
            seen.add(id);
            
            const oldRank = prev.leaderboard.findIndex(e => e.id === entry.id) + 1;
            return {
              ...entry,
              id,
              previousRank: oldRank > 0 ? oldRank : (idx + 1)
            };
          });
        })()
      };

      if (finalScore > prev.highScore || newlyCompletedWeekly.length > 0) {
        setShouldShowConfetti(true);
      }

      return newStats;
    });

    setGameState('GAMEOVER');
  }, [hasRevived, stats.coins]);

  useEffect(() => {
    if (gameState === 'GAMEOVER' && shouldShowConfetti) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 1000
        });
        setShouldShowConfetti(false);
      }, 400);
      return () => clearTimeout(timer);
    }
    if (gameState !== 'GAMEOVER') {
      setShouldShowConfetti(false);
    }
  }, [gameState, shouldShowConfetti]);

  const startGame = () => {
    setHasRevived(false);
    if (isEid) {
      setStats(prev => {
        const now = Date.now();
        // Check if shield is already active to avoid duplicates
        const hasShield = prev.activePowerups.some(p => p.type === 'shield' && (p.expiresAt === 0 || p.expiresAt > now));
        if (hasShield) return prev;
        
        return {
          ...prev,
          activePowerups: [
            ...prev.activePowerups,
            { id: 'eid_shield', type: 'shield', expiresAt: 0 }
          ]
        };
      });
    }

    // Crimson Fury Bonus: Start with 1 Fire Asteroid
    if (stats.forgeStats.activeSkinId === 'crimson_fury') {
      setStats(prev => ({
        ...prev,
        fireAsteroids: prev.fireAsteroids + 1
      }));
    }

    setGameState('PLAYING');
  };
  const goToMenu = () => setGameState('MENU');

  const t = useMemo(() => getTranslation(stats.language), [stats.language]);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [isEconomyHubOpen, setIsEconomyHubOpen] = useState(false);
  const [isSkyPassOpen, setIsSkyPassOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string, message: string, type: 'success' | 'info' }[]>([]);

  const addNotification = (message: string, type: 'success' | 'info' = 'info') => {
    setNotifications(prev => {
      // Prevent duplicate messages from filling the screen
      const isDuplicate = prev.some(n => n.message === message);
      if (isDuplicate && prev.length >= 3) return prev;
      
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newNotifs = [...prev, { id, message, type }];
      
      // Limit to 3 notifications at a time
      if (newNotifs.length > 3) {
        return newNotifs.slice(1);
      }
      
      setTimeout(() => {
        setNotifications(current => current.filter(n => n.id !== id));
      }, 3000);
      
      return newNotifs;
    });
  };

  const addToInbox = (items: Omit<InboxItem, 'id' | 'timestamp' | 'isClaimed'> | Omit<InboxItem, 'id' | 'timestamp' | 'isClaimed'>[]) => {
    const itemsArray = Array.isArray(items) ? items : [items];
    const newItems: InboxItem[] = itemsArray.map(item => ({
      ...item,
      id: `${item.source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      isClaimed: false
    }));

    setStats(prev => ({
      ...prev,
      inbox: [...newItems, ...prev.inbox]
    }));
  };

  const prevInboxLength = useRef(stats.inbox.length);
  useEffect(() => {
    if (stats.inbox.length > prevInboxLength.current) {
      const diff = stats.inbox.length - prevInboxLength.current;
      // Don't show notification on initial load (welcome message)
      if (prevInboxLength.current > 0) {
        const msg = stats.language === 'ar' 
          ? (diff === 1 ? 'تمت إضافة عنصر جديد إلى الصندوق الوارد!' : `تمت إضافة ${diff} عناصر جديدة!`)
          : (diff === 1 ? 'New item added to your Inbox!' : `${diff} new items added!`);
        addNotification(msg, 'success');
      }
    }
    prevInboxLength.current = stats.inbox.length;
  }, [stats.inbox.length, stats.language]);

  // Initial load and welcome notification
  useEffect(() => {
    const unclaimed = stats.inbox.filter((i: InboxItem) => !i.isClaimed).length;
    if (unclaimed > 0) {
      const msg = stats.language === 'ar' 
        ? `لديك ${unclaimed} مكافآت بانتظارك في الصندوق الوارد!` 
        : `You have ${unclaimed} rewards waiting in your Inbox!`;
      setTimeout(() => addNotification(msg, 'info'), 1500);
    }
  }, []);

  // Update leaderboard when it opens
  useEffect(() => {
    if (isLeaderboardOpen) {
      setStats(prev => updateLeaderboardOffline(prev));
    }
  }, [isLeaderboardOpen]);
  const [showRewardClaimed, setShowRewardClaimed] = useState<{ coins: number, rank: number } | null>(null);

  const isEid = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 is Jan, 2 is March
    const day = now.getDate();
    // Eid al-Fitr 2026: March 20, 21, 22, 23, 24
    return year === 2026 && month === 2 && (day >= 20 && day <= 24);
  }, []);

  const eidCountdown = useMemo(() => {
    if (!isEid) return null;
    const endOfEid = new Date(2026, 2, 25, 0, 0, 0).getTime(); // March 25, 2026 00:00:00
    const diff = endOfEid - Date.now();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}${t.daysShort} ${hours}${t.hoursShort} ${minutes}${t.minutesShort}`;
  }, [isEid, t]);

  const timeUntilReset = useMemo(() => {
    const nextReset = stats.lastResetTimestamp + 12 * 60 * 60 * 1000;
    const diff = nextReset - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}${t.hoursShort} ${t.and} ${minutes}${t.minutesShort}`;
  }, [stats.lastResetTimestamp, t]);

  const allDailyTasksCompleted = useMemo(() => {
    return stats.dailyTasks.length > 0 && stats.dailyTasks.every(task => task.isCompleted);
  }, [stats.dailyTasks]);

  const timeUntilWeeklyReset = useMemo(() => {
    const nextReset = stats.lastWeeklyResetTimestamp + 7 * 24 * 60 * 60 * 1000;
    const diff = nextReset - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}${t.daysShort} ${t.and} ${hours}${t.hoursShort}`;
  }, [stats.lastWeeklyResetTimestamp, t]);

  const leaderboardCountdown = useMemo(() => {
    const nextReset = stats.lastLeaderboardResetTimestamp + 7 * 24 * 60 * 60 * 1000;
    const diff = nextReset - Date.now();
    if (diff <= 0) return `0${t.daysShort}`;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}${t.daysShort} ${hours}${t.hoursShort} ${minutes}${t.minutesShort}`;
  }, [stats.lastLeaderboardResetTimestamp, t]);

  const setLanguage = (lang: Language) => {
    playClickSound();
    setStats(prev => ({ ...prev, language: lang }));
  };

  const toggleAnimations = () => {
    playClickSound();
    setStats(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }));
  };

  const setGraphicsQuality = (quality: GraphicsQuality) => {
    playClickSound();
    setStats(prev => ({ ...prev, graphicsQuality: quality }));
  };

  const audioCtxRef = React.useRef<AudioContext | null>(null);

  // Diagnostic useEffect to catch duplicate keys in state
  useEffect(() => {
    const checkDuplicates = (arr: any[], name: string) => {
      if (!arr) return;
      const ids = arr.map(item => item.id);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicates.length > 0) {
        console.error(`[React Key Audit] Duplicate IDs found in ${name}:`, duplicates);
      }
    };

    checkDuplicates(stats.inbox, 'inbox');
    checkDuplicates(stats.activePowerups, 'activePowerups');
    checkDuplicates(stats.leaderboard, 'leaderboard');
    checkDuplicates(stats.dailyTasks, 'dailyTasks');
    checkDuplicates(stats.weeklyTasks, 'weeklyTasks');
    
    if (stats.chatSessions) {
      stats.chatSessions.forEach((session, idx) => {
        checkDuplicates(session.messages, `chatSession[${idx}].messages`);
      });
    }
  }, [stats]);

  const playClickSound = useCallback(() => {
    if (isMuted) return;
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.1);
  }, [isMuted]);

  const playPurchaseSound = useCallback(() => {
    if (isMuted) return;
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, audioCtxRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtxRef.current.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.2);
  }, [isMuted]);

  const buyPowerup = (powerup: Powerup) => {
    playPurchaseSound();
    if (stats.coins >= powerup.cost) {
      // Check limit for fire asteroids including those in inbox
      if (powerup.type === 'fireAsteroid') {
        const inInbox = stats.inbox
          .filter(item => item.type === 'fire_asteroid' && !item.isClaimed)
          .reduce((acc, item) => acc + (item.amount || 1), 0);
        
        if (stats.fireAsteroids + inInbox >= 25) {
          const msg = stats.language === 'ar' ? 'وصلت للحد الأقصى من الكويكبات (25)!' : 'Reached maximum asteroids limit (25)!';
          addNotification(msg, 'info');
          return;
        }
      }

      setStats(prev => ({ ...prev, coins: prev.coins - powerup.cost }));
      
      addToInbox({
        type: powerup.type === 'fireAsteroid' ? 'fire_asteroid' : 'powerup',
        powerupType: powerup.type === 'fireAsteroid' ? undefined : powerup.type as any,
        amount: powerup.type === 'fireAsteroid' ? 1 : undefined,
        title: stats.language === 'ar' ? `شراء: ${t.powerupNames[powerup.id as keyof typeof t.powerupNames] || powerup.name}` : `Purchase: ${powerup.name}`,
        description: stats.language === 'ar' ? 'تم شراء هذا العنصر من المتجر' : 'This item was purchased from the store',
        source: 'store'
      });

      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 }
      });
    }
  };

  const claimInboxItem = (id: string) => {
    const item = stats.inbox.find(i => i.id === id);
    if (!item || item.isClaimed) return;

    setStats(prev => {
      const newInbox = prev.inbox.map(i => i.id === id ? { ...i, isClaimed: true } : i);
      const newStats = { ...prev, inbox: newInbox };

      if (item.type === 'coins') {
        newStats.coins += item.amount || 0;
      } else if (item.type === 'fire_asteroid') {
        newStats.fireAsteroids = Math.min(25, prev.fireAsteroids + (item.amount || 1));
      } else if (item.type === 'powerup' && item.powerupType) {
        const isPermanent = item.source === 'store' || item.source === 'task' || item.powerupType === 'shield';
        
        newStats.activePowerups = [
          ...prev.activePowerups,
          {
            id: `claimed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: item.powerupType,
            expiresAt: isPermanent ? 0 : Date.now() + 30 * 1000
          }
        ];
      }

      return newStats;
    });

    const msg = stats.language === 'ar' ? 'تم استلام المكافأة بنجاح!' : 'Reward claimed successfully!';
    addNotification(msg, 'success');
    playClickSound();
  };

  const deleteInboxItem = (id: string) => {
    setStats(prev => ({
      ...prev,
      inbox: prev.inbox.filter(i => i.id !== id)
    }));
    playClickSound();
  };

  const claimAllInbox = () => {
    let claimedCount = 0;
    setStats(prev => {
      let newCoins = prev.coins;
      let newFireAsteroids = prev.fireAsteroids;
      let newActivePowerups = [...prev.activePowerups];
      
      const newInbox = prev.inbox.map(item => {
        if (item.isClaimed) return item;
        claimedCount++;
        
        if (item.type === 'coins') {
          newCoins += item.amount || 0;
        } else if (item.type === 'fire_asteroid') {
          newFireAsteroids = Math.min(25, newFireAsteroids + (item.amount || 1));
        } else if (item.type === 'powerup' && item.powerupType) {
          const isPermanent = item.source === 'store' || item.source === 'task' || item.powerupType === 'shield';
          newActivePowerups.push({
            id: `claimed_all_${Date.now()}_${item.id}`,
            type: item.powerupType,
            expiresAt: isPermanent ? 0 : Date.now() + 30 * 1000
          });
        }
        
        return { ...item, isClaimed: true };
      });

      return {
        ...prev,
        coins: newCoins,
        fireAsteroids: newFireAsteroids,
        activePowerups: newActivePowerups,
        inbox: newInbox
      };
    });

    if (claimedCount > 0) {
      const msg = stats.language === 'ar' 
        ? `تم استلام ${claimedCount} مكافآت بنجاح!` 
        : `Successfully claimed ${claimedCount} rewards!`;
      addNotification(msg, 'success');
      
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    playClickSound();
  };

  const clearClaimedInbox = () => {
    setStats(prev => ({
      ...prev,
      inbox: prev.inbox.filter(item => !item.isClaimed)
    }));
    
    const msg = stats.language === 'ar' ? 'تم تنظيف الصندوق الوارد' : 'Inbox cleared of claimed items';
    addNotification(msg, 'info');
    playClickSound();
  };

  const claimDailyChest = () => {
    playClickSound();
    const rewards = [
      { type: 'shield', value: 1, icon: <Shield className="w-12 h-12 text-sky-400" />, label: t.rewardShield },
      { type: 'coins', value: 50, icon: <Coins className="w-12 h-12 text-yellow-400" />, label: `50 ${t.rewardCoins}` },
      { type: 'slowMotion', value: 20, icon: <Timer className="w-12 h-12 text-pink-400" />, label: t.rewardSlowMo },
      { type: 'coins', value: 100, icon: <Coins className="w-12 h-12 text-yellow-500" />, label: `100 ${t.rewardCoins}` },
      { type: 'magnet', value: 15, icon: <Magnet className="w-12 h-12 text-pink-400" />, label: t.rewardMagnet },
    ];
    
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    setStats(prev => ({ ...prev, dailyChestClaimed: true }));

    addToInbox({
      type: reward.type === 'coins' ? 'coins' : (reward.type === 'fire_asteroid' ? 'fire_asteroid' : 'powerup'),
      amount: reward.type === 'coins' ? reward.value : undefined,
      powerupType: (reward.type !== 'coins' && reward.type !== 'fire_asteroid') ? reward.type as any : undefined,
      title: stats.language === 'ar' ? 'مكافأة الصندوق اليومي' : 'Daily Chest Reward',
      description: stats.language === 'ar' ? `لقد حصلت على ${reward.label}` : `You received ${reward.label}`,
      source: 'chest'
    });
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleRevive = () => {
    if (reviveModal && stats.coins >= 100) {
      setStats(prev => ({ ...prev, coins: prev.coins - 100 }));
      setHasRevived(true);
      setReviveModal(null);
      // We need to tell SkyDash to revive
      if ((window as any).reviveGame) {
        (window as any).reviveGame();
      }
    }
  };

  const cancelRevive = () => {
    if (reviveModal) {
      const { score: finalScore, stats: gameStats } = reviveModal;
      setReviveModal(null);
      setHasRevived(true);
      handleGameOver(finalScore, gameStats);
    }
  };

  const useFireAsteroid = useCallback(() => {
    setStats(prev => ({ ...prev, fireAsteroids: Math.max(0, prev.fireAsteroids - 1) }));
  }, []);

  // Diagnostic: Check for duplicate IDs in state arrays
  useEffect(() => {
    const checkDuplicates = (arr: any[], name: string) => {
      const seen = new Set();
      const duplicates = arr.filter(item => {
        if (seen.has(item.id)) return true;
        seen.add(item.id);
        return false;
      });
      if (duplicates.length > 0) {
        console.error(`[DIAGNOSTIC] Duplicate IDs found in ${name}:`, duplicates.map(d => d.id));
      }
    };

    if (stats) {
      checkDuplicates(stats.leaderboard, 'leaderboard');
      checkDuplicates(stats.inbox, 'inbox');
      checkDuplicates(stats.activePowerups, 'activePowerups');
      checkDuplicates(stats.dailyTasks, 'dailyTasks');
      checkDuplicates(stats.weeklyTasks, 'weeklyTasks');
      stats.chatSessions.forEach(s => checkDuplicates(s.messages, `messages in chat ${s.id}`));
    }
  }, [stats]);

  return (
    <MotionConfig transition={{ 
      type: "tween", 
      ease: "circOut", 
      duration: stats.animationsEnabled ? 0.25 : 0 
    }}>
      <div className={`min-h-screen ${isEid ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' : 'bg-slate-950'} text-white font-sans selection:bg-indigo-500/30 overflow-hidden flex items-center justify-center`} dir={stats.language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Notifications */}
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {notifications.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 ${
                  n.type === 'success' 
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                    : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                }`}
              >
                {n.type === 'success' ? <Check className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                <span className="font-bold text-sm whitespace-nowrap">{n.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Global Inbox Button */}
        <AnimatePresence>
          {gameState !== 'PLAYING' && gameState !== 'INBOX' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => { playClickSound(); setGameState('INBOX'); }}
              className="fixed top-6 left-6 p-4 bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800 hover:from-indigo-500 hover:to-blue-600 text-white rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all hover:scale-110 active:scale-95 z-[60] border border-white/20 group"
              title={t.inbox}
            >
              <Inbox className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              {stats.inbox.filter((i: InboxItem) => !i.isClaimed).length > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 flex items-center justify-center"
                >
                  <span className="relative flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-gradient-to-tr from-pink-500 to-rose-600 border-2 border-white items-center justify-center text-[10px] font-black shadow-lg">
                      {stats.inbox.filter((i: InboxItem) => !i.isClaimed).length}
                    </span>
                  </span>
                </motion.div>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Top Right Buttons */}
        <AnimatePresence>
          {gameState === 'MENU' && (
            <div className="fixed top-6 right-6 flex flex-col gap-4 z-[60]">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => { playClickSound(); setIsLeaderboardOpen(true); }}
                className="p-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-110 active:scale-95 border border-white/20 group"
                title={t.leaderboard}
              >
                <Trophy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => { playClickSound(); setIsSkyPassOpen(true); }}
                className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-110 active:scale-95 border border-white/20 group relative"
                title={t.skyPass}
              >
                <Crown className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-1 -right-1 bg-slate-950 text-white text-[8px] px-1.5 py-0.5 rounded-full border border-white/10 font-black">
                  LVL {stats.skyPass.level}
                </div>
              </motion.button>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {isForgeOpen && (
            <StarForge 
              stats={stats}
              onUpdateStats={setStats}
              onClose={() => setIsForgeOpen(false)}
              language={stats.language}
            />
          )}

          {gameState === 'MENU' && (
            <MenuScreen 
              t={t} 
              isEid={isEid} 
              stats={stats} 
              startGame={startGame} 
              setIsLeaderboardOpen={setIsLeaderboardOpen} 
              setGameState={setGameState} 
              playClickSound={playClickSound}
              setIsAIModalOpen={setIsAIModalOpen}
              setIsForgeOpen={setIsForgeOpen}
              setIsEconomyHubOpen={setIsEconomyHubOpen}
              setIsSkyPassOpen={setIsSkyPassOpen}
            />
          )}

          {gameState === 'INBOX' && (
            <InboxScreen 
              stats={stats}
              t={t}
              claimItem={claimInboxItem}
              claimAll={claimAllInbox}
              clearClaimed={clearClaimedInbox}
              deleteItem={deleteInboxItem}
              goToMenu={goToMenu}
              playClickSound={playClickSound}
            />
          )}

          {gameState === 'PLAYING' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-screen flex items-center justify-center"
            >
              <SkyDash 
                onGameOver={handleGameOver} 
                isMuted={isMuted} 
                activePowerups={stats.activePowerups} 
                graphicsQuality={stats.graphicsQuality}
                language={stats.language}
                isEid={isEid}
                fireAsteroids={stats.fireAsteroids}
                onUseFireAsteroid={useFireAsteroid}
                baseDifficulty={LEAGUE_CONFIG[stats.currentLeague || 'bronze'].skillMultiplier}
                metaBuffs={getMetaBuffs(stats.forgeStats)}
                activeSkin={stats.forgeStats.skins.find(s => s.id === stats.forgeStats.activeSkinId)}
              />
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <GameOverScreen 
              t={t} 
              score={score} 
              stats={stats} 
              startGame={startGame} 
              goToMenu={goToMenu} 
              playClickSound={playClickSound} 
            />
          )}

          {gameState === 'STORE' && (
            <StoreScreen 
              t={t} 
              stats={stats} 
              isEid={isEid} 
              buyPowerup={buyPowerup} 
              goToMenu={goToMenu} 
              playClickSound={playClickSound} 
            />
          )}
          {gameState === 'SETTINGS' && (
            <SettingsScreen 
              t={t} 
              stats={stats} 
              isMuted={isMuted} 
              setIsMuted={setIsMuted} 
              setLanguage={setLanguage} 
              toggleAnimations={toggleAnimations} 
              setGraphicsQuality={setGraphicsQuality} 
              setGameState={setGameState} 
              playClickSound={playClickSound} 
            />
          )}

          {gameState === 'WEEKLY_TASKS' && (
            <WeeklyTasksScreen 
              t={t} 
              stats={stats} 
              weeklyTasks={stats.weeklyTasks} 
              goToMenu={goToMenu} 
              playClickSound={playClickSound} 
              timeUntilWeeklyReset={timeUntilWeeklyReset} 
            />
          )}

          {gameState === 'EVENTS' && (
            <EventsScreen 
              t={t} 
              isEid={isEid} 
              eidCountdown={eidCountdown} 
              goToMenu={goToMenu} 
              playClickSound={playClickSound} 
            />
          )}

          {gameState === 'DAILY_TASKS' && (
            <DailyTasksScreen 
              t={t} 
              stats={stats} 
              goToMenu={goToMenu} 
              playClickSound={playClickSound} 
              timeUntilReset={timeUntilReset} 
              allDailyTasksCompleted={allDailyTasksCompleted} 
              claimDailyChest={claimDailyChest} 
            />
          )}
          {gameState === 'INSTRUCTIONS' && (
            <InstructionsScreen 
              t={t} 
              stats={stats} 
              setGameState={setGameState} 
              playClickSound={playClickSound} 
            />
          )}

          {rewardModal && (
            <motion.div
              key="reward_modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 max-w-xs w-full text-center shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50" />
                
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"
                  />
                  <div className="relative p-6 bg-slate-800 rounded-3xl border border-white/10 shadow-xl">
                    {rewardModal.icon}
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-2">{t.chestReward}</h3>
                  <p className="text-amber-400 font-bold text-xl">{(rewardModal as any).label}</p>
                </div>

                <button
                  onClick={() => { playClickSound(); setRewardModal(null); }}
                  className="relative z-10 w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  {t.claim}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Revive Modal */}
        <AnimatePresence>
          {reviveModal && (
            <motion.div
              key="revive-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            >
              <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                  <RotateCcw className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black mb-1">{t.reviveTitle}</h2>
                <p className="text-amber-400 text-xs font-bold mb-3 uppercase tracking-wider">
                  {t.reviveOneTime}
                </p>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  {t.reviveDesc}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleRevive}
                    className="flex flex-col items-center gap-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                  >
                    <span>{t.yes}</span>
                    <div className="flex items-center gap-1 text-xs opacity-80">
                      <Coins className="w-3 h-3" />
                      <span>100</span>
                    </div>
                  </button>
                  <button
                    onClick={cancelRevive}
                    className="py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 border border-white/5"
                  >
                    {t.no}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Eid Sparkles */}
        {isEid && gameState !== 'PLAYING' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`eid_sparkle_${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.5, 0], 
                  scale: [0, 1, 0],
                  x: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                  y: [Math.random() * 400 - 200, Math.random() * 400 - 200]
                }}
                transition={{ 
                  duration: 4 + Math.random() * 4, 
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
                className="absolute left-1/2 top-1/2"
              >
                <Sparkles className="w-4 h-4 text-amber-300/20 fill-amber-300/10" />
              </motion.div>
            ))}
          </div>
        )}
        <AIModal 
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          stats={stats}
          setStats={setStats}
          t={t}
        />
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          leaderboard={stats.leaderboard}
          t={t}
          countdown={leaderboardCountdown}
          currentLeague={stats.currentLeague}
          season={stats.season}
        />
        <EconomyHub
          isOpen={isEconomyHubOpen}
          onClose={() => setIsEconomyHubOpen(false)}
          stats={stats}
          onUpdateStats={setStats}
          t={t}
        />

        <SkyPassModal
          isOpen={isSkyPassOpen}
          onClose={() => setIsSkyPassOpen(false)}
          stats={stats}
          onUpdateStats={setStats}
          t={t}
        />

        {/* Reward Claimed Modal */}
        <AnimatePresence>
          {showRewardClaimed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotate: 10, opacity: 0 }}
                className="bg-slate-900 border-2 border-amber-500/50 p-8 rounded-[40px] text-center max-w-sm w-full relative overflow-hidden"
              >
                {/* Confetti effect background */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={`reward_confetti_${i}`}
                      animate={{ 
                        y: [0, 400], 
                        x: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      className="absolute top-0 left-1/2 w-2 h-2 bg-amber-400 rounded-full"
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                    <Trophy className="w-12 h-12 text-amber-400" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">
                    {t.rewardClaimed}
                  </h2>
                  <p className="text-slate-400 mb-6 font-bold uppercase text-xs tracking-widest">
                    {showRewardClaimed.rank === 1 ? t.firstPlace : showRewardClaimed.rank === 2 ? t.secondPlace : t.thirdPlace}
                  </p>

                  <div className="flex justify-center gap-6 mb-8">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-2 border border-yellow-500/30">
                        <Coins className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                      </div>
                      <span className="text-xl font-black text-white">+{showRewardClaimed.coins}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRewardClaimed(null)}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-2xl transition-all shadow-[0_10px_0_rgb(180,130,0)] active:translate-y-1 active:shadow-none uppercase italic"
                  >
                    {t.awesome}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
