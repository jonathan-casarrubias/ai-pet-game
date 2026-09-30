import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialGameState,
  freezeGameState,
  GameCore,
  isLumiThreatened,
  ProviderGameplayGenerator,
  type GenerationProvider,
  type GenerationRequest,
  type GenerationResult,
  type MoveEntityConsequence,
  type SpatialEntity,
} from '../src/index.js';

function createAdventureInitialState(): GameCore {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const initialStone: SpatialEntity = {
    id: 'ancient-stone',
    type: 'object',
    role: 'neutral',
    label: 'Ancient Stone',
    position: { x: 220, y: 200 },
    state: 'visible',
    interactionRadius: 25,
  };

  const state = freezeGameState({
    ...base,
    world: {
      ...base.world,
      bounds: { minX: 0, minY: 0, maxX: 400, maxY: 400 },
      playerPos: { x: 200, y: 200 },
      entities: {
        'ancient-stone': initialStone,
      },
    },
  });

  return new GameCore(state);
}

test('1. Complete AI-Generated Adventure Flow: Exploration -> Proximity Interaction -> AI Proposal -> Atomic Consequences -> Threat Chase -> Lumi Player Movement Escape -> History-Aware Next Generation', async () => {
  const gameCore = createAdventureInitialState();
  assert.strictEqual(gameCore.getState().version, 0);

  // 1. Player moves Lumi towards the interactable ancient stone
  const moveResult = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 215, y: 200 },
  });
  assert.ok(moveResult.accepted);
  assert.strictEqual(gameCore.getState().world.playerPos.x, 215);
  assert.strictEqual(gameCore.getState().version, 1);

  // 2. Proximity interaction with ancient stone is accepted
  const interactResult = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'ancient-stone',
  });
  assert.ok(interactResult.accepted);
  assert.strictEqual(gameCore.getState().version, 2);

  // 3. Game Core creates bounded generation context #1
  const generationContext1 = gameCore.createControlledGenerationContext(
    'adventure-encounter',
    {
      gameState: gameCore.getState(),
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: {
        id: 'ancient-stone',
        category: 'object',
        attributes: ['visible'],
      },
    },
  );
  assert.ok(generationContext1 !== undefined);
  assert.strictEqual(generationContext1.sourceStateVersion, 2);
  assert.strictEqual(generationContext1.relevantState.discoveryCount, 0);
  assert.deepStrictEqual(generationContext1.relevantState.recentDiscoveries, []);
  assert.deepStrictEqual(generationContext1.relevantState.escapedThreats, []);

  // 4. Mock AI GenerationProvider proposes an integrated set of generic gameplay consequences
  let capturedRequest1: GenerationRequest | null = null;
  let capturedRequest2: GenerationRequest | null = null;

  const mockProvider: GenerationProvider = {
    async generate(request: GenerationRequest): Promise<GenerationResult> {
      if (request.generationPurpose === 'adventure-encounter') {
        capturedRequest1 = request;
        return {
          success: true,
          narrative: 'Lumi inspects the ancient stone, discovering hidden crystals while a creature awakens nearby!',
          activityId: 'explore',
          consequences: [
            {
              type: 'change_entity_state',
              entityId: 'ancient-stone',
              state: 'discovered',
            },
            {
              type: 'record_discovery',
              entityId: 'ancient-stone',
            },
            {
              type: 'spawn_entity',
              entity: {
                id: 'cave-stalker',
                type: 'creature',
                role: 'threat',
                threatRadius: 20,
                label: 'Cave Stalker',
                position: { x: 225, y: 200 },
                state: 'active',
                interactionRadius: 10,
              },
            },
            {
              type: 'spawn_entity',
              entity: {
                id: 'glowing-moss',
                type: 'object',
                role: 'neutral',
                label: 'Glowing Moss',
                position: { x: 50, y: 200 },
                state: 'glowing',
                interactionRadius: 15,
              },
            },
          ],
        };
      }

      if (request.generationPurpose === 'adventure-aftermath') {
        capturedRequest2 = request;
        return {
          success: true,
          narrative: `Lumi reflects on discovering the ${request.relevantState.recentDiscoveries[0]} and escaping danger.`,
        };
      }

      return {
        success: false,
        error: { code: 'GENERATION_FAILED', message: 'Unknown purpose' },
      };
    },
  };

  const generator = new ProviderGameplayGenerator(mockProvider);
  const proposal1 = await generator.generate(generationContext1);

  const req1: GenerationRequest = capturedRequest1!;
  assert.deepStrictEqual(req1.relevantState.escapedThreats, []);
  assert.strictEqual(proposal1.generationPurpose, 'adventure-encounter');
  assert.strictEqual(proposal1.consequences?.length, 4);

  // 5. Game Core validates the proposal
  const validation1 = gameCore.validateGameplayProposal(generationContext1, proposal1);
  assert.ok(validation1.valid);
  assert.ok(validation1.context !== undefined);

  // 6. Game Core applies accepted context atomically
  const applyResult = gameCore.applyAcceptedGameplayContext(validation1.context);
  assert.ok(applyResult.accepted);
  assert.strictEqual(gameCore.getState().version, 3); // exactly 1 atomic version bump

  // Authoritative state updates
  const stateAfterAdventure = gameCore.getState();
  assert.strictEqual(stateAfterAdventure.world.entities['ancient-stone']?.state, 'discovered');
  assert.deepStrictEqual(stateAfterAdventure.discoveries, ['ancient-stone']);

  const stalker = stateAfterAdventure.world.entities['cave-stalker'];
  assert.ok(stalker !== undefined);
  assert.strictEqual(stalker.role, 'threat');
  assert.strictEqual(stalker.threatRadius, 20);
  assert.strictEqual(stalker.position.x, 225);

  const moss = stateAfterAdventure.world.entities['glowing-moss'];
  assert.ok(moss !== undefined);
  assert.strictEqual(moss.role, 'neutral');
  assert.strictEqual(moss.state, 'glowing');

  // 7. Threat proximity & chase demonstration:
  // Lumi is at playerPos (215, 200), stalker is at (225, 200). Distance is 10 <= 20 (threatRadius).
  assert.strictEqual(isLumiThreatened(gameCore.getState(), stalker), true);

  // Threat executes chase step toward player Lumi (targetId: player)
  const chaseConsequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'cave-stalker',
    targetId: 'player',
  };
  const chaseResult = gameCore.applyConsequence(chaseConsequence);
  assert.ok(chaseResult.accepted);
  assert.strictEqual(gameCore.getState().version, 4);
  assert.strictEqual(gameCore.getState().world.entities['cave-stalker']?.position.x, 215);

  // 8. Player-controlled Lumi movement and escape:
  // Step 1: Player moves Lumi to (205, 200) -> distance to stalker (at 215, 200) is 10 <= 20 (still threatened)
  const fleeStep1 = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 205, y: 200 },
  });
  assert.ok(fleeStep1.accepted);
  assert.strictEqual(gameCore.getState().version, 5);
  assert.strictEqual(isLumiThreatened(gameCore.getState(), stalker), true);
  assert.strictEqual(fleeStep1.events.some((e) => e.type === 'pet_escaped_threat'), false);

  // Step 2: Player moves Lumi to (190, 200) -> distance to stalker (at 215, 200) becomes 25 > 20 (escapes!)
  const fleeStep2 = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 190, y: 200 },
  });
  assert.ok(fleeStep2.accepted);
  assert.strictEqual(gameCore.getState().version, 6);
  assert.strictEqual(isLumiThreatened(gameCore.getState(), stalker), false);

  // Verify escape event and state in Game Core
  assert.deepStrictEqual(gameCore.getState().escapedThreats, ['cave-stalker']);
  const escapeEvent = fleeStep2.events.find((e) => e.type === 'pet_escaped_threat');
  assert.ok(escapeEvent !== undefined);
  assert.strictEqual(escapeEvent.type, 'pet_escaped_threat');
  if (escapeEvent.type === 'pet_escaped_threat') {
    assert.strictEqual(escapeEvent.playerId, 'player-1');
    assert.strictEqual(escapeEvent.petId, 'pet-1');
    assert.strictEqual(escapeEvent.threatEntityId, 'cave-stalker');
  }

  // 9. History-Aware Next Generation:
  // Game Core creates generation context #2 from the updated authoritative state
  const generationContext2 = gameCore.createControlledGenerationContext(
    'adventure-aftermath',
    {
      gameState: gameCore.getState(),
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: {
        id: 'glowing-moss',
        category: 'object',
        attributes: ['glowing'],
      },
    },
  );
  assert.ok(generationContext2 !== undefined);

  // Verify generation context #2 accurately reflects new state/history
  assert.strictEqual(generationContext2.sourceStateVersion, 6);
  assert.strictEqual(generationContext2.relevantState.discoveryCount, 1);
  assert.deepStrictEqual(generationContext2.relevantState.recentDiscoveries, ['ancient-stone']);
  assert.deepStrictEqual(generationContext2.relevantState.escapedThreats, ['cave-stalker']);
  assert.strictEqual(generationContext2.gameplayContext.contextualElements[0]?.id, 'glowing-moss');

  // Generate proposal #2
  const proposal2 = await generator.generate(generationContext2);
  const req2: GenerationRequest = capturedRequest2!;
  assert.strictEqual(req2.sourceStateVersion, 6);
  assert.strictEqual(req2.relevantState.discoveryCount, 1);
  assert.deepStrictEqual(req2.relevantState.recentDiscoveries, ['ancient-stone']);
  assert.deepStrictEqual(req2.relevantState.escapedThreats, ['cave-stalker']);
  assert.strictEqual(proposal2.narrative, 'Lumi reflects on discovering the ancient-stone and escaping danger.');
});

test('2. Game Core authority: Invalid AI proposal with illegal consequence cannot bypass validation', async () => {
  const gameCore = createAdventureInitialState();
  const context = gameCore.createControlledGenerationContext('test-safety', {
    gameState: gameCore.getState(),
    playerContext: { playerId: 'player-1', progressionLevel: 0 },
  });
  assert.ok(context !== undefined);

  const invalidProvider: GenerationProvider = {
    async generate(): Promise<GenerationResult> {
      return {
        success: true,
        narrative: 'AI attempts illegal mutations.',
        consequences: [
          {
            type: 'spawn_entity',
            entity: {
              id: 'illegal-threat',
              type: 'creature',
              role: 'threat',
              threatRadius: -10, // Invalid negative threatRadius
              label: 'Bad Threat',
              position: { x: 100, y: 100 },
              state: 'active',
              interactionRadius: 10,
            },
          },
        ],
      };
    },
  };

  const generator = new ProviderGameplayGenerator(invalidProvider);
  const proposal = await generator.generate(context);

  const validation = gameCore.validateGameplayProposal(context, proposal);
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.rejection.code, 'INVALID_CONSEQUENCE');
  assert.strictEqual(validation.rejection.message, 'Threat radius cannot be negative');

  // Game state remains completely unmutated
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().world.entities['illegal-threat'], undefined);
});

test('3. Generic entity semantics: Content-agnostic adventure operates identically for arbitrary entity kinds', async () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const crystalEntity: SpatialEntity = {
    id: 'mystic-crystal',
    type: 'object',
    role: 'neutral',
    label: 'Mystic Crystal',
    position: { x: 200, y: 200 },
    state: 'visible',
    interactionRadius: 20,
  };
  const state = freezeGameState({
    ...base,
    world: {
      ...base.world,
      entities: { 'mystic-crystal': crystalEntity },
    },
  });
  const gameCore = new GameCore(state);

  const context = gameCore.createControlledGenerationContext('crystal-quest', {
    gameState: gameCore.getState(),
    playerContext: { playerId: 'player-1', progressionLevel: 0 },
    contextualElement: { id: 'mystic-crystal', category: 'object', attributes: ['visible'] },
  })!;

  // AI spawns robot helper and phantom threat
  const genericProvider: GenerationProvider = {
    async generate(): Promise<GenerationResult> {
      return {
        success: true,
        narrative: 'A mechanical guide and a shadow emerge near the crystal.',
        consequences: [
          {
            type: 'spawn_entity',
            entity: {
              id: 'helper-robot',
              type: 'creature',
              role: 'helper',
              label: 'Clockwork Guide',
              position: { x: 190, y: 190 },
              state: 'visible',
              interactionRadius: 15,
            },
          },
          {
            type: 'spawn_entity',
            entity: {
              id: 'shadow-phantom',
              type: 'creature',
              role: 'threat',
              threatRadius: 40,
              label: 'Shadow Phantom',
              position: { x: 230, y: 230 },
              state: 'active',
              interactionRadius: 10,
            },
          },
        ],
      };
    },
  };

  const generator = new ProviderGameplayGenerator(genericProvider);
  const proposal = await generator.generate(context);
  const validation = gameCore.validateGameplayProposal(context, proposal);
  assert.ok(validation.valid);

  const applyResult = gameCore.applyAcceptedGameplayContext(validation.context);
  assert.ok(applyResult.accepted);

  assert.strictEqual(gameCore.getState().world.entities['helper-robot']?.role, 'helper');
  assert.strictEqual(gameCore.getState().world.entities['shadow-phantom']?.role, 'threat');
});
