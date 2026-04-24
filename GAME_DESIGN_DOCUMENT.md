# Enemyskin: Last Shape Standing

## High Concept

`Enemyskin` is an action roguelite centered on combat adaptation through stolen enemy forms. Every enemy can become a playable body after defeat. Each body has its own stat profile, movement feel, survivability pattern, and special trait. The player survives by reading the battlefield, choosing the right form, and knowing when a risky morph is worth the danger.

## Vision

The game should feel like a predatory transformation fantasy with high combat clarity. The player is never just collecting skins. They are building a rotating toolkit of bodies, each one stolen from something dangerous.

## Player Fantasy

- I learn enemies by fighting them.
- I turn their strengths into my own.
- I swap bodies to solve different combat problems.
- I survive on timing, not only raw stats.
- Every new kill expands my tactical options.
- One mistake can end the run.

## Pillars

### 1. Combat-Driven Identity

Every form must change gameplay in a meaningful way through stats, spacing, timing, defense profile, mobility, or a special effect.

### 2. Risky Morphing

Morphing is powerful because it is unsafe. The player cannot instantly react to every situation without consequence.

### 3. Escalation Through Adaptation

As the player collects stronger bodies, the world responds. Enemy waves become denser, more varied, and more threatening.

### 4. Readable High-Intensity Action

Even at higher speed and difficulty, telegraphs, hit feedback, and state clarity must remain readable.

## Game Structure

## Run Start

- The player begins in a basic starter shell.
- Only one form is available at first.
- Early enemies are simple enough to teach combat timing and the morph system.

## Core Loop

1. Enter an arena or active zone.
2. Fight enemy groups using melee combat and defensive timing.
3. Defeat enemies and capture their forms.
4. Swap between captured forms to solve the next combat problem.
5. Outgrow the current threat level.
6. Trigger stronger repopulation or the next wave.
7. Continue until death.

## Failure Loop

- Death ends the run.
- Captured forms are lost.
- The player restarts from the base shell.
- Long-term meta-progression is optional and should not invalidate the high-stakes run loop.

## Combat Design

## Core Actions

- Light or primary attack
- Block
- Parry
- Evade / dodge
- Morph

## Combat Intent

Combat should reward timing, spacing, and system knowledge. The player should not be able to win by face-tanking or spam-dodging forever.

## Attack

- Fast enough to feel responsive
- Distinct range and arc based on form
- Telegraphs readable for both player and enemy
- Recovery time matters

## Block

- Reduces incoming damage instead of fully negating everything
- Allows defensive playstyles to exist
- Can still be pressured by heavy or repeated attacks

## Parry

- Tight window at the beginning of a block
- Deflects or punishes the attacker
- Creates strong, high-skill moments
- Enemy AI should occasionally attempt it too

## Evade

- Short invulnerability or displacement window
- Must be limited by cooldown, stamina, or risk profile
- Some forms should have superior evasions such as blink, leap, slide, or shadow dash

## Morph

- Activated by manual player choice
- Has a transformation duration
- Leaves the player vulnerable or partially vulnerable
- Must feel flashy and important
- Encourages foresight instead of panic switching

## Morph System

## Capture Rules

- Defeating an enemy adds its essence to the current run
- The new form becomes available immediately
- Duplicate forms can be handled as duplicates, upgrades, or essence currency depending on scope

## Form Properties

Each form should define:

- Name
- Species or archetype
- Visual silhouette
- Strength
- Agility
- Mobility
- Jump or traversal value
- Guard or defense
- Special trait
- Threat value

## Example Form Identities

- Duelist: balanced fighter with strong parry utility
- Brute: slow heavy monster with high damage and guard
- Stalker: aggressive beast with excellent chase and repositioning
- Hopper: mobile creature with leap pressure and vertical bias
- Shade: evasive specter with blink movement or deception
- Sentinel: durable construct with superior block value

## Mutation Layer

Enemies should not only differ by archetype. Add a second variation layer such as mutations, blessings, infusions, or corruptions.

Examples:

- Feral: gains speed and aggression at low health
- Ironhide: reflects chip damage or reinforces guard
- Blink: stronger dodge with reposition utility
- Vampiric: heals through damage dealt
- Stormbound: creates a shockwave on dodge or heavy strike
- Venom: applies damage over time
- Titan: slower, larger, harder-hitting frame

This makes the same base archetype reusable in many combinations.

## Difficulty and Scaling

## Scaling Principles

- The game should react to the player's growth
- Scaling should feel earned, not rubber-banded in an invisible way
- The player should still feel stronger over time, even as enemies improve

## Scaling Inputs

Possible variables:

- Current equipped form power
- Highest captured form power
- Number of captured forms
- Current wave or arena depth
- Total kills or boss clears

## Repopulation Rules

- If all enemies in the current arena are dead, start a short downtime timer
- Spawn a fresh wave or repopulate the area automatically
- New enemies should reflect the updated threat level
- Later repopulations should increase mixed archetypes and mutation variety

## Enemy Design

## Behavior Goals

Enemies should feel like participants in the same combat language as the player.

They should:

- Approach and reposition intentionally
- React to windups
- Occasionally block or parry
- Evade dangerous telegraphs
- Pressure morph attempts

## AI Roles

- Rushdown: closes gaps quickly and punishes openings
- Tank: absorbs pressure and holds space
- Skirmisher: circles, probes, and retreats
- Duelist: seeks timing contests
- Disruptor: forces movement through leap, blink, poison, or area denial

## Arena and World Structure

The browser prototype uses a single combat arena, but the full game can grow into a chain of arenas or compact biome maps.

Possible environments:

- Ruined fortress
- Cavern nests
- Overgrown temple
- Rotting village
- Crystal machine foundry
- Spectral marsh

Environmental goals:

- Distinct silhouette and atmosphere
- Enough open space for readable combat
- Some obstacles for flanking and spacing
- Optional traversal advantages for certain forms

## UI and Feedback

The player should always understand:

- Current health
- Current form
- Current form stats
- Special ability
- Captured forms
- Enemy count
- Wave or threat level
- Important combat events

Useful feedback elements:

- Attack telegraphs
- Parry flash
- Guard impact sparks
- Evade trails
- Morph silhouettes and distortion effects
- Floating damage numbers
- Combat log for recent events

## Audio Direction

If audio is added later:

- Morphing should have a signature layered transformation sound
- Parries should feel sharp and rewarding
- Heavy forms should sound dense and crushing
- Spectral or blink forms should sound airy and unstable
- Enemy spawn waves should have audible tension cues

## Visual Direction

The game should avoid generic fantasy mush. Enemy forms need instantly readable silhouettes and color signatures.

Art principles:

- Strong shape language per species
- Clear contrast between player and enemy factions
- Distinct accent color per mutation type
- Readable attack arcs and defensive states
- Stylized effects over cluttered realism

## Technical Design

## Recommended Data Separation

Keep these systems data-driven where possible:

- Enemy archetypes
- Mutations
- Derived stat formulas
- Wave generation rules
- Threat scaling
- Combat tuning values

## Suggested Runtime Modules

- Player controller
- Enemy controller
- Combat resolver
- Form inventory / morph manager
- Wave manager
- Spawn manager
- VFX / feedback manager
- HUD controller
- Persistent meta-progression manager if added later

## Progression Extensions

Potential long-term additions:

- Elite enemies with multi-trait forms
- Bosses whose bodies unlock rare transformation rules
- Temporary run relics that modify specific form families
- Skill trees tied to morph risk or form mastery
- Biome-specific enemy pools
- Mid-run altars that fuse or mutate captured forms

## Balance Risks

Key things to watch:

- One form becoming the best answer to every situation
- Morphing being too safe to matter
- Enemy scaling erasing the feeling of growth
- Parry being mandatory instead of expressive
- Visual clutter hiding dangerous states
- Defensive AI making combat too passive

## Prototype-To-Production Roadmap

### Phase 1: Mechanical Prototype

- One arena
- Several enemy archetypes
- Form capture and swapping
- Basic enemy scaling
- Health, hit feedback, and restart loop

### Phase 2: Combat Depth

- Better telegraphs
- Stronger enemy defensive behavior
- Elite variants
- Expanded mutation pool
- Better collision and movement feel

### Phase 3: Content Expansion

- Multiple arenas or biomes
- Boss encounters
- Progression rewards
- Better audiovisual identity

### Phase 4: Retention Layer

- Meta-progression
- Unlocks
- Challenge modifiers
- Run history or codex

## Success Criteria

The game is succeeding when:

- Players quickly understand why each form matters
- Morphing decisions feel tense and smart
- Defensive actions create highlight moments
- Enemy waves remain fresh through combinations and scaling
- Losing a run feels fair and motivating instead of empty

## One-Sentence Design North Star

Defeat dangerous creatures, steal their bodies, and survive a run where your best tool is always the enemy you just learned how to kill.
