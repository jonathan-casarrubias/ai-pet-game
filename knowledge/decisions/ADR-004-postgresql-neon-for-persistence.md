# ADR-004: PostgreSQL with Neon is the persistence database

## Context

The AI Pet Game must be remotely accessible for MVP/PoC demonstrations. The project should use a production-oriented relational database from the beginning rather than introducing a temporary local database and migrating later.

## Decision

PostgreSQL is the primary database for the project, hosted remotely using Neon.

PostgreSQL will be used from the beginning for both the MVP/PoC and future production environments.

The database is responsible for persistent game data such as:

- Player data.
- Pet data.
- Personality and progression data.
- Quest and adventure data.
- Game events.
- Rewards and inventory.
- Other persistent game-domain data defined by the Game Core.

The Game Core remains the authority over game rules and state transitions. PostgreSQL is the persistence mechanism and must not contain business logic that belongs in the Game Core.

The initial Neon Free plan is acceptable for development and remote demonstrations. Its resource limitations are acceptable because the initial objective is to demonstrate and validate the product with a limited number of users.

If the project receives investment or requires greater capacity, the PostgreSQL/Neon infrastructure can be scaled without changing the fundamental database technology or domain data model.

## Consequences

- PostgreSQL is used from the beginning for both the MVP/PoC and future production environments.
- Persistent game-domain data is stored in a remotely accessible relational database.
- The Game Core remains responsible for game rules and state transitions.
- The initial Neon Free plan is sufficient for development and remote demonstrations with a limited number of users.
- PostgreSQL/Neon infrastructure can scale without changing the fundamental database technology or domain data model.

## Exclusions

- SQLite is not introduced.
- MongoDB is not introduced.
- Database adapters for alternative database technologies are not introduced.
