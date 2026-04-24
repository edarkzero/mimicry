# Unity Build Prompt

Use this prompt to recreate or expand `Enemyskin` in Unity.

```md
Build a playable Unity action roguelite prototype called "Enemyskin: Last Shape Standing".

Game premise:
- The player defeats enemies and steals their forms.
- Every captured enemy becomes a playable morph option for the current run.
- Each form changes stats, movement behavior, defense profile, and a special trait.
- Morphing is powerful but unsafe: it has a transformation animation that leaves the player vulnerable.
- If the player dies, the run resets and captured forms are lost.
- Enemies become stronger as the player's run power increases.
- If the map is cleared, enemies automatically respawn or repopulate in a stronger wave.
- If the player reaches the edge of the current field, generate or stream more field so the map keeps expanding.

Required gameplay systems:
- Top-down real-time combat
- Melee attacks with readable arcs or hit windows
- Block, parry, evade, sprint, and morph for the player
- Block, parry, and evade for enemies
- Manual morph swapping between captured forms
- Enemy archetypes and mutation traits
- Endless scaling loop with automatic repopulation
- Random pickups for health, energy, or both
- Enemy AI that can fight other nearby entities instead of only chasing the player

Energy system requirements:
- Every combatant has an energy or stamina resource.
- Evade consumes 50% of the maximum energy pool.
- Parry consumes 20% of the maximum energy pool when the parry is used.
- Blocking consumes 30% of the maximum energy pool per blocked hit plus a percentage equal to the attacker's strength stat.
- Energy regenerates over time.
- Low energy must meaningfully limit defense.

Gameplay requirements:
- Forms must meaningfully differ in strength, agility, mobility, jump or traversal power, and guard
- Forms can include humans, beasts, monsters, constructs, specters, or any other strong creature concepts
- Some forms should be tanky, some evasive, some fast, some poisonous, some vampiric, some blink-based
- The player should be encouraged to change forms during combat, not only between fights
- Sprint should improve movement while held
- Pickups should spawn at irregular intervals, roughly every 30 to 120 seconds, and stay spaced apart

Implementation goals:
- Produce a playable prototype first
- Use a modular architecture that is easy to expand
- Separate tuning data from runtime behavior
- Make it easy to add new enemy forms and mutations without rewriting combat logic
- Keep energy tuning, pickups, and world-growth rules data-driven too

Recommended Unity structure:
- `GameManager`
- `WaveManager`
- `PickupManager`
- `WorldExpansionManager`
- `CombatResolver`
- `PlayerController`
- `EnemyController`
- `MorphManager`
- `HUDController`
- `PickupController`
- `FormDefinition` as ScriptableObject
- `MutationDefinition` as ScriptableObject
- `AIProfile` as ScriptableObject
- `PickupDefinition` as ScriptableObject

Recommended Unity patterns:
- Use `ScriptableObject` assets for archetypes, mutations, AI profiles, and balance tables
- Use a clear combat state model so attack, block, parry, evade, hit stun, and morph states do not conflict
- Use animation events or timed state windows for attack and parry resolution
- Keep all derived combat formulas centralized
- Use prefabs for enemies, pickups, and placeholder visuals early

Data model requirements:
- Form definition:
  - name
  - species
  - base stats
  - movement modifiers
  - special trait
  - visuals
- Mutation definition:
  - prefix or suffix
  - stat modifiers
  - special effect
  - VFX color
  - threat modifier
- Captured form runtime data:
  - resolved name
  - resolved stats
  - resolved combat values
  - rarity or threat rating if useful
- Pickup definition:
  - type
  - health restore amount
  - energy restore amount
  - spawn interval range or weight
- World expansion tuning:
  - trigger margin
  - chunk size
  - generation rule

Combat behavior requirements:
- Blocking reduces damage and can still create chip pressure
- Parry should be a short high-reward window
- Evade should provide repositioning and brief safety, but not infinite spam
- Morphing should temporarily remove or limit defense
- Sprint should increase movement speed while held
- Enemy AI should react to nearby threats and occasionally defend intelligently
- Enemy AI should choose the nearest relevant target instead of assuming the player is always the only target
- Low-energy defenders should be vulnerable to guard breaks

UI requirements:
- Health bar
- Energy bar
- Current form name and special ability
- Current stats
- Captured form list or carousel
- Enemy count
- Wave or threat indicator
- Combat log or floating event feedback
- On mobile or touch targets, show touch controls for move, attack, guard, evade, sprint, morphing, and restart if needed

Visual and feel requirements:
- Readable attack telegraphs
- Strong hit feedback
- Distinct silhouette per form
- Clear player readability in crowded combat
- A memorable transformation effect for morphing
- Pickups should be easy to spot
- Energy drain and guard-break moments should be visually clear

Deliverables:
- A playable Unity prototype
- Organized prefabs and ScriptableObject assets
- Cleanly separated systems for combat, forms, scaling, pickups, and world growth
- A short README that explains controls and tuning locations
```

## Suggested Unity Notes

- A 2D URP top-down setup is enough for the first pass
- Start with primitive visuals and focus on combat timing
- Prefer small reusable state components over one oversized controller script
- Keep enemy scaling readable and exposed in inspector-friendly data

## Good Follow-Up Prompt

```md
After the prototype is stable, expand it with elites, bosses, biome arenas, progression relics, better enemy-vs-enemy faction behavior, stronger audiovisual feedback, richer pickups, and better form synergy without breaking the data-driven foundation.
```
