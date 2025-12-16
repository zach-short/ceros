# Project Report: Ceros

## Demo Links

- **Demo Video**: [Demo Video](https://www.youtube.com/watch?v=AmSdPCBHlj4)
- **Hosted Site**: [Hosted Site](https://ceros.netlify.app/)

## Features

- Real-time chat functionality.
  ![chat](frontend/public/images/group-chat.png)
- Committee and motion management.
  ![committees](frontend/public/images/committee.png)
  ![new-committee](frontend/public/images/new-committee.png)
- Friend management and social features.
  ![friends](frontend/public/images/chat.png)
- WebSocket-based live updates.
- RESTful API for backend operations.

## API Documentation

We have documented the detailed API endpoints in this link: [API Documentation](https://ceros.netlify.app/docs/api). The documenation below introduces some of the key endpoints.

### Authentication

- **POST /api/auth/login**: User login.
- **POST /api/auth/register**: User registration.

### Users

- **GET /api/users**: Fetch all users.
- **GET /api/users/:id**: Fetch user by ID.

### Friends

- **POST /api/friends**: Send a friend request.
- **DELETE /api/friends/:id**: Remove a friend.

### Committees

- **GET /api/committees**: Fetch all committees.
- **POST /api/committees**: Create a new committee.

### Motions

- **GET /api/motions**: Fetch all motions.
- **POST /api/motions**: Create a new motion.

## Database Schema

Users can be friends with each other (via Friends table). Committees group users and motions. Motions are linked to committees.

### Users Table

| Field        | Type                | Description                          |
| ------------ | ------------------- | ------------------------------------ |
| id           | ObjectID (string)   | Unique user identifier               |
| email        | string              | User email address                   |
| name         | string (optional)   | Full name                            |
| givenName    | string (optional)   | Given/first name                     |
| familyName   | string (optional)   | Family/last name                     |
| passwordHash | string (optional)   | Hashed password                      |
| bio          | string (optional)   | User biography                       |
| picture      | string (optional)   | Profile picture URL                  |
| phoneNumber  | string (optional)   | Phone number                         |
| address      | Address (object)    | Address details (street, city, etc.) |
| settings     | UserSettings (obj)  | User settings (theme, privacy, etc.) |
| isOnline     | bool                | Online status                        |
| lastSeen     | DateTime (optional) | Last seen timestamp                  |
| isDeleted    | bool                | Deletion status                      |
| deletedAt    | DateTime (optional) | Deletion timestamp                   |

### Friends Table

| Field       | Type                | Description                                 |
| ----------- | ------------------- | ------------------------------------------- |
| id          | ObjectID (string)   | Unique identifier for the friendship        |
| requesterId | ObjectID (string)   | User ID of the friend request sender        |
| addresseeId | ObjectID (string)   | User ID of the friend request receiver      |
| status      | string (enum)       | Status: "pending", "accepted", or "blocked" |
| requestedAt | DateTime            | Timestamp when the request was sent         |
| respondedAt | DateTime (nullable) | Timestamp when the request was responded to |

### Committees Table

| Column       | Type          | Description                                    |
| ------------ | ------------- | ---------------------------------------------- |
| id           | string (UUID) | Unique identifier for the committee            |
| name         | string        | Committee name                                 |
| description  | string        | Description of the committee                   |
| type         | string        | Committee type/category                        |
| picture      | string (URL)  | Optional committee picture                     |
| ownerId      | string (UUID) | User ID of the committee owner                 |
| chairId      | string (UUID) | User ID of the committee chair                 |
| memberIds    | string[]      | Array of user IDs for committee members        |
| observerIds  | string[]      | Array of user IDs for committee observers      |
| voting_rules | object        | Voting rules (see VotingRules structure below) |
| createdAt    | string (date) | Optional creation timestamp                    |
| updatedAt    | string (date) | Optional last update timestamp                 |

### Motions Table

| Column       | Type         | Description              |
| ------------ | ------------ | ------------------------ |
| id           | UUID         | Unique identifier.       |
| title        | VARCHAR(200) | Motion title.            |
| description  | TEXT         | Motion details.          |
| committee_id | UUID         | Associated committee ID. |
| created_at   | TIMESTAMP    | Creation timestamp.      |
| created_by   | UUID         | ID of the creator.       |
| status       | VARCHAR(50)  | Motion status.           |
