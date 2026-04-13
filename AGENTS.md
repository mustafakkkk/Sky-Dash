# Sky Dash Game Mechanics & Systems

This document serves as a persistent knowledge base for the Sky Dash game mechanics, ensuring the AI assistant is fully aware of the game's progression and pacing systems.

## 1. Sector System (Environmental Progression)
The game progresses through different "Sectors" based on the player's score. Each sector has a unique visual theme (background colors) and difficulty profile.

| Sector | Name | Score Range | Visual Theme |
| :--- | :--- | :--- | :--- |
| **1** | The Atmosphere | 0 - 999 | Deep Blue / Slate |
| **2** | Purple Nebula | 1000 - 2499 | Deep Purple / Violet |
| **3** | Asteroid Belt | 2500 - 4999 | Dark Red / Maroon |
| **4** | Deep Space | 5000+ | Near Black / Dark Navy |

## 2. Dynamic Pacing System (Intensity Waves)
The game alternates between different pacing states every 25 seconds (for NORMAL) or 12 seconds (for INTENSE/RECOVERY) to keep the gameplay dynamic.

- **NORMAL:** The standard game rhythm.
- **INTENSE:** 
    - Faster enemy movement.
    - Higher spawn rates for drones and spaceships.
    - Higher star value (points).
    - Visual cue: Rose-colored UI indicator.
- **RECOVERY:** 
    - Slower enemy movement.
    - Fewer enemies, more clouds and stars.
    - Higher chance for Power-ups (Shield, Magnet, Slow Motion).
    - Visual cue: Emerald-colored UI indicator.

## 3. Combo System (Skill Reward)
- **Trigger:** Successfully performing a "near-miss" (dodging an enemy at very close range).
- **Multiplier:** Each near-miss increases the combo multiplier (x1, x2, x3...).
- **Bonus:** Stars collected while a combo is active grant significantly more points.
- **Decay:** The combo resets to zero if no near-miss is performed for **3 seconds**.
- **Visuals:** Floating combo text appears on the right side of the screen.

## 4. Leaderboard System (Cumulative Progression)
- **Basis:** The leaderboard is based on **Cumulative Points** (Total Score), not the high score of a single round.
- **Progression:** Every point earned in every game adds to the player's total standing.
- **Competition:** Bots also accumulate points over time, simulating active players.
- **Leagues:** Players compete in different leagues (Bronze, Silver, Gold, etc.) based on their total score.

## 5. Enemy Types & Behavior
- **Asteroids:** Basic obstacles falling vertically.
- **Drones:** Faster enemies that appear after 1000 points.
- **Spaceships (UFOs):** Move horizontally and shoot projectiles. Appear after 500 points.
- **Projectiles:** Shot by spaceships, must be dodged or destroyed with Fire Asteroids.

## 5. Power-ups
- **Shield:** Protects from one collision.
- **Magnet:** Pulls nearby stars toward the player.
- **Slow Motion:** Slows down time for all objects except the player.
- **Fire Asteroid:** A collectible weapon (Red Button) that allows the player to shoot and destroy enemies.

## 6. Technical Notes
- **Canvas Resolution:** 400x600 (scaled responsively).
- **Collision Detection:** Circle-based for most objects, AABB for some.
- **Performance:** Graphics quality settings (Low, Medium, High) adjust particle counts and visual effects.
