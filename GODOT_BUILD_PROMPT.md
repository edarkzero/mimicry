# Godot Build Prompt

Use this prompt to recreate or expand `Enemyskin` in Godot.

```md
Build a playable Godot 4.x action roguelite prototype called "Enemyskin: Last Shape Standing".

Game premise:
- The player can morph into any enemy they defeat.
- Every captured enemy becomes a reusable playable form.
- Each form has different stats, movement feel, combat properties, and a special trait.
- Morphing has a visible animation and leaves the player vulnerable until it completes.
- If the player dies, the run resets and all captured forms are lost.
- Enemies scale upward as the player becomes stronger.
- If the current map is empty, enemies should repopulate automatically.
- If the player reaches the edge of the current field, generate or stream more field so the run can continue outward.

Required gameplay:
- Top-down real-time melee combat
- Attack, block, parry, evade, sprint, and morph for the player
- Attack, block, parry, and evade for enemies
- Enemy archetypes that can be human, monster, beast, construct, specter, or other creatures
- Multiple enemy stat profiles including strength, agility, mobility, jump, and guard
- Randomized mutation traits such as blink, venom, vampiric, titan, stormbound, or ironhide
- Manual form switching through a captured-form carousel or hotkeys
- Vulnerable morph transition
- Endless repopulation or wave-based escalation
- Random pickups that restore health, energy, or both
- Enemies that can target nearby enemies and not only the player

Energy system requirements:
- Every combatant has an energy or stamina pool.
- Evade consumes 50% of the maximum energy pool.
- Parry consumes 20% of the maximum energy pool when the parry is used.
- Blocking consumes 30% of the maximum energy pool per blocked hit, plus a percentage equal to the attacker's strength stat.
- Energy regenerates over time.
- Low energy should restrict defensive options and create guard-break pressure.

Implementation goals:
- Deliver a playable prototype first, then polish
- Keep combat readable
- Keep data modular and easy to extend
- Use Resources or data files for enemy archetypes and mutations
- Build the project so adding new forms is mostly data entry
- Keep world growth, pickups, and energy tuning data-driven too

Recommended scene structure:
- `Main.tscn`
- `Arena.tscn`
- `Player.tscn`
- `Enemy.tscn`
- `Pickup.tscn`
- `HUD.tscn`
- `MorphManager.gd`
- `CombatResolver.gd`
- `WaveManager.gd`
- `PickupManager.gd`
- `WorldExpansionManager.gd`
- `GameState.gd` as an autoload if needed

Recommended Godot patterns:
- Use `CharacterBody2D` for player and enemies
- Use `NavigationAgent2D` only if needed; otherwise prefer simpler steering for prototype speed
- Use `AnimationPlayer` or `Tween` for morph transitions, evade bursts, and hit feedback
- Use `Resource` files for enemy archetypes, mutations, and tuning tables
- Use signals for death, morph complete, wave cleared, form captured, pickup collected, and field expanded
- Keep combat formulas centralized instead of duplicating them in player and enemy scripts

Data model requirements:
- Enemy archetype resource:
  - name
  - species
  - color or visual theme
  - base stats
  - AI behavior profile
  - silhouette or sprite reference
- Mutation resource:
  - modifier name
  - stat modifiers
  - special effect type
  - VFX color
  - threat bonus
- Captured form instance:
  - final display name
  - resolved stats
  - special ability
  - derived combat values
- Pickup definition:
  - type
  - restore health amount
  - restore energy amount
  - spawn rarity or timing weight
- World expansion tuning:
  - expand distance
  - chunk size
  - biome or tile generation rule

Combat behavior requirements:
- Blocking reduces damage but does not make the target invincible
- Parry is a short opening at the start of a block and should punish attackers
- Evade grants brief safety and repositioning, with cooldown
- Morphing prevents full defensive reaction during the animation
- Sprint should increase movement speed while held
- Enemy AI should sometimes use block, parry, and evade instead of only rushing
- Enemy AI should choose the nearest relevant combat target instead of hardcoding the player as the only target
- If energy is too low to defend, the AI should become vulnerable or change behavior

UI requirements:
- Health bar
- Energy bar
- Current form name
- Current form stats
- Current special ability
- Captured forms list
- Wave or threat display
- Enemy count
- Combat event feed
- Touch controls on mobile for movement, attack, block, evade, sprint, morphing, and restart if needed

Visual direction:
- Distinct shape language for each archetype
- Clear telegraphs for attacks and parries
- Strong transformation effect during morphing
- Readable player highlight so the active body is never lost in the chaos
- Make pickups readable from a distance
- Make energy pressure and guard-break moments obvious

Deliverables:
- A playable Godot project
- Clean scene organization
- Data-driven enemy and mutation setup
- Comments only where helpful
- A short README explaining controls and where to tune forms, combat, energy, pickups, waves, and world growth
```

## Suggested Godot Notes

- Use a small set of placeholder shapes or sprites first
- Drive state transitions through an explicit state machine or clear action flags
- Keep derived stats in one place so balancing stays consistent
- Put archetypes and mutations under a `data/` or `resources/` folder

## Good Follow-Up Prompt

```md
After the base prototype works, add elite enemies, boss fights, biome-themed arenas, faction behavior, better enemy-vs-enemy encounters, richer pickup variety, sound hooks, saveable run stats, and cleaner morph VFX without rewriting the core data model.
```
