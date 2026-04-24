# 🧬 Mimicry: Procedural Morphing Arena

**Mimicry** is a top-down Action-Roguelike prototype where the player evolves by absorbing the "Essence" of defeated enemies. Rather than traditional leveling, the player gains power by swapping their physical form to match the strengths of the creatures they have conquered.

## 🕹️ Gameplay Mechanics

### 1. The Morphing System
- **Absorption**: When an enemy is defeated, it drops a colored **Essence**. Collecting this essence adds that enemy's unique stat-profile to the player's library.
- **Stat Shifting**: Every form changes the player's:
  - `Speed`: Movement velocity.
  - `Power`: Damage dealt per attack.
  - `Radius`: The physical size (affects attack reach and hit-box).
- **The Vulnerability Window**: Morphing is not instant. Switching forms triggers a "Morphing State" where the player is immobile and takes **2x damage**, forcing strategic timing during combat.

### 2. Combat & Survival
- **Attack**: Close-quarters area-of-effect (AOE) strikes.
- **Block/Parry**: Holding the block key reduces incoming damage by 80%.
- **Scaling**: The world is dynamic. Every time the arena is cleared, a new wave spawns. Enemies scale in HP and Strength based on the `waveLevel`.
- **Permadeath**: Death is final. Dying resets the library and the wave progress.

## 🎮 Controls
| Key | Action | Effect |
| :--- | :--- | :--- |
| **WASD** | Movement | Move the player around the arena. |
| **Space** | Attack | Deals damage based on current form's Power. |
| **Shift** | Block | Reduces incoming damage. |
| **1-5** | Quick-swap | Instantly triggers morph to a saved essence. |
| **Mouse** | UI Swap | Click the colored slots at the bottom to morph. |

## 🛠️ Technical Architecture
- **Engine**: Vanilla JavaScript / HTML5 Canvas.
- **Pattern**: Object-Oriented Programming (OOP).
- **Key Classes**:
    - `Entity`: Base class for shared physics and health.
    - `Player`: Manages the `forms` array and morphing state logic.
    - `Enemy`: Generates procedural stats using `Math.random()` and `waveLevel`.
    - `Essence`: A data-carrier object that transfers stats from Enemy to Player.

## ⚙️ Tuning Guide
To balance the game, modify these constants in the script:
- `MORPH_TIME`: Increase/Decrease the vulnerability window (ms).
- `BASE_STATS`: Change the starting player strength.
- `spawnWave()`: Adjust the loop count to change enemy density.