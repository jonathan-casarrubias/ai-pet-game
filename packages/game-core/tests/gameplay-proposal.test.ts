import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createAcceptedGameplayContext,
    createGameplayProposal,
} from '../src/context/gameplay-proposal.js';
import {
    createInitialGameState,
    GameCore,
    type ContextualElement,
} from '../src/index.js';

const contextualElements = [
    {
        id: 'blue-stone',
        category: 'object',
        attributes: ['visible', 'glowing'],
    },
] as const;

test('creates a gameplay proposal', () => {
    const proposal = createGameplayProposal(
        'initial-adventure',
        3,
        contextualElements,
        ['observe'],
        'A glowing blue stone catches the pet’s attention.',
    );

    assert.deepEqual(proposal, {
        generationPurpose: 'initial-adventure',
        sourceStateVersion: 3,
        contextualElements: [
            {
                id: 'blue-stone',
                category: 'object',
                attributes: ['visible', 'glowing'],
            },
        ],
        capabilityIds: ['observe'],
        narrative: 'A glowing blue stone catches the pet’s attention.',
    });
});

test('freezes the gameplay proposal', () => {
    const proposal = createGameplayProposal(
        'initial-adventure',
        3,
        contextualElements,
        ['observe'],
        'A glowing blue stone catches the pet’s attention.',
    );

    const proposalElement = proposal.contextualElements[0];

    assert.ok(proposalElement);

    assert.equal(Object.isFrozen(proposal), true);
    assert.equal(Object.isFrozen(proposal.contextualElements), true);
    assert.equal(Object.isFrozen(proposalElement), true);
    assert.equal(Object.isFrozen(proposalElement.attributes), true);
    assert.equal(Object.isFrozen(proposal.capabilityIds), true);
});

test('copies contextual elements and capability ids', () => {
    const mutableElements = [
        {
            id: 'blue-stone',
            category: 'object',
            attributes: ['visible'],
        },
    ];

    const mutableCapabilityIds = ['observe'];

    const proposal = createGameplayProposal(
        'initial-adventure',
        3,
        mutableElements,
        mutableCapabilityIds,
        'The pet notices something interesting.',
    );

    const mutableElement = mutableElements[0];

    assert.ok(mutableElement);

    mutableElement.attributes.push('glowing');
    mutableCapabilityIds.push('unknown');

    const proposalElement = proposal.contextualElements[0];

    assert.ok(proposalElement);

    assert.deepEqual(proposalElement.attributes, ['visible']);
    assert.deepEqual(proposal.capabilityIds, ['observe']);
});

test('creates an accepted gameplay context', () => {
    const accepted = createAcceptedGameplayContext(
        {
            playerId: 'player-1',
            sourceStateVersion: 3,
            contextualElements,
            applicableCapabilityIds: ['observe'],
        },
        'A glowing blue stone catches the pet’s attention.',
    );

    assert.deepEqual(accepted, {
        gameplayContext: {
            playerId: 'player-1',
            sourceStateVersion: 3,
            contextualElements: [
                {
                    id: 'blue-stone',
                    category: 'object',
                    attributes: ['visible', 'glowing'],
                },
            ],
            applicableCapabilityIds: ['observe'],
        },
        narrative: 'A glowing blue stone catches the pet’s attention.',
    });
});

test('freezes the accepted gameplay context', () => {
    const accepted = createAcceptedGameplayContext(
        {
            playerId: 'player-1',
            sourceStateVersion: 3,
            contextualElements,
            applicableCapabilityIds: ['observe'],
        },
        'A glowing blue stone catches the pet’s attention.',
    );

    const acceptedElement =
        accepted.gameplayContext.contextualElements[0];

    assert.ok(acceptedElement);

    assert.equal(Object.isFrozen(accepted), true);
    assert.equal(Object.isFrozen(accepted.gameplayContext), true);
    assert.equal(
        Object.isFrozen(accepted.gameplayContext.contextualElements),
        true,
    );
    assert.equal(Object.isFrozen(acceptedElement), true);
    assert.equal(Object.isFrozen(acceptedElement.attributes), true);
    assert.equal(
        Object.isFrozen(
            accepted.gameplayContext.applicableCapabilityIds,
        ),
        true,
    );
});

test('does not mutate the supplied gameplay context', () => {
    const gameplayContext = {
        playerId: 'player-1',
        sourceStateVersion: 3,
        contextualElements: [...contextualElements],
        applicableCapabilityIds: ['observe'],
    };

    const accepted = createAcceptedGameplayContext(
        gameplayContext,
        'A glowing blue stone catches the pet’s attention.',
    );

    assert.deepEqual(gameplayContext, {
        playerId: 'player-1',
        sourceStateVersion: 3,
        contextualElements: [...contextualElements],
        applicableCapabilityIds: ['observe'],
    });

    assert.notEqual(accepted.gameplayContext, gameplayContext);
});

function createGameCore(): GameCore {
    return new GameCore(
        createInitialGameState(
            { id: 'player-1' },
            { id: 'pet-1', name: 'Sprout' },
        ),
    );
}

function createGenerationContext(gameCore: GameCore) {
    const context = gameCore.createControlledGenerationContext(
        'initial-adventure',
        {
            gameState: gameCore.getState(),
            playerContext: {
                playerId: 'player-1',
                progressionLevel: 0,
            },
            contextualElement: contextualElements[0],
        },
    );

    assert.ok(context);

    return context;
}

test('accepts a valid gameplay proposal', () => {
    const gameCore = createGameCore();
    const controlledContext = createGenerationContext(gameCore);

    const proposal = createGameplayProposal(
        'initial-adventure',
        gameCore.getState().version,
        contextualElements,
        ['observe'],
        'A glowing blue stone catches the pet’s attention.',
    );

    const accepted = gameCore.acceptGameplayProposal(
        controlledContext,
        proposal,
    );

    assert.deepEqual(accepted, {
        gameplayContext: {
            playerId: 'player-1',
            sourceStateVersion: 0,
            contextualElements: [
                {
                    id: 'blue-stone',
                    category: 'object',
                    attributes: ['visible', 'glowing'],
                },
            ],
            applicableCapabilityIds: ['observe'],
        },
        narrative: 'A glowing blue stone catches the pet’s attention.',
    });
});

test('rejects a gameplay proposal with a different generation purpose', () => {
    const gameCore = createGameCore();
    const controlledContext = createGenerationContext(gameCore);

    const proposal = createGameplayProposal(
        'different-purpose',
        gameCore.getState().version,
        contextualElements,
        ['observe'],
        'A glowing blue stone catches the pet’s attention.',
    );

    const accepted = gameCore.acceptGameplayProposal(
        controlledContext,
        proposal,
    );

    assert.equal(accepted, undefined);
});

test('rejects a gameplay proposal from a different state version', () => {
    const gameCore = createGameCore();
    const controlledContext = createGenerationContext(gameCore);

    const proposal = createGameplayProposal(
        'initial-adventure',
        gameCore.getState().version + 1,
        contextualElements,
        ['observe'],
        'A glowing blue stone catches the pet’s attention.',
    );

    const accepted = gameCore.acceptGameplayProposal(
        controlledContext,
        proposal,
    );

    assert.equal(accepted, undefined);
});

test('rejects a gameplay proposal with an unsupported contextual element', () => {
    const gameCore = createGameCore();
    const controlledContext = createGenerationContext(gameCore);

    const unsupportedElement: ContextualElement = {
        id: 'unknown-element',
        category: 'unsupported-category',
        attributes: [],
    };

    const proposal = createGameplayProposal(
        'initial-adventure',
        gameCore.getState().version,
        [unsupportedElement],
        ['observe'],
        'The pet notices something unusual.',
    );

    const accepted = gameCore.acceptGameplayProposal(
        controlledContext,
        proposal,
    );

    assert.equal(accepted, undefined);
});

test('rejects a gameplay proposal with a capability outside the applicable set', () => {
    const gameCore = createGameCore();
    const controlledContext = createGenerationContext(gameCore);

    const proposal = createGameplayProposal(
        'initial-adventure',
        gameCore.getState().version,
        contextualElements,
        ['observe', 'unknown-capability'],
        'A glowing blue stone catches the pet’s attention.',
    );

    const accepted = gameCore.acceptGameplayProposal(
        controlledContext,
        proposal,
    );

    assert.equal(accepted, undefined);
});

test('does not mutate Game Core state when accepting a gameplay proposal', () => {
    const gameCore = createGameCore();
    const controlledContext = createGenerationContext(gameCore);
    const stateBefore = gameCore.getState();

    const proposal = createGameplayProposal(
        'initial-adventure',
        stateBefore.version,
        contextualElements,
        ['observe'],
        'A glowing blue stone catches the pet’s attention.',
    );

    const accepted = gameCore.acceptGameplayProposal(
        controlledContext,
        proposal,
    );

    assert.ok(accepted);
    assert.equal(gameCore.getState(), stateBefore);
    assert.deepEqual(gameCore.getState(), stateBefore);
});