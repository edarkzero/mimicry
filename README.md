# Enemyskin: Last Shape Standing

An action roguelite prototype where every defeated enemy can become your next body.

The core idea is simple: kill an enemy, capture its essence, and switch into that form when it helps you most. Each form changes your stats and special ability, but morphing is not safe. During the transformation, you are exposed and can be interrupted or killed. If you die, the entire run resets.

## Prototype Status

This repository currently contains a standalone browser prototype built with plain HTML, CSS, and JavaScript.

Included systems:

- Real-time top-down combat
- Player and enemy attack, block, parry, and evade
- Captured enemy forms that can be swapped mid-run
- Vulnerable morph animation
- Multiple enemy archetypes and mutation traits
- Dynamic enemy scaling as the run gets stronger
- Automatic wave repopulation when the map is cleared
- Run reset on death

## How To Run

Open [index.html](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/index.html:1) in a browser.

No build step or install is required for the current prototype.

## Controls

- `WASD`: move
- `Mouse`: aim
- `Left Click` or `F`: attack
- `Right Click` or `Shift`: block / parry
- `Space`: evade
- `Q` / `E` or `Mouse Wheel`: switch captured forms
- `R`: restart after death

## Project Files

- [index.html](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/index.html:1): HUD and canvas shell
- [styles.css](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/styles.css:1): visual treatment and responsive layout
- [game.js](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/game.js:1): combat, AI, morphing, scaling, and rendering

## Reuse Pack

If you want to rebuild or expand the idea in another stack, use these files:

- [GAME_REUSE_PROMPT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/GAME_REUSE_PROMPT.md:1): short reusable pitch and general AI prompt
- [GAME_DESIGN_DOCUMENT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/GAME_DESIGN_DOCUMENT.md:1): fuller design and production-facing breakdown
- [GODOT_BUILD_PROMPT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/GODOT_BUILD_PROMPT.md:1): engine-specific prompt for a Godot implementation
- [UNITY_BUILD_PROMPT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/UNITY_BUILD_PROMPT.md:1): engine-specific prompt for a Unity implementation

## Design Summary

The fantasy of the game is not just "copy enemies." The player should feel like a scavenger predator that assembles a run from stolen bodies. A fast evasive form may be perfect for surviving pressure, while a heavy guard-focused form may be better for a parry duel or a crowded wave. Switching bodies is a tactical risk, not a menu action.

The best versions of this game should emphasize:

- Strong combat readability
- Distinct form identities
- Reactive enemy behavior
- Constant tension between greed and survival
- Endless escalation without losing clarity

## Suggested Next Steps

- Add elite enemies and bosses with unique morphable signatures
- Add biomes or arenas with traversal differences
- Add audiovisual polish for morph transitions and parry moments
- Add meta-progression while keeping run-based resets
- Move data into external config files for easier balancing

## License / Reuse

Treat this workspace as a prototype and design seed. Reuse the idea, the prompt pack, or the implementation as a starting point for a larger project.
