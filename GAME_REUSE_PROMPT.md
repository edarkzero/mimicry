# Enemyskin Reuse Prompt

Use this file when you want to recreate, extend, or hand off this game concept to another AI, developer, or engine setup.

Related files:

- [README.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/README.md:1)
- [GAME_DESIGN_DOCUMENT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/GAME_DESIGN_DOCUMENT.md:1)
- [GODOT_BUILD_PROMPT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/GODOT_BUILD_PROMPT.md:1)
- [UNITY_BUILD_PROMPT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/UNITY_BUILD_PROMPT.md:1)

## Short Pitch

Create a fast-paced action roguelite game where the player can morph into any enemy they defeat. Each captured enemy becomes a reusable form with different stats and abilities. Morphing is powerful, but it has an animation that leaves the player vulnerable. If the player dies, the run resets completely. Enemies scale with the player, and when the map is empty, new enemies repopulate it automatically.

## Reusable Prompt

```md
Build a playable action roguelite prototype called "Enemyskin: Last Shape Standing".

Core concept:
- The player fights enemies in an arena or explorable map.
- Every enemy has a species, stat profile, and one or more special abilities.
- When the player defeats an enemy, they capture that enemy's essence or form.
- The player can switch at will between any captured forms.
- Morphing must not be instant: it should trigger a visible transformation animation and make the player vulnerable until it finishes.
- If the player dies, the run resets and all captured forms are lost.

Combat requirements:
- Real-time combat.
- The player can attack, block, parry, and evade.
- Enemies can also attack, block, parry, and evade.
- Successful parries should punish the attacker.
- Evades should grant brief survivability, but not be free to spam.
- Blocking should reduce damage but still allow pressure and guard-based playstyles.

Morph system requirements:
- Each enemy form should have a unique combination of stats such as strength, agility, mobility, jump power, defense/guard, and at least one random or archetype-specific trait.
- Different enemy types can be humans, monsters, beasts, constructs, specters, or any creature type that fits the world.
- Captured forms should feel meaningfully different, not just cosmetic.
- Some forms should be heavy and tanky, others fast, evasive, high-jump, aggressive, poisonous, vampiric, blink-based, etc.
- The player should be encouraged to swap forms mid-run based on the situation.

Progression and difficulty:
- The stronger the player becomes, the stronger future enemies become too.
- Enemy scaling should react to the player's current power and/or total number of captured forms.
- If no enemies remain on the map, the game should automatically repopulate the arena with stronger or remixed enemies.
- The game loop should support endless waves or endless repopulation.

Gameplay feel:
- Make the combat readable and satisfying.
- Use clear telegraphs for attacks, blocks, parries, morphing, and evasions.
- Make each form visually distinct.
- Add hit effects, impact feedback, health bars, and UI indicators for the current form and captured forms.
- The game should immediately feel playable and understandable.

Suggested player systems:
- Base player shell at the start of the run.
- Captured-form inventory or carousel.
- HUD showing health, current form, stats, special ability, number of captured forms, wave/threat level, and combat log.
- Restart flow after death.

Suggested enemy archetypes:
- Duelist: balanced human fighter with good parry timing.
- Brute: slow heavy monster with high strength and guard.
- Stalker: fast beast with high mobility and aggression.
- Hopper: high-jump creature with leap pressure.
- Shade: evasive specter with blink or fast dodge behavior.
- Sentinel: defensive construct with strong blocking and durability.

Technical goal:
- Deliver a playable prototype first, then polish.
- Keep systems modular so new enemy forms and mutations can be added easily.
- Separate data for enemy archetypes, random mutations, scaling rules, combat resolution, and UI.
```

## Current Prototype Summary

The local browser prototype already includes these systems:

- Real-time top-down arena combat
- Attack, block, parry, and evade for player and enemies
- Captured enemy essences as swappable forms
- Vulnerable morph animation before a form change completes
- Permadeath run reset
- Multiple enemy archetypes and mutation-based abilities
- Dynamic enemy scaling as the run grows stronger
- Automatic wave repopulation when the map is cleared
- HUD for health, current form, captured forms, wave, threat, and combat log

## Good Reuse Targets

This prompt works well for:

- A new browser prototype in HTML/CSS/JavaScript
- A Godot action roguelite prototype
- A Unity combat sandbox
- A top-down or side-view combat game
- An AI-assisted design handoff for a fuller vertical slice

## Optional Upgrade Prompt

If you want a stronger second-pass prompt, append this:

```md
Expand the prototype into a deeper roguelite with biome-based arenas, elite enemies, bosses, procedural enemy mutations, animation polish, sound hooks, saveable meta-progression, and clearer form-synergy builds. Keep the morphing system as the central mechanic and make every captured form a meaningful tactical choice.
```
