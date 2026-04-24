# Enemyskin Reuse Prompt

Use this file when you want to recreate the latest version of the game with another AI, another engine, or another codebase.

Related files:

- [README.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/README.md:1)
- [GAME_DESIGN_DOCUMENT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/GAME_DESIGN_DOCUMENT.md:1)
- [GODOT_BUILD_PROMPT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/GODOT_BUILD_PROMPT.md:1)
- [UNITY_BUILD_PROMPT.md](C:/Users/Edgar/Documents/Codex/2026-04-23/let-s-create-a-game-where/UNITY_BUILD_PROMPT.md:1)

## Short Pitch

Create a fast-paced action roguelite where the player steals the body of any defeated enemy and swaps between captured forms during combat. Every form changes stats and special traits. Morphing is powerful but unsafe because it takes time and leaves the player vulnerable. All combat actions are gated by energy, enemies can fight each other instead of only tunnel-visioning the player, pickups drop at random intervals, the world expands when the player reaches the edge, and the whole run resets on death.

## Copy-Ready Master Prompt

```md
Build a playable action roguelite prototype called "Enemyskin: Last Shape Standing".

Core fantasy:
- The player defeats dangerous enemies and steals their forms.
- Every defeated enemy becomes a reusable morph option for the current run.
- The player survives by adapting to the situation with the right stolen body.
- Morphing is powerful but risky because it takes time and leaves the player vulnerable.
- If the player dies, the run resets and all captured forms are lost.

Core gameplay requirements:
- Real-time combat.
- Top-down or side-view action is fine, but the game must feel readable and responsive.
- The player can attack, block, parry, evade, sprint, and morph.
- Enemies can also attack, block, parry, evade, and reposition.
- Enemies must not only hunt the player. They should also detect and fight other nearby entities so combat feels more alive and chaotic.
- The world should support endless continuation. If the player reaches the edge of the current field, generate or stream more field so the player does not disappear or hard-stop at the boundary.

Energy system requirements:
- Every combatant, including the player and enemies, has an energy or stamina bar.
- Defensive mobility actions consume energy.
- Evade consumes 50% of the current maximum energy pool.
- Parry consumes 20% of the current maximum energy pool when the parry is actually used.
- Blocking consumes 30% of the current maximum energy pool per blocked hit, plus an extra percentage equal to the attacker's strength stat.
- Low energy must prevent or punish overuse of defense.
- Energy should regenerate over time, but not so quickly that defense becomes spammable.

Morph system requirements:
- The player starts with a basic starter shell.
- Each enemy form has meaningful differences in strength, agility, mobility, jump or traversal power, guard, and a special trait.
- Some forms should be heavy and durable, some evasive, some high-jump, some poisonous, some vampiric, some blink-based, some shock-based, etc.
- The player can manually switch between captured forms at will.
- Morphing must play an animation or transformation sequence and leave the player vulnerable until it finishes.
- Captured forms should not feel cosmetic only. They must change combat decisions.

Combat feel requirements:
- Parry should reward timing and punish the attacker.
- Blocking should reduce damage, not trivialize danger.
- Evade should provide brief survivability and repositioning, but not infinite safety.
- Sprint should let the player move faster while a button is held.
- Combat must stay readable with telegraphs, impact feedback, floating indicators, and clear state changes.

Enemy design requirements:
- Enemies can be humans, monsters, beasts, constructs, specters, or any other strong creature concept.
- Use enemy archetypes plus random mutation traits so repeated runs still feel varied.
- Enemies should differ in aggression, defense, mobility, and preferred combat spacing.
- Enemy AI should sometimes defend intelligently instead of always rushing.
- Because enemies can target each other, combat spaces should feel dynamic and occasionally self-destructive.

Progression and world requirements:
- The stronger the player becomes, the stronger future enemies become too.
- Scaling should consider current form power, highest captured form power, number of captured forms, wave depth, or similar threat factors.
- If no enemies remain in the active area, the map should repopulate automatically with stronger or remixed enemies.
- The loop should support endless waves or endless repopulation.
- Random pickups should spawn at irregular intervals, roughly every 30 to 120 seconds.
- Pickups can restore life, energy, or both.
- Pickups should appear away from one another and not flood the map.

UI and platform requirements:
- HUD should show health, energy, current form, current stats, special ability, captured forms, enemy count, wave or threat level, and a combat log or event feed.
- Show health and energy clearly for the player, and ideally readable bars for enemies too.
- If the game is played on mobile or touch devices, replace or supplement keyboard controls with on-screen touch controls for movement, attack, block, evade, sprint, morphing, and restart if needed.
- On desktop, support keyboard and mouse.

Suggested enemy archetypes:
- Duelist: balanced human fighter with strong timing and parry threat.
- Brute: slow heavy monster with high strength and guard.
- Stalker: fast beast with aggressive pursuit and repositioning.
- Hopper: mobile creature with jump-heavy pressure.
- Shade: evasive specter with blink behavior.
- Sentinel: durable construct with superior defense and counterplay.

Technical goals:
- Deliver a playable prototype first, then polish.
- Keep archetypes, mutations, combat formulas, wave generation, pickups, energy tuning, and UI data modular.
- Make it easy to add new forms and new mutations without rewriting the combat core.
- Prefer data-driven structure over hardcoded one-off enemies.
```

## Current Prototype Summary

The latest local prototype already includes these systems:

- Real-time top-down combat
- Attack, block, parry, evade, sprint, and morph
- Shared energy system for player and enemies
- Enemy AI that can target nearby entities instead of only the player
- Captured enemy forms with different stats and mutation traits
- Vulnerable morph animation
- Random pickups for life, energy, or both
- Automatic wave repopulation
- Expanding world bounds when the player reaches the map edge
- Mobile touch controls for move, attack, guard, evade, sprint, and morph
- Permadeath run reset

## Good Reuse Targets

This prompt works well for:

- A new browser prototype in HTML, CSS, and JavaScript
- A Godot action roguelite prototype
- A Unity combat sandbox
- A top-down arena brawler
- A more systemic enemy-vs-enemy action roguelite

## Optional Upgrade Prompt

Append this if you want a stronger second-pass handoff:

```md
Expand the prototype into a deeper roguelite with biome-based arenas, elite enemies, bosses, procedural enemy factions, stronger enemy-vs-enemy behavior, richer loot drops, audiovisual polish, saveable meta-progression, and form-synergy builds. Keep the morphing system as the central mechanic and make every captured form a meaningful tactical choice.
```
