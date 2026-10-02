# NestJS Fastify Auth

An authentication backend built with NestJS on the Fastify adapter, with a code-first GraphQL API, PostgreSQL through Prisma, and SendGrid for email. It handles registration, password login with a one-time code sent by email, access and refresh tokens backed by a session table, password reset, and role checks on resolvers.

The email and password, OTP, token and role flows are wired into the app. Google and Facebook login and the file storage module are written but not connected yet. The [Status](#status) section lists what is wired and what is missing.

## Auth flows

### Registration

`register` takes a full name, email and password. The password is hashed with bcrypt (10 salt rounds) and the user is stored with `provider = EMAIL` and the default role `USER`. The response contains the user and a token pair.

### Login with email, password and OTP

`login` runs through a Passport local strategy. A custom guard copies the GraphQL arguments into the request body so `passport-local` can read them. If the password matches, the server creates a session, generates a 6-digit code, stores it in the `Otp` table, and emails it through SendGrid. The client then calls `VerifyOtp` with the code. A code is accepted for 5 minutes after it was created, the row is deleted once it has been used, and a new session is issued.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API (GraphQL)
    participant D as PostgreSQL
    participant S as SendGrid

    C->>A: login(email, password)
    A->>D: find user by email
    A->>A: bcrypt compare
    A->>D: delete old sessions, insert new session (refresh token)
    A->>D: insert Otp (6 digits)
    A->>S: send OTP email
    A-->>C: user, accessToken, refreshToken
    C->>A: VerifyOtp(code) with Bearer accessToken
    A->>D: find Otp by user and code, check age under 5 min
    A->>D: delete Otp, replace session
    A-->>C: user, new accessToken, new refreshToken
```

### Access and refresh tokens

Both tokens are JWTs signed with `JWT_SECRET`. The access token lasts 15 minutes and carries the user id, email and role. The refresh token lasts 7 days and carries only the user id.

The refresh token is saved in the `Session` table with its expiry date. Every time a session is created (register, login, OTP verification, password reset, refresh) all existing sessions for that user are deleted first, so a user has one active refresh token at a time and the previous one stops working.

`refreshToken` requires a valid access token in the `Authorization` header plus the refresh token as an argument. The server looks the refresh token up in the `Session` table and, if it is there, issues a new pair.

### Password reset

`forgetPassword` takes an email, sends an OTP to it and returns a session. With that session the client calls `VerifyOtp` and then `changePassword`, which hashes and stores the new password for the authenticated user.

### Roles

Users have a `role` of `USER` or `ADMIN`. Protected resolvers use two guards. `AuthGuard` reads the Bearer token, verifies it, loads the user from the database and attaches it to the GraphQL context. `RolesGuard` compares the user's role with the roles set by the `@Roles()` decorator. `getUsers` is admin only.

### Google and Facebook OAuth

Passport strategies for Google (`passport-google-oauth20`) and Facebook (`passport-facebook`) are in `src/auth/passport/`. Each one looks the user up by email and creates a user with `provider = GOOGLE` or `FACEBOOK` and the provider's profile id in `socialAuth` if none exists. They are not registered in `AuthModule` and there are no redirect or callback routes yet, so social login does not work in the current code.

## API

The server listens on `PORT` (default 8000). GraphQL is served at `/graphql`. The schema is generated from the resolvers into `src/schema.gql`.

### GraphQL

| Operation | Type | Auth | What it does |
| --- | --- | --- | --- |
| `register(input: RegisterUserDto!)` | Mutation | none | Creates a user, returns user and tokens |
| `login(email, password)` | Mutation | email and password | Checks credentials, emails an OTP, returns user and tokens |
| `VerifyOtp(code)` | Mutation | Bearer token | Checks the OTP, deletes it, returns a new token pair |
| `forgetPassword(email)` | Mutation | none | Emails an OTP and returns a session for the reset flow |
| `changePassword(password)` | Mutation | Bearer token | Sets a new password for the current user |
| `refreshToken(refreshToken)` | Mutation | Bearer token | Exchanges a stored refresh token for a new pair |
| `getUsers` | Query | Bearer token, `ADMIN` | Lists all users |
| `getUserById(id)` | Query | Bearer token | Returns one user |
| `updateUser(user: UpdateUserInput!)` | Mutation | Bearer token | Updates full name, phone, address or profile picture |

### REST

| Route | What it does |
| --- | --- |
| `GET /` | Returns a welcome string |

`src/storage/` also has a controller with `POST /storage/upload`, `DELETE /storage/:key` and `GET /storage/signed-url` backed by Google Cloud Storage. `StorageModule` is not imported in `AppModule`, so these routes are not served.

## Tech stack

- NestJS 10 on `@nestjs/platform-fastify` (Fastify 4)
- GraphQL with `@nestjs/graphql` and Apollo Server 4, code first
- PostgreSQL with Prisma 6
- Passport (`passport-local`; Google, Facebook and JWT strategies present but unused)
- `@nestjs/jwt` for signing and verifying tokens
- bcrypt for password hashing
- `class-validator` and `class-transformer` for input validation
- SendGrid (`@sendgrid/mail`) for email
- `@google-cloud/storage` and `@fastify/multipart` for the storage module
- TypeScript, ESLint, Prettier

## Design notes

### Fastify adapter

`main.ts` creates the app with `FastifyAdapter`, with Fastify's logger and `trustProxy` turned on, and registers `@fastify/multipart` for uploads. Nest's `FileInterceptor` is built on multer and Express, so the storage module has its own small interceptor that reads the file from the Fastify request.

### Passport with GraphQL

Passport strategies expect credentials on `req.body`, and GraphQL arguments are not there. `LocalAuthGuard` overrides `getRequest` to merge the mutation arguments into the body. The `@CurrentUser()` decorator reads the user back out of the GraphQL context.

### Sessions in the database

Refresh tokens are stored in a `Session` table, and `refreshToken` looks the token up there before issuing a new pair. Storing them is what lets the server replace the token on each use and drop old sessions.

### Validation

A global `ValidationPipe` runs with `whitelist`, `forbidNonWhitelisted` and `transform`, so unknown input fields are rejected. `RegisterUserDto` requires a valid email, a full name of at least 4 characters and a password of at least 6.

### Prisma schema

The schema is split into one file per model under `prisma/schema/` using the `prismaSchemaFolder` preview feature.

- `User`: unique email, nullable `password` (social accounts have none), `provider` enum (`EMAIL`, `GOOGLE`, `FACEBOOK`), `role` enum (`USER`, `ADMIN`, default `USER`), `socialAuth` for the provider's user id, plus optional phone, address and profile picture.
- `Session`: UUID id, unique `token`, `expiresAt`, indexes on `userId`, `token` and `isValid`, and cascade delete with the user.
- `Otp`: code, `expiresAt`, `used` flag and a relation to the user.

### Modules

`AuthModule` holds the resolver, service and Passport strategies. `UserModule` holds user queries and updates. `EmailModule` wraps SendGrid. `PrismaModule` exposes one `PrismaService`. `JwtModule` is registered globally in `AppModule`. Guards and decorators shared between modules are in `src/common/`.

## Status

Working:

- register, login, OTP verification, password reset, token refresh
- role-based guards on user queries and mutations
- OTP email through SendGrid

Written but not wired in:

- Google and Facebook strategies (not registered, no routes)
- `JwtStrategy` (the custom `AuthGuard` verifies tokens itself)
- storage module for Google Cloud Storage (not imported in `AppModule`)

Known gaps I would fix before using this in production:

- `login` and `forgetPassword` return the OTP code and a usable token pair in the response. The OTP step is therefore not enforced by the server.
- `refreshToken` checks that the token exists in `Session` but does not check `expiresAt`, `isValid`, or that the session belongs to the caller.
- `getUserById` and `updateUser` accept any user id from any logged-in user.
- The `User` GraphQL type exposes the `password` hash field.
- OTP expiry is checked against `createdAt`; the `expiresAt` and `used` columns are not read.
- There is no rate limiting or CORS configuration.
- There are no tests beyond the file the Nest CLI generates.

## Project structure

```
prisma/
  schema/            schema.prisma, user.prisma, session.prisma, otp.prisma
  migrations/        11 migrations
src/
  main.ts            Fastify bootstrap, multipart, global ValidationPipe
  app.module.ts      GraphQL, global JwtModule, feature modules
  auth/
    auth.resolver.ts mutations for register, login, OTP, reset, refresh
    auth.service.ts  session creation, OTP, password hashing
    passport/        local, jwt, google and facebook strategies
    dto/, model/     GraphQL input and response types
  user/              user resolver, service and model
  common/
    guards/          AuthGuard, LocalAuthGuard, RolesGuard
    decorators/      @CurrentUser, @Roles
  database/          PrismaModule, PrismaService
  email/             EmailService, SendGrid client
  storage/           GCS controller, service, Fastify file interceptor
  schema.gql         generated GraphQL schema
utils/
  encryption.utils.ts  bcrypt hash and compare
  otp.utils.ts         OTP generation and expiry check
docker-compose.yml   PostgreSQL
```

## Getting started

### Prerequisites

- Node.js and npm
- Docker (for the bundled PostgreSQL) or your own PostgreSQL instance
- A SendGrid API key and a verified sender address. The app throws on startup if `SENDGRID_API_KEY` is missing.

### Install

```sh
git clone https://github.com/sheharyarIshfaq/NestJS-Fastify-Auth.git
cd NestJS-Fastify-Auth
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | Secret for signing access and refresh tokens |
| `SENDGRID_API_KEY` | SendGrid API key (required at startup) |
| `SENDGRID_SENDER` | From address for OTP emails |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google OAuth strategy (not wired in yet) |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_CALLBACK_URL` | Facebook OAuth strategy (not wired in yet) |
| `PROJECT_ID`, `KEY_FILENAME`, `BUCKET` | Google Cloud project id, path to the service account key file, and bucket name for the storage module (not wired in yet) |

`PORT` is optional and defaults to 8000.

The project does not use `dotenv` or `@nestjs/config`; the code reads `process.env` directly. Prisma loads `.env` from the project root. If a variable is not picked up when the app starts, export it in your shell first:

```sh
set -a; source .env; set +a
```

### Database

`docker-compose.yml` starts a PostgreSQL container on port 5432 with user `nestuser`, password `nestpassword` and database `nestdb`:

```sh
docker compose up -d
```

The matching connection string is:

```
DATABASE_URL=postgresql://nestuser:nestpassword@localhost:5432/nestdb
```

Apply the migrations and generate the Prisma client:

```sh
npx prisma migrate dev
```

### Run

```sh
npm run start:dev    # watch mode
npm run start        # single run
npm run build        # compile to dist/
node dist/src/main   # run the compiled build
```

The `start:prod` script in `package.json` points at `dist/main`, but the build output is at `dist/src/main` because `utils/` sits outside `src/`. Use the command above until the script is fixed.

Open `http://localhost:8000/graphql` and send a mutation, for example:

```graphql
mutation {
  register(input: { fullname: "Test User", email: "test@example.com", password: "secret123" }) {
    user { id email role }
    session { accessToken refreshToken }
  }
}
```

For protected operations, send the access token as `Authorization: Bearer <accessToken>`.

Other scripts: `npm run lint` (ESLint with `--fix`) and `npm run format` (Prettier).
