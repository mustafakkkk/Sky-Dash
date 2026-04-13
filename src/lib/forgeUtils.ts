import { ForgeStats, MetaBuffs, Expedition } from '../types';

export const FORGE_CONFIG = {
  engine: {
    name: { ar: 'وحدة المحرك', en: 'Engine Module' },
    description: { ar: 'زيادة سرعة حركة المركبة بنسبة 1% لكل مستوى.', en: 'Increases player movement speed by 1% per level.' },
    maxLevel: 10,
    baseCost: 100,
    starCost: 6,
    costMultiplier: 1.4,
  },
  magnet: {
    name: { ar: 'وحدة المغناطيس', en: 'Magnet Module' },
    description: { ar: 'زيادة مدى جذب النجوم بنسبة 5% لكل مستوى.', en: 'Increases star attraction range by 5% per level.' },
    maxLevel: 10,
    baseCost: 150,
    starCost: 10,
    costMultiplier: 1.5,
  },
  shield: {
    name: { ar: 'وحدة الدرع', en: 'Shield Module' },
    description: { ar: 'زيادة مدة الدروع المكتسبة بنسبة 10% لكل مستوى.', en: 'Increases duration of acquired shields by 10% per level.' },
    maxLevel: 5,
    baseCost: 400,
    starCost: 24,
    costMultiplier: 1.8,
  },
  arsenal: {
    name: { ar: 'وحدة الترسانة', en: 'Arsenal Module' },
    description: { ar: 'تقليل وقت انتظار الكويكبات النارية بنسبة 5% لكل مستوى.', en: 'Reduces fire asteroid cooldown by 5% per level.' },
    maxLevel: 8,
    baseCost: 250,
    starCost: 18,
    costMultiplier: 1.6,
  },
  sensor: {
    name: { ar: 'وحدة الاستشعار', en: 'Sensor Module' },
    description: { ar: 'زيادة قيمة النجوم المجمعة بنسبة 2% لكل مستوى.', en: 'Increases the value of collected stars by 2% per level.' },
    maxLevel: 10,
    baseCost: 150,
    starCost: 12,
    costMultiplier: 1.3,
  }
};

export const EXPEDITION_TYPES = {
  short: {
    name: { ar: 'استكشاف قريب', en: 'Short Expedition' },
    duration: 1 * 60 * 60 * 1000, // 1 hour
    cost: 10,
    rewardRange: { min: 15, max: 25 },
  },
  medium: {
    name: { ar: 'رحلة مدارية', en: 'Orbital Journey' },
    duration: 4 * 60 * 60 * 1000, // 4 hours
    cost: 30,
    rewardRange: { min: 50, max: 80 },
  },
  long: {
    name: { ar: 'بعثة الفضاء العميق', en: 'Deep Space Mission' },
    duration: 12 * 60 * 60 * 1000, // 12 hours
    cost: 80,
    rewardRange: { min: 150, max: 250 },
  }
};

export const calculateUpgradeCost = (type: keyof ForgeStats['modules'], currentLevel: number): { coins: number, stars: number } => {
  const config = FORGE_CONFIG[type];
  const coins = Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
  const stars = Math.floor(config.starCost * Math.pow(1.2, currentLevel));
  return { coins, stars };
};

export const getMetaBuffs = (stats: ForgeStats): MetaBuffs => {
  const baseBuffs: MetaBuffs = {
    speedMultiplier: 1 + (stats.modules.engine * 0.01),
    magnetRangeBoost: stats.modules.magnet * 0.05,
    shieldDurationBoost: stats.modules.shield * 0.1,
    fireAsteroidCooldownReduction: stats.modules.arsenal * 0.05,
    starValueMultiplier: 1 + (stats.modules.sensor * 0.02),
    riskDifficultyBoost: 0
  };

  // Add Artifact Buffs
  stats.artifacts.forEach(artifact => {
    if (artifact.isRestored) {
      if (artifact.buff.type === 'speedMultiplier' || artifact.buff.type === 'starValueMultiplier') {
        baseBuffs[artifact.buff.type] += artifact.buff.value;
      } else if (artifact.buff.type !== 'riskDifficultyBoost') {
        baseBuffs[artifact.buff.type] += artifact.buff.value;
      }
    }
  });

  // Add Active Contract Buffs
  stats.contracts.forEach(contract => {
    if (contract.isPurchased && !contract.isClaimed) {
      if (contract.id === 'stardust_venture' && contract.remainingGames && contract.remainingGames > 0) {
        baseBuffs.starValueMultiplier *= 1.2;
      }
      if (contract.id === 'void_risk' && !contract.isCompleted) {
        baseBuffs.riskDifficultyBoost = 0.1; // 10% faster speed increase
      }
    }
  });

  // Add Syndicate Bonus (Global Multiplier)
  let syndicateMultiplier = 1.0;
  if (stats.syndicate.totalDonation >= 1000000) syndicateMultiplier = 1.5;
  else if (stats.syndicate.totalDonation >= 250000) syndicateMultiplier = 1.25;
  else if (stats.syndicate.totalDonation >= 50000) syndicateMultiplier = 1.1;

  baseBuffs.starValueMultiplier *= syndicateMultiplier;

  return baseBuffs;
};

export const updateExpeditions = (expeditions: Expedition[]): Expedition[] => {
  const now = Date.now();
  return expeditions.map(exp => {
    if (exp.status === 'running' && now >= exp.startTime + exp.duration) {
      return { ...exp, status: 'completed' };
    }
    return exp;
  });
};
