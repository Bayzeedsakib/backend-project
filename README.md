# 🎵 Music App Moderator API

The backend of a music app moderation system, built with **NestJS**, **TypeORM** and **PostgreSQL**. Moderators register and log in with **JWT**, then manage their profile, the tracks they moderate, and playlists.

The frontend lives in **[next-app-angel](https://github.com/Bayzeedsakib/next-app-angel)** (Next.js 16).

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=flat-square&logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

## ✨ Features

- **JWT authentication** with Passport (`passport-jwt`) and a reusable `JwtAuthGuard`
- **Password hashing** with bcrypt
- **Request validation** with `class-validator` and a global `ValidationPipe` (`whitelist` + `transform`)
- **Full moderator CRUD**, plus a `PATCH` endpoint to toggle `active` / `inactive` status
- Shows all three main relationship types in TypeORM:
  - **One-to-one**: Moderator ↔ Profile
  - **One-to-many**: Moderator → Tracks
  - **Many-to-many**: Tracks ↔ Playlists
- Configuration through environment variables (`@nestjs/config`)

## 🗂 Data Model

```
┌────────────┐ 1     1 ┌──────────┐
│ Moderator  │─────────│ Profile  │   displayName, bio
│ email      │         └──────────┘
│ password   │
│ status     │ 1     * ┌──────────┐ *     * ┌───────────┐
│            │─────────│  Track   │─────────│ Playlist  │
└────────────┘         │ title    │         │ name      │
                       │ artist   │         └───────────┘
                       └──────────┘
```

## 📡 API Endpoints

### Auth: `/auth`

| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a moderator `{ email, password, displayName?, bio? }` |
| `POST` | `/auth/login` | Log in and receive `{ access_token }` |

### Moderators: `/moderators` (🔒 Bearer token unless noted)

| Method | Route | Description |
|---|---|---|
| `POST` | `/moderators` | Create a moderator (public) |
| `GET` | `/moderators` | List all moderators |
| `GET` | `/moderators/:id` | Get one moderator |
| `PUT` | `/moderators/:id` | Update a moderator |
| `PATCH` | `/moderators/:id/status` | Set status `{ "status": "active" \| "inactive" }` |
| `DELETE` | `/moderators/:id` | Delete a moderator |

### Tracks & Playlists (🔒)

| Method | Route | Description |
|---|---|---|
| `POST` | `/moderators/:id/tracks` | Add a track `{ title, artist? }` to a moderator |
| `GET` | `/moderators/:id/tracks` | List a moderator's tracks |
| `DELETE` | `/moderators/tracks/:trackId` | Delete a track |
| `POST` | `/moderators/playlists` | Create a playlist `{ name, trackIds: [] }` |
| `GET` | `/moderators/playlists/:playlistId` | Get a playlist with its tracks |
| `POST` | `/moderators/playlists/:playlistId/tracks/:trackId` | Add a track to a playlist |
| `DELETE` | `/moderators/playlists/:playlistId/tracks/:trackId` | Remove a track from a playlist |

## 🚀 Getting Started

**Prerequisites:** Node.js 18+ and PostgreSQL.

```bash
git clone https://github.com/Bayzeedsakib/backend-project.git
cd backend-project
npm install
```

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=music_moderator
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRATION=1d
PORT=3000
```

Run the server:

```bash
npm run start:dev     # watch mode
npm run start:prod    # after `npm run build`
```

The API runs at `http://localhost:3000`. TypeORM `synchronize` is on, so tables are created automatically in development.

## 🧪 Tests

```bash
npm run test       # unit tests
npm run test:e2e   # end-to-end tests
```

## 🧱 Project Structure

```
src/
├── auth/          # register/login, JWT strategy & guard
├── moderators/    # controller, service, DTOs
├── entities/      # Moderator, Profile, Track, Playlist
├── app.module.ts  # TypeORM + config wiring
└── main.ts        # bootstrap + global ValidationPipe
```

## 👤 Author

**Bayzeed Sakib** · [GitHub](https://github.com/Bayzeedsakib) · [Portfolio](https://bayzeed-sakib-portfolio.vercel.app)
