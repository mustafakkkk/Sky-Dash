export interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  reward: number;
  type: 'score' | 'stars' | 'games' | 'time' | 'difficulty' | 'spaceship_hits';
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  reward: number;
  type: 'score' | 'stars' | 'games' | 'time' | 'difficulty' | 'spaceship_hits';
}

export interface Powerup {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number; // in seconds
  type: 'shield' | 'doublePoints' | 'slowMotion' | 'magnet' | 'fireAsteroid';
  icon: string;
}

export interface ActivePowerup {
  id: string;
  type: 'shield' | 'doublePoints' | 'slowMotion' | 'magnet' | 'fireAsteroid';
  expiresAt: number;
}

export type GraphicsQuality = 'very-low' | 'low' | 'medium' | 'high';
export type Language = 'ar' | 'en';
export type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'heroic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 encoded image
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface InboxItem {
  id: string;
  type: 'coins' | 'powerup' | 'fire_asteroid';
  amount?: number;
  powerupType?: 'shield' | 'doublePoints' | 'slowMotion' | 'magnet';
  title: string;
  description: string;
  timestamp: number;
  isClaimed: boolean;
  source: 'task' | 'leaderboard' | 'store' | 'chest';
}

export interface GameStats {
  totalStars: number;
  totalGames: number;
  highScore: number;
  maxDifficulty: number;
  completedWeeklyTasks: string[];
  weeklyTasks: WeeklyTask[];
  dailyTasks: DailyTask[];
  lastResetTimestamp: number;
  lastWeeklyResetTimestamp: number;
  animationsEnabled: boolean;
  graphicsQuality: GraphicsQuality;
  language: Language;
  coins: number;
  activePowerups: ActivePowerup[];
  dailyChestClaimed: boolean;
  fireAsteroids: number;
  chatSessions: ChatSession[];
  activeChatId: string | null;
  leaderboard: LeaderboardEntry[];
  lastLeaderboardResetTimestamp: number;
  lastLeaderboardUpdateTimestamp: number; // For offline progress
  leaderboardSeed: number;
  inbox: InboxItem[];
  currentLeague: League;
  season: number;
  forgeStats: ForgeStats;
  skyPass: SkyPass;
}

export interface SkyPassTier {
  level: number;
  requiredExp: number;
  reward: {
    type: 'coins' | 'stars' | 'powerup' | 'skin' | 'artifact' | 'stardust';
    amount?: number;
    id?: string;
  };
  proReward?: {
    type: 'coins' | 'stars' | 'powerup' | 'skin' | 'artifact' | 'stardust';
    amount?: number;
    id?: string;
  };
  task?: { ar: string; en: string };
  isClaimed: boolean;
  isProClaimed: boolean;
}

export interface SkyPass {
  level: number;
  exp: number;
  isPro: boolean;
  tiers: SkyPassTier[];
  lastResetTimestamp: number;
}

export interface ForgeModule {
  id: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  type: 'engine' | 'magnet' | 'shield' | 'arsenal' | 'sensor';
}

export interface Expedition {
  id: string;
  type: 'short' | 'medium' | 'long';
  startTime: number;
  duration: number;
  status: 'idle' | 'running' | 'completed';
  rewardClaimed: boolean;
}

export interface Artifact {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isRestored: boolean;
  restorationCost: number;
  starCost?: number;
  buff: {
    type: keyof MetaBuffs;
    value: number;
  };
}

export interface ShipSkin {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  cost: number;
  starCost?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  previewColor: string;
  ability?: { ar: string; en: string };
}

export interface SyndicateStats {
  weeklyDonation: number;
  totalDonation: number;
  currentRank: number;
  lastDonationTimestamp: number;
}

export interface Contract {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  cost: number;
  starCost?: number;
  reward: number;
  type: 'score' | 'stars' | 'time' | 'near_miss' | 'investment' | 'risk';
  targetValue: number;
  currentValue: number;
  isPurchased: boolean;
  isCompleted: boolean;
  isClaimed: boolean;
  rarity: 'easy' | 'medium' | 'hard';
  duration?: number; // For temporary buffs (in games or time)
  remainingGames?: number;
}

export interface ForgeStats {
  stardust: number; // Total stars collected across all time
  modules: {
    engine: number;
    magnet: number;
    shield: number;
    arsenal: number;
    sensor: number;
  };
  expeditions: Expedition[];
  artifacts: Artifact[];
  skins: ShipSkin[];
  activeSkinId: string;
  syndicate: SyndicateStats;
  contracts: Contract[];
}

export interface MetaBuffs {
  speedMultiplier: number;
  magnetRangeBoost: number;
  shieldDurationBoost: number;
  fireAsteroidCooldownReduction: number;
  starValueMultiplier: number;
  riskDifficultyBoost?: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  coins: number;
  stars: number;
  isPlayer?: boolean;
  avatar?: string;
  country?: string;
  lastActive?: number;
  previousRank?: number;
  
  // Bot Behavior Properties
  baseSkill?: number;
  growthRate?: number;
  variability?: number;
  streakChance?: number;
  slumpChance?: number;
  comebackChance?: number;
  rankBias?: number;
  maxDailyGain?: number;
  minDailyGain?: number;
  scoreFloor?: number;
  scoreCeiling?: number;
  activityLevel?: number;
  consistency?: number;
  volatility?: number;
  
  // Internal state for simulation
  currentStatus?: 'normal' | 'streak' | 'slump';
  statusExpiry?: number;
}
