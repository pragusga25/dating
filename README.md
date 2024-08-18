# Dating Simulator API

## Description

This project is a backend API for a dating simulator application. It provides functionality for user authentication, profile management, swipe actions, premium package purchases, and more.

## Project Structure

```
.
├── prisma/
│   ├── dbml/
│   ├── migrations/
│   └── seed.py
├── src/
│   ├── __shared__/
│   ├── auth/
│   │   ├── dtos/
│   │   ├── errors/
│   │   ├── routers/
│   │   │   └── *.test.ts
│   │   └── services/
│   │       └── *.test.ts
│   ├── premium-package/
│   │   ├── dtos/
│   │   ├── errors/
│   │   ├── routers/
│   │   │   └── *.test.ts
│   │   └── services/
│   │       └── *.test.ts
│   ├── swipe/
│   │   ├── dtos/
│   │   ├── errors/
│   │   ├── routers/
│   │   │   └── *.test.ts
│   │   └── services/
│   │       └── *.test.ts
│   ├── app.ts
│   ├── context.ts
│   ├── schedulers.ts
│   └── server.ts
├── .czrc
├── .env
├── biome.json
├── commitlint.config.js
├── Dockerfile
├── docker-compose.pg.yaml
├── docker-compose.yaml
├── jest.config.js
├── lefthook.yaml
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

## Endpoints

- POST /auth/signup: Create a new user account
- POST /auth/login: User login
- GET /auth/me: Get current user details (requires authentication)
- GET /swipes/profile: Get a swipeable profile (requires authentication)
- PUT /swipes: Update swipe action (requires authentication)
- GET /swipes/stats: Get swipe statistics (requires authentication)
- GET /premium-packages: Get list of available premium packages
- POST /premium-packages/purchase: Purchase a premium package (requires authentication)

## Development

### Prerequisites

- Node.js
- npm
- PostgreSQL (can be run using Docker)

### Environment Setup

Before running the application, make sure to set up your `.env` file with the appropriate configuration.

Berikut adalah pembaruan README bagian tersebut:

### Running Locally (without Docker)

1. Install dependencies:

   ```sh
   npm install
   ```

2. If you need a PostgreSQL database, you can use the provided Docker Compose file:

   ```sh
   docker-compose -f docker-compose.pg.yaml up -d
   ```

3. Run database migrations:

   ```sh
   npx prisma migrate dev
   ```

4. (Optional) Seed the database:

   ```sh
   npx prisma db seed
   ```

5. Start the application:

   ```sh
   npm run dev
   ```

### Running Tests

To run the tests for the application:

```sh
npm run test
```

## Code Quality

This project uses Biome for code checking, linting, and formatting. Here are the available commands:

### Checking

To check your code without making changes:

```sh
npm run check
```

To check and automatically fix issues:

```sh
npm run check:write
```

### Linting

To lint your code without making changes:

```sh
npm run lint
```

To lint and automatically fix issues:

```sh
npm run lint:write
```

### Formatting

To format your code without making changes:

```sh
npm run format
```

To format and automatically apply changes:

```sh
npm run format:write
```

It's recommended to run these commands before committing your changes to ensure code quality and consistency.

## Deployment

### Using Docker Compose

1. Ensure Docker and Docker Compose are installed on your system.
2. Make sure your `.env` file is properly configured.
3. Run the following command:

   ```yaml
   docker-compose up -d
   ```

   This will start both the application and the PostgreSQL database.

## API Documentation

You can access and test the API endpoints using Postman at <https://posdada.xyz>.

## Notes

- The project includes a scheduler (`schedulers.ts`) to reset the `dailySwipesCount` for all users.
- `context.ts` contains the Prisma client and its mock for testing purposes.
- Make sure to check and update the `.env` file before deploying or running the application.

For any further questions or issues, please refer to the project documentation or contact the development team.
