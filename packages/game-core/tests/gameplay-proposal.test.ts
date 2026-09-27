
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createAcceptedGameplayContext,
    createGameplayProposal,
} from '../src/context/gameplay-proposal.js';

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
