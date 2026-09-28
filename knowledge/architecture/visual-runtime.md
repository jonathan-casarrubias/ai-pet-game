# Visual Runtime Architecture

**Status:** Approved for Slice #7 technical spike  
**Scope:** AI Pet Game — visual and playable client architecture

## 1. Purpose

This document defines the architectural direction for the visual runtime of the AI Pet Game. It establishes the boundaries between the authoritative Game Core, the MVP Runtime, gameplay generation, presentation, and the client renderer.

This document is intentionally focused on the architecture needed to build a playable visual vertical slice. It is not a final art-direction specification, production asset pipeline, mobile deployment guide, or irreversible commitment to a specific rendering technology.

The goal of Slice #7 is not to build a static UI prototype. It is to prove that the game's AI-driven gameplay can become a modern, attractive, interactive visual experience across **iOS, Android, and Web**.

---

## 2. Product Goal for the Visual Runtime

The MVP experience should feel like a real, modern game from the moment it opens.

The intended basic experience is:

```text
Open app
   ↓
Pet appears immediately
   ↓
Player sees a living game world
   ↓
Player interacts with the world / pet
   ↓
AI generates bounded gameplay
   ↓
Game Core validates and accepts the gameplay
   ↓
Accepted gameplay becomes presentation state
   ↓
World / pet / objects / effects visibly respond
   ↓
Player continues playing
```

The AI must therefore be materially visible in the gameplay experience. It must not be reduced to a text chatbot embedded inside a game UI.

---

## 3. Architectural Authority

The existing architectural rule remains unchanged:

> **Game Core is the sole authority over game rules, authoritative state, validation, state transitions, progression, and accepted gameplay outcomes.**

The visual runtime must not introduce a second authoritative game engine.

The responsibilities remain separated as follows:

```text
AI / Generation
      ↓
GameplayProposal
      ↓
Game Core
      ↓
Accepted Gameplay / GameState
      ↓
Presentation Model
      ↓
Renderer
```

### Game Core

Responsible for:

- Rules
- Capabilities
- Validation
- Authoritative state
- State transitions
- Progression
- Accepted outcomes
- Safety and invariants

Game Core must remain independent of:

- React Native
- React Native Skia
- Express
- Web browser APIs
- iOS APIs
- Android APIs
- Unity
- Rendering libraries

### Runtime

The Slice #6 Mini runtime remains a thin intermediary between the client and Game Core.

It is responsible for:

- Anonymous sessions
- In-memory session state
- HTTP/API transport
- Dependency injection
- Calling Game Core
- Returning results to the client

It must not become a second game engine.

### Client

The client is responsible for:

- Rendering
- User interaction
- Animation presentation
- UI composition
- Input collection
- Presenting accepted gameplay results
- Translating presentation data into platform-specific rendering behavior

The client must not decide whether gameplay is valid.

---

## 4. AI-to-Visual Gameplay Flow

The visual runtime must preserve the existing AI architecture:

```text
Qwen3 / GenerationProvider
          ↓
   GameplayProposal
          ↓
      Game Core
          ↓
  Validated / Accepted
      Gameplay Context
          ↓
   Presentation Model
          ↓
     React Native
          ↓
  ┌───────┴────────┐
  ↓                ↓
Skia Renderer    RN UI
  ↓                ↓
Game World       Controls / HUD
```

The AI does not directly create or manipulate visual objects.

For example, if the model proposes that Lumi discovers a blue stone, the model does not decide how that stone is drawn. Game Core determines whether the discovery is valid. The presentation layer then represents the accepted gameplay using available visual assets and renderer capabilities.

This separation allows the same accepted gameplay to be rendered by different technologies in the future.

---

## 5. Presentation Model

A Presentation Model is the bridge between authoritative gameplay and rendering.

It is derived from accepted gameplay and authoritative GameState. It is **not authoritative game state**.

A conceptual presentation model may contain information such as:

```text
Scene
 ├── Background
 ├── Environment elements
 ├── Pet
 │    ├── position
 │    ├── visual state
 │    └── animation state
 ├── Objects
 │    ├── blue-stone
 │    └── other discovered elements
 ├── Focus / interaction target
 ├── Visual effects
 └── Interaction affordances
```

The exact TypeScript contract is intentionally deferred until the technical spike demonstrates the actual rendering requirements.

The Presentation Model should be platform-neutral wherever practical.

---

## 6. Rendering Direction

### Leading candidate: React Native Skia

React Native Skia is the leading candidate for the Slice #7 renderer because it provides a graphics/rendering layer that fits naturally underneath React Native while allowing the existing Game Core architecture to remain independent.

The intended responsibility split is:

```text
React Native
 ├── Application shell
 ├── Navigation
 ├── Menus
 ├── Buttons
 ├── Dialogs
 ├── HUD
 ├── Settings
 └── Other conventional application UI

React Native Skia
 ├── Game world
 ├── Backgrounds
 ├── Pet rendering
 ├── Objects / sprites
 ├── Transforms
 ├── Effects
 ├── Particles
 └── Game-oriented animation
```

This is a direction, not yet an irreversible technology decision. The technical spike must validate it before the project commits to it as the primary renderer.

### Alternatives considered

Potential alternatives include:

- PixiJS
- Phaser
- PlayCanvas
- Godot
- Other dedicated game engines/renderers

The current architecture favors a renderer integrated with React Native rather than introducing a second full game engine because Game Core already provides the game's authoritative logical engine.

A future Unity client remains possible if the Presentation Model remains renderer-independent.

---

## 7. First-Class Platform Targets

Slice #7 explicitly targets three first-class platforms:

1. **iOS**
2. **Android**
3. **Web**

None of these is considered a secondary or optional target for the MVP visual architecture.

### iOS

The visual slice must be validated on a real iOS device. Simulator-only validation is insufficient as the primary acceptance criterion.

### Android

The visual slice must be validated on a real Android device. Emulator-only validation is insufficient as the primary acceptance criterion.

### Web

The same application architecture should run in a desktop browser without introducing a WebView-based game shell.

Platform-specific adaptations are acceptable where required, but gameplay behavior and visual language should remain substantially consistent.

---

## 8. Cross-Platform Principle

The preferred architecture is a shared React Native codebase with platform-specific renderer adaptations only where technically necessary.

```text
                 Shared Game Experience
                         │
              ┌──────────┼──────────┐
              ↓          ↓          ↓
             iOS       Android      Web
              │          │          │
              └──────────┼──────────┘
                         ↓
              Shared Presentation Model
                         ↓
                 Platform Renderer
```

The architecture must avoid making Web the primary implementation and treating mobile as a later port.

Likewise, mobile-specific rendering should not make Web an afterthought.

---

## 9. Visual Quality Requirement

Visual quality is a **Slice #7 product requirement**, not merely future polish.

The technical spike must demonstrate a modern, attractive 2D game experience.

A technically functional prototype that looks like:

- a 1980s-style game,
- a collection of unrelated placeholders,
- a static wireframe,
- a generic CRUD application,
- or an AI chat interface with a pet image

does not satisfy the objective of the visual spike.

The MVP does **not** require AAA production quality. It does require a coherent modern visual language, attractive composition, depth/layering, animation, feedback, and enough visual quality to communicate credible product potential to a child/family user and to an investor.

The final art direction is still intentionally open. The technical spike should establish the rendering capabilities and visual foundation without prematurely locking the entire art pipeline.

---

## 10. AI Must Manifest Visually

The technical spike must demonstrate that AI-generated gameplay changes the visible game experience.

A representative example:

```text
Qwen3
  ↓
"Lumi discovers a mysterious blue stone."
  ↓
GameplayProposal
  ↓
Game Core validation
  ↓
Accepted discovery
  ↓
Presentation Model
  ↓
Blue stone becomes visible
  ↓
Pet reacts
  ↓
Glow / animation / feedback
  ↓
Player can interact
```

The exact presentation is implementation-dependent, but the principle is mandatory:

> **AI-generated gameplay must be observable as gameplay, not merely as generated text.**

This is one of the primary product differentiators of the project.

---

## 11. Slice #7 Technical Spike

The first implementation of Slice #7 should be a **small playable vertical slice**, not a broad framework exercise and not a static mockup.

The spike should validate the complete path from runtime to visual experience:

```text
React Native client
       ↓
Slice #6 Runtime
       ↓
Game Core
       ↓
GenerationProvider / Ollama / Qwen3
       ↓
Accepted Gameplay
       ↓
Presentation Model
       ↓
Renderer
       ↓
Visible gameplay
       ↓
Player interaction
```

### Minimum visual scenario

The spike should include a small world containing at least:

- A visually appealing environment/background
- Lumi as the pet
- A visible interactive object such as the blue stone
- Pet idle/life animation
- Object animation or visual emphasis
- Player interaction
- Visual feedback from interaction
- A visible AI-generated gameplay outcome
- A React Native UI layer where appropriate

The scene should already feel like a small game rather than a technology demonstration.

---

## 12. Technical Spike Acceptance Criteria

The spike is successful only if the following are demonstrated:

### Platform

- [ ] Runs on iOS
- [ ] Validated on a physical iOS device
- [ ] Runs on Android
- [ ] Validated on a physical Android device
- [ ] Runs on Web in a desktop browser

### Architecture

- [ ] Game Core remains authoritative
- [ ] Runtime remains a thin intermediary
- [ ] Renderer has no authority over GameState
- [ ] AI cannot directly manipulate the renderer
- [ ] Presentation Model separates gameplay from rendering
- [ ] No second authoritative game engine is introduced

### Gameplay

- [ ] Pet appears immediately
- [ ] A visible world is rendered
- [ ] Player can interact
- [ ] AI-generated gameplay can reach the client
- [ ] Accepted gameplay produces a visible change
- [ ] Pet/object reactions are animated or otherwise visually expressed

### Visual quality

- [ ] Modern visual language
- [ ] Coherent composition
- [ ] Depth/layering where appropriate
- [ ] Meaningful animation
- [ ] Meaningful interaction feedback
- [ ] Does not resemble a retro/1980s game or a static UI prototype

### Cross-platform consistency

- [ ] Same gameplay model across platforms
- [ ] Same Presentation Model semantics across platforms
- [ ] Platform adaptations do not require Game Core changes

---

## 13. React Native UI vs Game Renderer

The client should use the appropriate technology for each responsibility.

### React Native UI

Use React Native for conventional application UI such as:

- Menus
- Buttons
- Settings
- Dialogs
- Navigation
- Inventory interfaces
- Parent-facing controls
- HUD elements when conventional UI is sufficient

### Game Renderer

Use the rendering layer for visual game content such as:

- World
- Pet
- Environment
- Objects
- Sprites/images
- Spatial transforms
- Particles
- Game effects
- Game-oriented animation

The boundary should remain pragmatic. The objective is not to force every visual element into Skia or every control into standard React Native components.

---

## 14. Assets and AI-Generated Visuals

The AI gameplay system must remain independent from the visual asset generation strategy.

The initial MVP should prefer reusable authored or prepared assets that can be composed dynamically according to accepted gameplay.

For example:

```text
Accepted Gameplay
       ↓
Presentation Model
       ↓
Asset selection / composition
       ↓
Renderer
```

The model should not be required to generate a new image for every gameplay event.

AI-generated images, procedural asset generation, advanced animation generation, and dynamic asset pipelines are future possibilities and are not required to validate the Slice #7 architecture.

---

## 15. Future Unity Compatibility

Unity remains a possible future client technology.

The architecture should therefore preserve this conceptual boundary:

```text
             Game Core
                 ↓
       Accepted Gameplay
                 ↓
       Presentation Model
            ↙         ↘
   React Native/Skia    Unity
```

Game Core must never depend on Unity.

The Presentation Model should avoid encoding renderer-specific implementation details when practical.

This does not mean the MVP must implement Unity compatibility now.

---

## 16. What Slice #7 Does Not Decide

The following remain intentionally deferred:

- Final art direction
- Final asset pipeline
- 3D rendering
- Unity implementation
- Advanced physics
- Advanced particle systems
- Procedural world generation
- AI-generated image pipelines
- Audio architecture
- Multiplayer presentation
- Offline-first architecture
- Production mobile deployment
- App Store / Play Store release process
- Production analytics
- Advanced observability
- Monetization UX
- Parent account architecture
- Long-term asset management

These decisions should only be introduced when concrete product requirements justify them.

---

## 17. Architectural Invariants

The following invariants must remain true throughout Slice #7:

1. **Game Core remains the sole authority.**
2. **AI remains untrusted and proposal-based.**
3. **AI never directly mutates authoritative state.**
4. **Rendering never becomes authoritative gameplay logic.**
5. **Runtime remains a thin intermediary.**
6. **Presentation data remains distinct from authoritative GameState.**
7. **The visual client remains independent of provider-specific AI implementation.**
8. **The architecture remains viable for iOS, Android, and Web.**
9. **The visual experience must be modern and product-oriented, not merely technically functional.**
10. **A future renderer can replace the current renderer without restructuring Game Core.**

---

## 18. Current Direction

For Slice #7, the current direction is:

```text
                    AI Pet Game
                         │
                         ▼
                  Slice #6 Runtime
                         │
                         ▼
                    Game Core
                         │
                         ▼
              Accepted Gameplay
                         │
                         ▼
               Presentation Model
                         │
                         ▼
                  React Native
                         │
                    ┌────┴────┐
                    ▼         ▼
              RN UI Layer   Skia
                              │
                              ▼
                         Game World
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                   Pet     Objects   Effects
```

**Leading technical direction:** React Native + React Native Skia, subject to validation by the Slice #7 technical spike.

**First-class platforms:** iOS + Android + Web.

**Primary objective:** prove a modern, visually appealing, playable AI-driven game experience using the architecture already established in Slices #1–#6.
