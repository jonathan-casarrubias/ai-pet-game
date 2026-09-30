import express, { type Request, type Response, type NextFunction } from 'express';
import {
  type PlayerAction,
  type ContextualElement,
  type GenerationPurpose,
  type CapabilityContext,
  isSupportedContextualElement,
} from '@ai-pet-game/game-core';
import { SessionStore } from './session-store.js';

export function createApp(sessionStore: SessionStore = new SessionStore()) {
  const app = express();
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin === 'http://localhost:8081') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  // POST /sessions
  app.post('/sessions', (req: Request, res: Response) => {
    const petName =
      typeof req.body?.petName === 'string' && req.body.petName.trim().length > 0
        ? req.body.petName.trim()
        : undefined;

    const session = sessionStore.createSession({ petName });

    res.status(201).json({
      sessionId: session.id,
      state: session.gameCore.getState(),
    });
  });

  // GET /sessions/:sessionId/state
  app.get('/sessions/:sessionId/state', (req: Request, res: Response) => {
    const sessionId = req.params['sessionId'];
    if (!sessionId) {
      res.status(400).json({
        error: 'SESSION_ID_REQUIRED',
        message: 'Session ID parameter is required',
      });
      return;
    }

    const session = sessionStore.getSession(sessionId);
    if (!session) {
      res.status(404).json({
        error: 'SESSION_NOT_FOUND',
        message: "Session '" + sessionId + "' not found",
      });
      return;
    }

    res.status(200).json({
      state: session.gameCore.getState(),
    });
  });

  // POST /sessions/:sessionId/generate
  app.post(
    '/sessions/:sessionId/generate',
    async (req: Request, res: Response, next: NextFunction) => {
      const sessionId = req.params['sessionId'];
      if (!sessionId) {
        res.status(400).json({
          error: 'SESSION_ID_REQUIRED',
          message: 'Session ID parameter is required',
        });
        return;
      }

      const session = sessionStore.getSession(sessionId);
      if (!session) {
        res.status(404).json({
          error: 'SESSION_NOT_FOUND',
          message: "Session '" + sessionId + "' not found",
        });
        return;
      }

      const body = req.body ?? {};
      const purpose: GenerationPurpose =
        typeof body.purpose === 'string' && body.purpose.trim().length > 0
          ? body.purpose.trim()
          : 'adventure_narrative';

      let element: ContextualElement | undefined = undefined;

      if (body.contextualElement !== undefined && body.contextualElement !== null) {
        if (!isSupportedContextualElement(body.contextualElement)) {
          res.status(400).json({
            error: 'INVALID_CONTEXTUAL_ELEMENT',
            message: 'Provided contextual element is invalid or unsupported',
          });
          return;
        }
        element = body.contextualElement;
      } else if (
        typeof body.elementId === 'string' &&
        body.elementId.trim().length > 0
      ) {
        element = {
          id: body.elementId.trim(),
          category: typeof body.category === 'string' ? body.category : 'object',
          attributes: Array.isArray(body.attributes)
            ? body.attributes
            : ['visible', 'glowing'],
        };

        if (!isSupportedContextualElement(element)) {
          res.status(400).json({
            error: 'INVALID_CONTEXTUAL_ELEMENT',
            message: 'Constructed contextual element is invalid or unsupported',
          });
          return;
        }
      }

      try {
        const currentState = session.gameCore.getState();
        const capabilityContext: CapabilityContext = {
          gameState: currentState,
          playerContext: {
            playerId: currentState.player.id,
            progressionLevel: currentState.discoveries.length,
          },
          ...(element !== undefined ? { contextualElement: element } : {}),
        };

        const controlledContext =
          session.gameCore.createControlledGenerationContext(
            purpose,
            capabilityContext,
          );

        if (!controlledContext) {
          res.status(400).json({
            error: 'INVALID_GENERATION_CONTEXT',
            message:
              'Could not create controlled generation context for current state and parameters',
          });
          return;
        }

        const proposal = await session.generator.generate(controlledContext);

        const resolution = session.gameCore.resolveGameplayProposal(
          controlledContext,
          proposal,
          session.corrector,
        );
        const application = session.gameCore.applyAcceptedGameplayContext(
          resolution.context,
        );

        res.status(200).json({
          resolution: {
            acceptedFrom: resolution.acceptedFrom,
          },
          proposal: {
            generationPurpose: proposal.generationPurpose,
            sourceStateVersion: proposal.sourceStateVersion,
            narrative: proposal.narrative,
            ...(proposal.activityId !== undefined
              ? { activityId: proposal.activityId }
              : {}),
          },
          acceptedContext: {
            generationPurpose: controlledContext.generationPurpose,
            sourceStateVersion:
              resolution.context.gameplayContext.sourceStateVersion,
            narrative: resolution.context.narrative,
            ...(resolution.context.activityId !== undefined
              ? { activityId: resolution.context.activityId }
              : {}),
            contextualElements:
              resolution.context.gameplayContext.contextualElements,
            applicableCapabilityIds:
              resolution.context.gameplayContext.applicableCapabilityIds,
          },
          state: application.state,
        });
      } catch (cause) {
        const errMessage = String(cause);
        if (
          errMessage.includes('PROVIDER_UNAVAILABLE') ||
          errMessage.includes('fetch failed') ||
          errMessage.includes('ECONNREFUSED')
        ) {
          res.status(503).json({
            error: 'PROVIDER_UNAVAILABLE',
            message: 'AI generation provider is unavailable',
          });
          return;
        }
        if (
          errMessage.includes('GENERATION_FAILED') ||
          errMessage.includes('INVALID_OUTPUT')
        ) {
          res.status(500).json({
            error: 'GENERATION_FAILED',
            message: 'AI generation failed to produce valid output',
          });
          return;
        }
        next(cause);
      }
    },
  );

  // POST /sessions/:sessionId/actions
  app.post('/sessions/:sessionId/actions', (req: Request, res: Response) => {
    const sessionId = req.params['sessionId'];
    if (!sessionId) {
      res.status(400).json({
        error: 'SESSION_ID_REQUIRED',
        message: 'Session ID parameter is required',
      });
      return;
    }

    const session = sessionStore.getSession(sessionId);
    if (!session) {
      res.status(404).json({
        error: 'SESSION_NOT_FOUND',
        message: "Session '" + sessionId + "' not found",
      });
      return;
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || typeof body.type !== 'string') {
      res.status(400).json({
        error: 'INVALID_ACTION',
        message: 'Player action payload is invalid or missing action type',
      });
      return;
    }

    const currentState = session.gameCore.getState();
    const playerId =
      typeof body.playerId === 'string' && body.playerId.trim().length > 0
        ? body.playerId.trim()
        : currentState.player.id;

    if (playerId !== currentState.player.id) {
      res.status(400).json({
        accepted: false,
        rejectionReason: 'player_mismatch',
        state: currentState,
        events: [],
      });
      return;
    }

    let action: PlayerAction;
    let capabilityContext: CapabilityContext | undefined = undefined;

    if (body.type === 'observe' || body.type === 'explore') {
      const elementId =
        typeof body.elementId === 'string' ? body.elementId.trim() : '';

      action = {
        playerId,
        type: body.type,
        elementId,
      };

      let contextualElement: ContextualElement;
      if (isSupportedContextualElement(body.contextualElement)) {
        contextualElement = body.contextualElement;
      } else {
        contextualElement = {
          id: elementId,
          category:
            typeof body.category === 'string' ? body.category : 'object',
          attributes: Array.isArray(body.attributes)
            ? body.attributes
            : ['visible', 'glowing'],
        };
      }

      capabilityContext = {
        gameState: currentState,
        playerContext: {
          playerId,
          progressionLevel: currentState.discoveries.length,
        },
        contextualElement,
      };
    } else if (body.type === 'move') {
      const position = body.position;
      if (
        !position ||
        typeof position !== 'object' ||
        !Number.isFinite(position.x) ||
        !Number.isFinite(position.y)
      ) {
        res.status(400).json({
          error: 'INVALID_ACTION',
          message: 'Player action payload is invalid or missing action type',
        });
        return;
      }

      action = {
        playerId,
        type: 'move',
        position: {
          x: position.x,
          y: position.y,
        },
      };
    } else if (body.type === 'interact') {
      const entityId =
        typeof body.entityId === 'string' ? body.entityId.trim() : '';
      if (!entityId) {
        res.status(400).json({
          error: 'INVALID_ACTION',
          message: 'Player action payload is invalid or missing action type',
        });
        return;
      }

      action = {
        playerId,
        type: 'interact',
        entityId,
      };
    } else {
      action = {
        playerId,
        type: body.type,
        ...(typeof body.question === 'string'
          ? { question: body.question }
          : {}),
      };
    }

    const transition = session.gameCore.evaluate(action, capabilityContext);

    if (!transition.accepted) {
      res.status(400).json({
        accepted: false,
        rejectionReason: transition.rejectionReason,
        state: transition.state,
        events: [],
      });
      return;
    }

    res.status(200).json({
      accepted: true,
      state: transition.state,
      events: transition.events,
    });
  });

  // Global error handler
  app.use(
    (_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      console.error('[Runtime] Unhandled error:', _err);
      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred',
      });
    },
  );

  return app;
}