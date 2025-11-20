export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRoute {
  method: HttpMethod;
  path: string;
  description: string;
  requiresAuth: boolean;
  parameters?: Parameter[];
  requestBody?: RequestBodyField[];
  response?: ResponseExample;
}

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface RequestBodyField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ResponseExample {
  status: number;
  body: string;
}

export interface RouteSection {
  title: string;
  description: string;
  routes: ApiRoute[];
}

export const apiDocumentation: RouteSection[] = [
  {
    title: 'Authentication',
    description: 'Endpoints for user authentication and registration.',
    routes: [
      {
        method: 'POST',
        path: '/auth/login',
        description: 'Authenticate a user and receive an access token.',
        requiresAuth: false,
        requestBody: [
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'User email address',
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            description: 'User password',
          },
        ],
        response: {
          status: 200,
          body: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "johndoe",
    "givenName": "John",
    "familyName": "Doe",
    "picture": "https://...",
    "bio": "Software developer",
    "phoneNumber": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA"
    },
    "settings": {
      "theme": "dark",
      "autoAcceptFriendInvitations": false,
      "privacy": {...},
    }
  }
}`,
        },
      },
      {
        method: 'POST',
        path: '/auth/register',
        description: 'Create a new user account.',
        requiresAuth: false,
        requestBody: [
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'User email address',
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            description: 'User password (minimum 6 characters)',
          },
          {
            name: 'name',
            type: 'string',
            required: false,
            description: 'Username (auto-generated from email if not provided)',
          },
        ],
        response: {
          status: 201,
          body: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com",
    "name": "newuser"
  }
}`,
        },
      },
      {
        method: 'POST',
        path: '/auth/social',
        description:
          "Authenticate using social provider credentials (creates account if doesn't exist).",
        requiresAuth: false,
        requestBody: [
          {
            name: 'provider',
            type: 'string',
            required: true,
            description: 'Social provider name',
          },
          {
            name: 'providerId',
            type: 'string',
            required: true,
            description: 'User ID from provider',
          },
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'User email from provider',
          },
          {
            name: 'name',
            type: 'string',
            required: false,
            description: 'User name from provider',
          },
          {
            name: 'image',
            type: 'string',
            required: false,
            description: 'Profile image URL from provider',
          },
        ],
        response: {
          status: 200,
          body: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "social@example.com",
    "name": "socialuser",
    "picture": "https://..."
  }
}`,
        },
      },
      {
        method: 'POST',
        path: '/auth/check-email',
        description:
          'Check if an email is already registered and if it has a password set.',
        requiresAuth: false,
        requestBody: [
          {
            name: 'email',
            type: 'string',
            required: true,
            description: 'Email to check',
          },
        ],
        response: {
          status: 200,
          body: `{
  "exists": true,
  "hasPassword": true
}`,
        },
      },
    ],
  },
  {
    title: 'Users',
    description: 'Endpoints for managing user profiles and settings.',
    routes: [
      {
        method: 'GET',
        path: '/users/me',
        description: "Get the authenticated user's complete profile.",
        requiresAuth: true,
        response: {
          status: 200,
          body: `{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "johndoe",
  "givenName": "John",
  "familyName": "Doe",
  "bio": "Software developer",
  "picture": "https://...",
  "phoneNumber": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "settings": {
    "theme": "dark",
    "autoAcceptFriendInvitations": false,
    "privacy": {
      "showEmail": false,
      "showPhoneNumber": false,
      "showAddress": false,
      "showGivenName": true,
      "showFamilyName": true,
      "showBio": true,
      "showPicture": true
    },
  }
}`,
        },
      },
      {
        method: 'GET',
        path: '/users/search',
        description:
          'Search for users by name with friendship status information.',
        requiresAuth: true,
        parameters: [
          {
            name: 'search',
            type: 'string',
            required: true,
            description: 'Search query (case-insensitive regex on name)',
          },
        ],
        response: {
          status: 200,
          body: `{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "johndoe",
      "givenName": "John",
      "familyName": "Doe",
      "picture": "https://...",
      "isCurrentUser": false,
      "friendshipStatus": {
        "status": "accepted",
        "isPendingFromMe": false,
        "isPendingToMe": false,
        "friendshipId": "507f1f77bcf86cd799439012"
      }
    }
  ]
}`,
        },
      },
      {
        method: 'GET',
        path: '/users/check-username',
        description: 'Check if a username is available.',
        requiresAuth: true,
        parameters: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Username to check',
          },
        ],
        response: {
          status: 200,
          body: `{
  "available": true
}`,
        },
      },
      {
        method: 'GET',
        path: '/users/:userID/profile',
        description: "Get a user's public profile (respects privacy settings).",
        requiresAuth: true,
        parameters: [
          {
            name: 'userID',
            type: 'string',
            required: true,
            description: 'User ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "id": "507f1f77bcf86cd799439011",
  "name": "johndoe",
  "givenName": "John",
  "familyName": "Doe",
  "picture": "https://...",
  "bio": "Software developer",
  "committees": [
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Engineering Committee",
      "type": "standing",
      "role": "Member"
    }
  ],
  "friendshipStatus": {
    "status": "accepted",
    "isPendingFromMe": false,
    "isPendingToMe": false,
    "friendshipId": "507f1f77bcf86cd799439012"
  },
  "mutualFriendsCount": 5,
  "isOwnProfile": false
}`,
        },
      },
      {
        method: 'PATCH',
        path: '/users/me',
        description: "Update the authenticated user's profile.",
        requiresAuth: true,
        requestBody: [
          {
            name: 'name',
            type: 'string',
            required: false,
            description: 'Updated username (must be unique)',
          },
          {
            name: 'givenName',
            type: 'string',
            required: false,
            description: 'Updated given name',
          },
          {
            name: 'familyName',
            type: 'string',
            required: false,
            description: 'Updated family name',
          },
          {
            name: 'bio',
            type: 'string',
            required: false,
            description: 'Updated bio',
          },
          {
            name: 'picture',
            type: 'string',
            required: false,
            description: 'Updated avatar URL',
          },
          {
            name: 'phoneNumber',
            type: 'string',
            required: false,
            description: 'Updated phone number',
          },
          {
            name: 'address',
            type: 'object',
            required: false,
            description: 'Updated address object',
          },
        ],
        response: {
          status: 200,
          body: `{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "johndoe",
  "givenName": "John",
  "familyName": "Doe",
  "bio": "Updated bio",
  "picture": "https://...",
  "phoneNumber": "+1234567890"
}`,
        },
      },
      {
        method: 'PATCH',
        path: '/users/me/settings',
        description: 'Update user settings (theme, privacy).',
        requiresAuth: true,
        requestBody: [
          {
            name: 'theme',
            type: 'string',
            required: false,
            description: 'Theme preference (light, dark, system)',
          },
          {
            name: 'autoAcceptFriendInvitations',
            type: 'boolean',
            required: false,
            description: 'Auto-accept friend requests',
          },
          {
            name: 'privacy',
            type: 'object',
            required: false,
            description: 'Privacy settings object',
          },
        ],
        response: {
          status: 200,
          body: `{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "johndoe",
  "settings": {
    "theme": "dark",
    "autoAcceptFriendInvitations": false,
    "privacy": {...},
  }
}`,
        },
      },
    ],
  },
  {
    title: 'Friends',
    description: 'Endpoints for managing friend relationships.',
    routes: [
      {
        method: 'GET',
        path: '/users/me/friends',
        description: 'Get all accepted friendships for the authenticated user.',
        requiresAuth: true,
        response: {
          status: 200,
          body: `{
  "friendships": [
    {
      "id": "507f1f77bcf86cd799439012",
      "requesterId": "507f1f77bcf86cd799439011",
      "addresseeId": "507f1f77bcf86cd799439013",
      "status": "accepted",
      "requestedAt": "2025-01-15T10:30:00Z",
      "respondedAt": "2025-01-15T12:00:00Z",
      "user": {
        "id": "507f1f77bcf86cd799439013",
        "name": "janedoe",
        "givenName": "Jane",
        "familyName": "Doe",
        "picture": "https://..."
      }
    }
  ]
}`,
        },
      },
      {
        method: 'GET',
        path: '/users/me/friends/pending',
        description: 'Get friend requests sent to the authenticated user.',
        requiresAuth: true,
        response: {
          status: 200,
          body: `{
  "pendingRequests": [
    {
      "id": "507f1f77bcf86cd799439014",
      "requesterId": "507f1f77bcf86cd799439015",
      "addresseeId": "507f1f77bcf86cd799439011",
      "status": "pending",
      "requestedAt": "2025-01-16T08:00:00Z",
      "user": {
        "id": "507f1f77bcf86cd799439015",
        "name": "bobsmith",
        "email": "bob@example.com",
        "picture": "https://..."
      }
    }
  ]
}`,
        },
      },
      {
        method: 'GET',
        path: '/users/me/friends/sent',
        description: 'Get friend requests sent by the authenticated user.',
        requiresAuth: true,
        response: {
          status: 200,
          body: `{
  "sentRequests": [
    {
      "id": "507f1f77bcf86cd799439016",
      "requesterId": "507f1f77bcf86cd799439011",
      "addresseeId": "507f1f77bcf86cd799439017",
      "status": "pending",
      "requestedAt": "2025-01-16T09:00:00Z",
      "user": {
        "id": "507f1f77bcf86cd799439017",
        "name": "alicejones",
        "email": "alice@example.com",
        "picture": "https://..."
      }
    }
  ]
}`,
        },
      },
      {
        method: 'GET',
        path: '/users/me/friends/:friendshipId',
        description: 'Get details of a specific accepted friendship.',
        requiresAuth: true,
        parameters: [
          {
            name: 'friendshipId',
            type: 'string',
            required: true,
            description: 'Friendship ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "friendship": {
    "id": "507f1f77bcf86cd799439012",
    "requesterId": "507f1f77bcf86cd799439011",
    "addresseeId": "507f1f77bcf86cd799439013",
    "status": "accepted",
    "requestedAt": "2025-01-15T10:30:00Z",
    "respondedAt": "2025-01-15T12:00:00Z"
  }
}`,
        },
      },
      {
        method: 'POST',
        path: '/users/me/friends/request',
        description: 'Send a friend request.',
        requiresAuth: true,
        requestBody: [
          {
            name: 'addresseeId',
            type: 'string',
            required: true,
            description: 'ID of user to send request to',
          },
        ],
        response: {
          status: 201,
          body: `{
  "message": "friend request sent",
  "friendship": {
    "id": "507f1f77bcf86cd799439018",
    "requesterId": "507f1f77bcf86cd799439011",
    "addresseeId": "507f1f77bcf86cd799439019",
    "status": "pending",
    "requestedAt": "2025-01-16T10:00:00Z"
  }
}`,
        },
      },
      {
        method: 'POST',
        path: '/users/me/friends/:friendshipId/accept',
        description: 'Accept a friend request.',
        requiresAuth: true,
        parameters: [
          {
            name: 'friendshipId',
            type: 'string',
            required: true,
            description: 'Friendship ID to accept',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "friend request accepted"
}`,
        },
      },
      {
        method: 'POST',
        path: '/users/me/friends/:friendshipId/reject',
        description: 'Reject a friend request.',
        requiresAuth: true,
        parameters: [
          {
            name: 'friendshipId',
            type: 'string',
            required: true,
            description: 'Friendship ID to reject',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "friend request rejected"
}`,
        },
      },
      {
        method: 'POST',
        path: '/users/me/friends/block',
        description: 'Block a user.',
        requiresAuth: true,
        requestBody: [
          {
            name: 'blockedUserId',
            type: 'string',
            required: true,
            description: 'ID of user to block',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "user blocked"
}`,
        },
      },
      {
        method: 'DELETE',
        path: '/users/me/friends/:friendshipId',
        description: 'Remove a friend.',
        requiresAuth: true,
        parameters: [
          {
            name: 'friendshipId',
            type: 'string',
            required: true,
            description: 'Friendship ID to remove',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "friend deleted"
}`,
        },
      },
      {
        method: 'DELETE',
        path: '/users/me/friends/:friendshipId/unblock',
        description: 'Unblock a user.',
        requiresAuth: true,
        parameters: [
          {
            name: 'friendshipId',
            type: 'string',
            required: true,
            description: 'Blocked relationship ID to remove',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "user unblocked"
}`,
        },
      },
    ],
  },
  {
    title: 'Chat',
    description: 'Endpoints for managing direct messages and conversations.',
    routes: [
      {
        method: 'GET',
        path: '/chat/conversations',
        description: 'Get all conversations for the authenticated user.',
        requiresAuth: true,
        response: {
          status: 200,
          body: `{
  "conversations": [
    {
      "roomId": "dm_507f1f77bcf86cd799439011_507f1f77bcf86cd799439013",
      "type": "dm",
      "participants": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"],
      "otherUser": {
        "id": "507f1f77bcf86cd799439013",
        "name": "janedoe",
        "givenName": "Jane",
        "familyName": "Doe",
        "picture": "https://..."
      },
      "lastMessage": {
        "id": "507f1f77bcf86cd799439027",
        "senderId": "507f1f77bcf86cd799439013",
        "roomId": "dm_507f1f77bcf86cd799439011_507f1f77bcf86cd799439013",
        "content": "Hey, how are you?",
        "timestamp": "2025-01-16T10:30:00Z"
      },
      "lastMessageAt": "2025-01-16T10:30:00Z",
      "unreadCount": 0
    }
  ]
}`,
        },
      },
      {
        method: 'DELETE',
        path: '/chat/conversations',
        description: 'Delete multiple conversations by room IDs.',
        requiresAuth: true,
        requestBody: [
          {
            name: 'roomIds',
            type: 'string[]',
            required: true,
            description: 'Array of room IDs to delete',
          },
        ],
        response: {
          status: 200,
          body: `{
  "deletedCount": 42,
  "message": "Conversations deleted successfully"
}`,
        },
      },
      {
        method: 'GET',
        path: '/chat/dm/:recipientId/history',
        description: 'Get direct message history with a user.',
        requiresAuth: true,
        parameters: [
          {
            name: 'recipientId',
            type: 'string',
            required: true,
            description: 'Recipient user ID',
          },
          {
            name: 'limit',
            type: 'integer',
            required: false,
            description: 'Maximum number of messages (max 100, default 50)',
          },
          {
            name: 'before',
            type: 'string',
            required: false,
            description: 'ISO 8601 timestamp to paginate before',
          },
        ],
        response: {
          status: 200,
          body: `{
  "roomId": "dm_507f1f77bcf86cd799439011_507f1f77bcf86cd799439013",
  "messages": [
    {
      "id": "507f1f77bcf86cd799439027",
      "senderId": "507f1f77bcf86cd799439013",
      "roomId": "dm_507f1f77bcf86cd799439011_507f1f77bcf86cd799439013",
      "content": "Hey, how are you?",
      "timestamp": "2025-01-16T10:30:00Z",
      "isEdited": false,
      "isPinned": false
    }
  ],
  "users": [
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "janedoe",
      "email": "jane@example.com",
      "picture": "https://..."
    }
  ],
  "hasMore": false
}`,
        },
      },
      {
        method: 'POST',
        path: '/chat/dm/start',
        description: 'Start a direct message conversation.',
        requiresAuth: true,
        requestBody: [
          {
            name: 'recipientId',
            type: 'string',
            required: true,
            description: 'ID of recipient user',
          },
        ],
        response: {
          status: 200,
          body: `{
  "roomId": "dm_507f1f77bcf86cd799439011_507f1f77bcf86cd799439013",
  "room": {
    "id": "dm_507f1f77bcf86cd799439011_507f1f77bcf86cd799439013",
    "type": "dm",
    "participants": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"],
    "createdAt": "2025-01-16T10:00:00Z",
    "updatedAt": "2025-01-16T10:00:00Z"
  }
}`,
        },
      },
    ],
  },
  {
    title: 'Committees',
    description: 'Endpoints for managing committee chats.',
    routes: [
      {
        method: 'GET',
        path: '/committees/:id/chat/history',
        description: 'Get committee chat history.',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "roomId": "committee_507f1f77bcf86cd799439030",
  "messages": [
    {
      "id": "507f1f77bcf86cd799439031",
      "senderId": "507f1f77bcf86cd799439011",
      "roomId": "committee_507f1f77bcf86cd799439030",
      "content": "Meeting starts in 10 minutes",
      "timestamp": "2025-01-16T14:50:00Z"
    }
  ],
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "johndoe",
      "email": "john@example.com",
      "picture": "https://..."
    }
  ]
}`,
        },
      },
      // {
      //   method: 'GET',
      //   path: '/users/me/comittees/:comitteeId/motions/:motionId',
      //   description: 'Get details of a specific motion.',
      //   requiresAuth: true,
      //   parameters: [
      //     {
      //       name: 'comitteeId',
      //       type: 'string',
      //       required: true,
      //       description: 'Committee ID',
      //     },
      //     {
      //       name: 'motionId',
      //       type: 'string',
      //       required: true,
      //       description: 'Motion ID',
      //     },
      //   ],
      // },
      {
        method: 'POST',
        path: '/committees/:id/chat/start',
        description: 'Start a committee chat.',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "roomId": "committee_507f1f77bcf86cd799439030",
  "room": {
    "id": "committee_507f1f77bcf86cd799439030",
    "type": "committee",
    "ownerId": "507f1f77bcf86cd799439011",
    "committeeId": "507f1f77bcf86cd799439030",
    "createdAt": "2025-01-16T14:00:00Z",
    "updatedAt": "2025-01-16T14:00:00Z"
  }
}`,
        },
      },
      {
        method: 'POST',
        path: '/committees',
        description: 'Create one committee.',
        requiresAuth: true,
        parameters: [
          {
            name: 'Id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Committee name',
          },
          {
            name: 'type',
            type: 'string',
            required: true,
            description: 'Commmittee type',
          },
          {
            name: 'description',
            type: 'string',
            required: true,
            description: 'Committee description',
          },
          {
            name: 'ownerID',
            type: 'string',
            required: true,
            description: 'Owner ID',
          },
          {
            name: 'chairID',
            type: 'string',
            required: true,
            description: 'Chair ID',
          },
          {
            name: 'memeberIDs',
            type: 'string[]',
            required: true,
            description: 'Member IDs',
          },
          {
            name: 'observerIDs',
            type: 'string[]',
            required: false,
            description: 'Observer IDs',
          },
        ],
        response: {
          status: 200,
          body: `{
"committees": [
  {
    "id": "6754aabb0837f25a36e4cdde",
    "name": "Finance Committee",
    "type": "permanent",
    "description": "Handles budgeting",
    "picture": "https://example.com/image.png",
    "ownerId": "6754aaa00837f25a36e4ca30",
    "chairId": "6754aaa00837f25a36e4ca30",
    "memberIds": [
      "6754ab990837f25a36e4cf12",
      "6754ac230837f25a36e4cfff"
    ],
    "observerIds": [
      "6754ae310837f25a36e4d111"
    ],
    "createdAt": "2025-02-01T17:18:45.123Z",
    "updatedAt": "2025-02-05T22:51:03.812Z"
  }
  ]
}`,
        },
      },
      {
        method: 'GET',
        path: '/committees',
        description: 'Get all committees.',
        requiresAuth: true,
        response: {
          status: 200,
          body: `{
"committees": [
  {
    "id": "6754aabb0837f25a36e4cdde",
    "name": "Finance Committee",
    "type": "permanent",
    "description": "Handles budgeting",
    "picture": "https://example.com/image.png",
    "ownerId": "6754aaa00837f25a36e4ca30",
    "chairId": "6754aaa00837f25a36e4ca30",
    "memberIds": [
      "6754ab990837f25a36e4cf12",
      "6754ac230837f25a36e4cfff"
    ],
    "observerIds": [
      "6754ae310837f25a36e4d111"
    ],
    "createdAt": "2025-02-01T17:18:45.123Z",
    "updatedAt": "2025-02-05T22:51:03.812Z"
  }
  ]
}`,
        },
      },
      {
        method: 'GET',
        path: '/committees/:id',
        description: 'Get the committee of current id.',
        requiresAuth: true,
        parameters: [
          {
            name: 'Id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "committee": {
    "id": "6754aabb0837f25a36e4cdde",
    "name": "Finance Committee",
    "type": "permanent",
    "description": "Handles budgeting",
    "picture": "https://example.com/image.png",
    "ownerId": "6754aaa00837f25a36e4ca30",
    "chairId": "6754aaa00837f25a36e4ca30",
    "memberIds": [
      "6754ab990837f25a36e4cf12",
      "6754ac230837f25a36e4cfff"
    ],
    "observerIds": [
      "6754ae310837f25a36e4d111"
    ],
    "createdAt": "2025-02-01T17:18:45.123Z",
    "updatedAt": "2025-02-05T22:51:03.812Z"
  }
}`,
        },
      },
      {
        method: 'PUT',
        path: '/committees/:id',
        description: 'Update committee basic info (owner only)',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        requestBody: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Updated committee name',
          },
          {
            name: 'description',
            type: 'string',
            required: true,
            description: 'Updated committee description',
          },
          {
            name: 'picture',
            type: 'string',
            required: true,
            description: 'Updated committee picture URL',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Committee updated successfully"
}
`,
        },
      },
      {
        method: 'DELETE',
        path: '/committees/:id',
        description: 'Delete current committee',
        requiresAuth: true,
        parameters: [
          {
            name: 'Id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Committee deleted successfully"
}
`,
        },
      },
      {
        method: 'GET',
        path: '/users/me/committees',
        description: 'Get all committees the authenticated user is part of',
        requiresAuth: true,
        response: {
          status: 200,
          body: `{
  "committees": [
    {
      "id": "6754aabb0837f25a36e4cdde",
      "name": "Finance Committee",
      "type": "permanent",
      "description": "Handles budgeting",
      "picture": "https://example.com/image.png",
      "ownerId": "6754aaa00837f25a36e4ca30",
      "chairId": "6754aaa00837f25a36e4ca30",
      "memberIds": [
        "6754ab990837f25a36e4cf12",
        "6754ac230837f25a36e4cfff"
      ],
      "observerIds": [
        "6754ae310837f25a36e4d111"
      ],
      "createdAt": "2025-02-01T17:18:45.123Z",
      "updatedAt": "2025-02-05T22:51:03.812Z"
    }
  ]
}`,
        },
      },
      {
        method: 'POST',
        path: '/committees/:id/members',
        description: 'Add a member to the committee (owner/chair only)',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        requestBody: [
          {
            name: 'userId',
            type: 'string',
            required: true,
            description: 'User ID to add as member',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Member added successfully"
}`,
        },
      },
      {
        method: 'DELETE',
        path: '/committees/:id/members/:memberId',
        description: 'Remove a member from the committee (owner/chair only)',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
          {
            name: 'memberId',
            type: 'string',
            required: true,
            description: 'Member ID to remove',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Member removed successfully"
}`,
        },
      },
      {
        method: 'POST',
        path: '/committees/:id/observers',
        description: 'Add an observer to the committee (owner/chair only)',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        requestBody: [
          {
            name: 'userId',
            type: 'string',
            required: true,
            description: 'User ID to add as observer',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Observer added successfully"
}`,
        },
      },
      {
        method: 'DELETE',
        path: '/committees/:id/observers/:observerId',
        description: 'Remove an observer from the committee (owner/chair only)',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
          {
            name: 'observerId',
            type: 'string',
            required: true,
            description: 'Observer ID to remove',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Observer removed successfully"
}`,
        },
      },
      {
        method: 'PUT',
        path: '/committees/:id/chair',
        description: 'Change the committee chair (owner only)',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        requestBody: [
          {
            name: 'newChairId',
            type: 'string',
            required: true,
            description: 'User ID of the new chair',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Chair changed successfully"
}`,
        },
      },
      {
        method: 'GET',
        path: '/committees/:id/motions',
        description: 'Get all motions for a committee',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "motions": [
    {
      "id": "507f1f77bcf86cd799439040",
      "committeeId": "6754aabb0837f25a36e4cdde",
      "title": "Budget Approval 2025",
      "description": "Approve the annual budget for 2025",
      "proposerId": "6754aaa00837f25a36e4ca30",
      "status": "open",
      "createdAt": "2025-01-16T10:00:00Z",
      "updatedAt": "2025-01-16T10:00:00Z"
    }
  ]
}`,
        },
      },
      {
        method: 'POST',
        path: '/committees/:id/motions',
        description: 'Create a new motion in a committee',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
        ],
        requestBody: [
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'Motion title',
          },
          {
            name: 'description',
            type: 'string',
            required: true,
            description: 'Motion description',
          },
        ],
        response: {
          status: 201,
          body: `{
  "message": "Motion created successfully",
  "motionId": "507f1f77bcf86cd799439040"
}`,
        },
      },
      {
        method: 'GET',
        path: '/committees/:id/motions/:motionId',
        description: 'Get details of a specific motion',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
          {
            name: 'motionId',
            type: 'string',
            required: true,
            description: 'Motion ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "motion": {
    "id": "507f1f77bcf86cd799439040",
    "committeeId": "6754aabb0837f25a36e4cdde",
    "title": "Budget Approval 2025",
    "description": "Approve the annual budget for 2025",
    "proposerId": "6754aaa00837f25a36e4ca30",
    "status": "open",
    "votes": {
      "yes": 5,
      "no": 2,
      "abstain": 1
    },
    "createdAt": "2025-01-16T10:00:00Z",
    "updatedAt": "2025-01-16T10:00:00Z"
  }
}`,
        },
      },
      {
        method: 'PATCH',
        path: '/committees/:id/motions/:motionId',
        description: 'Update a motion (proposer only)',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
          {
            name: 'motionId',
            type: 'string',
            required: true,
            description: 'Motion ID',
          },
        ],
        requestBody: [
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'Updated motion title',
          },
          {
            name: 'description',
            type: 'string',
            required: false,
            description: 'Updated motion description',
          },
          {
            name: 'status',
            type: 'string',
            required: false,
            description:
              'Updated status (proposed, seconded, open, passed, failed, withdrawn)',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Motion updated successfully"
}`,
        },
      },
      {
        method: 'DELETE',
        path: '/committees/:id/motions/:motionId',
        description: 'Delete a motion (proposer only)',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Committee ID',
          },
          {
            name: 'motionId',
            type: 'string',
            required: true,
            description: 'Motion ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "message": "Motion deleted successfully"
}`,
        },
      },
    ],
  },
  {
    title: 'Messages',
    description: 'Endpoints for managing individual messages.',
    routes: [
      {
        method: 'GET',
        path: '/messages/:id/replies',
        description: 'Get replies to a message.',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Message ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "replies": [
    {
      "id": "507f1f77bcf86cd799439032",
      "senderId": "507f1f77bcf86cd799439013",
      "roomId": "dm_507f1f77bcf86cd799439011_507f1f77bcf86cd799439013",
      "parentMessageId": "507f1f77bcf86cd799439027",
      "content": "This is a reply",
      "timestamp": "2025-01-16T10:31:00Z"
    }
  ]
}`,
        },
      },
      {
        method: 'GET',
        path: '/messages/pinned',
        description: 'Get all pinned messages in a room.',
        requiresAuth: true,
        parameters: [
          {
            name: 'roomId',
            type: 'string',
            required: true,
            description: 'Room ID to get pinned messages from',
          },
        ],
        response: {
          status: 200,
          body: `{
  "pinnedMessages": [
    {
      "id": "507f1f77bcf86cd799439033",
      "senderId": "507f1f77bcf86cd799439011",
      "roomId": "committee_507f1f77bcf86cd799439030",
      "content": "Important announcement",
      "timestamp": "2025-01-16T09:00:00Z",
      "isPinned": true,
      "pinnedBy": "507f1f77bcf86cd799439011",
      "pinnedAt": "2025-01-16T09:05:00Z"
    }
  ]
}`,
        },
      },
      {
        method: 'POST',
        path: '/messages/:id/reaction',
        description: 'Toggle a reaction on a message.',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Message ID',
          },
        ],
        requestBody: [
          {
            name: 'emoji',
            type: 'string',
            required: true,
            description: 'Emoji to react with',
          },
        ],
        response: {
          status: 200,
          body: `{
  "success": true,
  "messageId": "507f1f77bcf86cd799439027",
  "reactions": [
    {
      "emoji": "👍",
      "count": 3,
      "userReacted": true
    },
    {
      "emoji": "❤️",
      "count": 1,
      "userReacted": false
    }
  ]
}`,
        },
      },
      {
        method: 'POST',
        path: '/messages/:id/pin',
        description: 'Toggle pin status on a message.',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Message ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "success": true,
  "messageId": "507f1f77bcf86cd799439027",
  "isPinned": true,
  "pinnedBy": "507f1f77bcf86cd799439011",
  "pinnedAt": "2025-01-16T11:00:00Z"
}`,
        },
      },
      {
        method: 'PUT',
        path: '/messages/:id',
        description: 'Edit a message (only your own messages).',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Message ID',
          },
        ],
        requestBody: [
          {
            name: 'content',
            type: 'string',
            required: true,
            description: 'Updated message content',
          },
        ],
        response: {
          status: 200,
          body: `{
  "id": "507f1f77bcf86cd799439027",
  "content": "Updated message content",
  "isEdited": true,
  "originalContent": "Original message content",
  "editedAt": "2025-01-16T11:00:00Z"
}`,
        },
      },
      {
        method: 'DELETE',
        path: '/messages/:id',
        description: 'Delete a message (only your own messages).',
        requiresAuth: true,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Message ID',
          },
        ],
        response: {
          status: 200,
          body: `{
  "success": true,
  "messageId": "507f1f77bcf86cd799439027"
}`,
        },
      },
    ],
  },
  {
    title: 'WebSocket',
    description: 'Real-time communication endpoints.',
    routes: [
      {
        method: 'GET',
        path: '/ws/chat',
        description:
          'Establish WebSocket connection for real-time chat (upgrades HTTP to WebSocket).',
        requiresAuth: true,
        parameters: [
          {
            name: 'token',
            type: 'string',
            required: true,
            description: 'JWT authentication token (query parameter)',
          },
        ],
        response: {
          status: 101,
          body: `{
  "action": "new_message",
  "type": "chat",
  "payload": {
    "message": {
      "id": "...",
      "senderId": "...",
      "roomId": "...",
      "content": "..."
    }
  }
}`,
        },
      },
    ],
  },
];
