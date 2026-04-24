# Enemyskin: Last Shape Standing

Browser-based top-down action roguelite. The core fantasy: every enemy you defeat becomes a form you can morph into. Morphing is slow and vulnerable, so choosing *when* to swap is the tactical decision. Death wipes all captured forms.

## Running it

No build step. Open `index.html` directly, or serve the folder with any static server:

```
python -m http.server 8000
# then visit http://localhost:8000
```

Everything runs in the browser. No dependencies, no package.json, no framework.

## File map

- `index.html` — DOM: canvas, HUD, mobile touch UI, death overlay, help panel. No logic.
- `styles.css` — HUD layout, bars, form chips, mobile joystick/buttons, death overlay. Mobile breakpoint at 600px hides the help panel.
- `game.js` — **all game logic in one file**, organized into labeled sections from top to bottom.

## Architecture

Single game loop (`loop()` in `game.js`) ticks everything each frame:

1. `stepEntity(e, dt)` — per-entity state machine + movement + timers
2. `updateAI(e, dt)` — enemy decision-making
3. Pickup spawn/collect
4. Wave clear / repopulation check
5. Particles, floating text
6. `render()` + `updateHUD()`

### Entities

One shape for both the player and all enemies: `makeEntity(archetype, x, y, team, scale)`. Fields like `hp`, `energy`, `strength`, `state`, `stateT`, `parryCd`, `iFrames` are shared. The player is just an entity with `team: 'player'` plus `forms[]` and `formIdx`.

Entity state machine:
```
idle → windup → swing → idle     (attack)
idle → block (held)              (defense, drains energy trickle)
idle → parry (0.35s window)      (costs 20% on success)
idle → evade (dash + iFrames)    (costs 50% upfront)
idle → morph (0.9s vulnerable)   (player only)
any  → stun (on guard break / successful parry against)
```

### Combat resolution — `dealDamage(attacker, defender)`

Single function handles parry / iFrames / block / raw damage in that order. Respects the energy costs from tweak #2:
- **Parry**: costs 20% of max energy **only on success**; stuns attacker and ripostes.
- **Block**: costs `30% of max energy + attacker.strength` per blocked hit; running out mid-block triggers a guard-break stun.
- **Evade**: costs 50% up front; `iFrames` flag makes hits miss.

### AI target selection — `pickNearestTarget(e)`

Two passes:
1. Nearest hostile of a different team, biased toward the player (×0.6 distance weight).
2. Nearby different-species enemies inside 240px (×0.7 weight).

Keep both passes in sync with the hit-test in `updateSwing` — the swing filters friendly fire, but allows enemy-vs-enemy hits when archetypes differ.

### Forms & morph

`player.forms[]` — each entry is a stat snapshot (`hp, str, agi, mob, jump, def, ability, color, label`). `cycleForm()` flips to the next index, sets `state = 'morph'` for 0.9s during which the player is vulnerable. `applyForm()` swaps stats when the animation completes, preserving current HP/energy as ratios.

New forms are captured in `kill()` — only when `killer === player` and that archetype isn't already owned.

### World — infinite expansion

`WORLD.{minX,maxX,minY,maxY}` — plain rectangle. `maybeExpandWorld(p)` runs during player movement; if the player is within 400px of any bound, that side grows by 1500px. The grid floor is drawn relative to the camera so expansion is seamless.

### Waves & scaling

`wave` and `threat` are separate counters — both tick up per cleared wave. `spawnWave()` multiplies archetype base stats by `1 + (threat-1) * 0.12 + (forms-1) * 0.08`, so the game also scales against how many forms the player has collected, not just wave count.

### Pickups

`trySpawnPickup(dt)` fires every 30–120s (per spec). It retries 12 candidate positions to keep new pickups ≥320px from other pickups and ≥200px from any entity. If no valid spot exists, it retries in one second.

## Input

Two parallel paths:
- **Keyboard/mouse**: WASD move, mouse aim, LMB/Space attack, Shift block, E/RMB parry, F evade, C/Ctrl sprint, Q/Tab morph.
- **Touch**: auto-detected via `pointer: coarse`. Virtual joystick (left) + action buttons (right). Facing follows move direction on touch, mouse cursor on desktop.

Both paths feed into the same `tryAttack` / `tryBlock` / `tryParry` / `tryEvade` / `cycleForm` functions — input is a thin adapter, not branching game logic.

## Invariants worth preserving

- **Energy costs live in `dealDamage()`**, not in the action starters. Parry and block are "attempts" — the cost is only charged when they matter. If you move these, guard-break behavior breaks.
- **Morph must stay vulnerable.** No iFrames during `state === 'morph'`, and sprint is gated to `state === 'idle'` so the player can't run away out of the animation.
- **Player keeps firing even at 0 HP** until the death overlay appears — `entities` filter preserves the player. Don't simplify that filter without adding an alternate death path.
- **Pickup spacing uses squared distance** (`dist2`) in tight loops. Don't swap to `dist()` without checking hot-path cost.
- **Single archetypes table** (`ARCHETYPES`) is the source of truth for stats, colors, and labels. Adding a new enemy = one entry there + one name in `ENEMY_POOL` + optional decoration branch in `drawArchetypeDeco()`.

## Conventions

- No framework, no bundler, no transpile. Plain ES2020 works in every evergreen browser.
- `dt` is seconds, clamped to 0.05 max per frame. Don't mix millisecond timers into entity state.
- Tag log messages with `'good' | 'bad' | 'neutral'` so combat-log coloring stays consistent.
- Never use emojis in code, UI text, or logs.
