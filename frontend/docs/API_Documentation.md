# API Documentation

This document outlines the API endpoints for the WhatUp Backend application.

## Authentication

All authenticated endpoints require a JWT Bearer token in the `Authorization` header.

**Scheme:** `Bearer <YOUR_JWT_TOKEN>`

## Endpoints

### User Management

#### `POST /user/register`

Registers a new user.

- **Authentication:** None
- **Request Body (multipart/form-data):**
  - `username`: string
  - `email`: string (email format)
  - `password`: string
  - `file`: Optional[UploadFile] - User's profile picture. If provided, it will be uploaded and set as the active profile picture.
- **Responses:**
  - `200 OK`: `UserResponseDto` - User registered successfully.
  - `400 Bad Request`: Invalid input (e.g., username/email already exists, invalid file).

#### `POST /user/login`

Logs in a user and returns an access token.

- **Request Body:**
  ```json
  {
    "username": "string" (can be username or email),
    "password": "string"
  }
  ```
- **Responses:**
  - `200 OK`: `TokenData` - User logged in successfully.
  - `401 Unauthorized`: Invalid credentials.

#### `POST /user/profile-images`
Uploads a new profile image for the authenticated user. Up to 5 images are allowed. If the limit is reached, the oldest inactive image will be replaced. If all 5 are active, an error will be returned.

- **Authentication:** Required (JWT Bearer Token)
  - `200 OK`: `UserImageResponseDto` - Image uploaded successfully.
  - `400 Bad Request`: Invalid image (e.g., unsupported format, size exceeds limit, corrupted file), limit reached, or other issues.

#### `GET /user/profile-images`

Retrieves a list of all profile images for the authenticated user.

- **Authentication:** Required (JWT Bearer Token)
- **Responses:**
  - `200 OK`: `list[UserImageResponseDto]` - List of user's profile images.

#### `GET /user/profile-images/{image_id}/data`

Retrieves the actual image data for a specific profile image belonging to the authenticated user.

- **Authentication:** Required (JWT Bearer Token)
- **Path Parameters:**
  - `image_id`: UUID of the profile image.
- **Responses:**
  - `200 OK`: Image data (e.g., `image/jpeg`).
  - `404 Not Found`: Image not found or does not belong to the user.

#### `DELETE /user/profile-images/{image_id}`
Deletes a specific profile image for the authenticated user. Cannot delete the last active image if it's the only one.

- **Authentication:** Required (JWT Bearer Token)
- **Path Parameters:**
  - `image_id`: UUID of the profile image to delete.
- **Responses:**
  - `200 OK`: `{"detail": "Image deleted successfully."}`
  - `400 Bad Request`: Cannot delete last active image, or other issues.

#### `PUT /user/profile-images/{image_id}/set-active`
Sets a specific profile image as the active one for the authenticated user.

- **Authentication:** Required (JWT Bearer Token)
- **Path Parameters:**
  - `image_id`: UUID of the profile image to set as active.
- **Responses:**
  - `200 OK`: `UserImageResponseDto` - Image set as active successfully.
  - `400 Bad Request`: Image not found or does not belong to the user.

#### `GET /user/me`

Retrieves the authenticated user's profile information.

- **Authentication:** Required (JWT Bearer Token)
- **Responses:**
  - `200 OK`: See UserResponseDto schema below - User profile data, including `account_confirmed`, `bio`, `active_avatar_url`, and `public_key`.
  - `404 Not Found`: User not found.

#### `PUT /user/me/bio`

Allows the authenticated user to update their own bio.

- **Authentication:** Required (JWT Bearer Token)
- **Request Body:**
  ```json
  {
    "bio": "string"
  }
  ```
- **Responses:**
  - `200 OK`: See UserResponseDto schema below - User bio updated successfully.
  - `400 Bad Request`: Invalid input.

#### `PUT /user/public-key`

Updates the authenticated user's public key.

- **Authentication:** Required (JWT Bearer Token)
- **Request Body:**
  ```json
  {
    "public_key": "string"
  }
  ```
- **Responses:**
  - `200 OK`: `{"detail": "Public key updated successfully."}`
  - `400 Bad Request`: Invalid input or user not found.

#### `GET /user/public-key/{user_id}`

Retrieves another user's public key.

- **Authentication:** Required (JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user whose public key to retrieve.
- **Responses:**
  - `200 OK`: `{"public_key": "string"}` - Public key retrieved successfully.
  - `404 Not Found`: Public key not found for this user.
  - `400 Bad Request`: Invalid input.

#### `DELETE /user/delete`

Deletes the authenticated user's account.

- **Authentication:** Required (JWT Bearer Token)
- **Responses:**
  - `200 OK`: `{"detail": "User deleted"}` - User account deleted successfully.
  - `400 Bad Request`: User not found or other issues.

### Admin User Management

#### `GET /user/all`

Retrieves a list of all users (Admin only).

- **Authentication:** Required (Admin JWT Bearer Token)
- **Responses:**
  - `200 OK`: `list[UserResponseAdminListDto]` - List of all user profiles.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Admin privileges required.

#### `GET /user/{user_id}`

Retrieves a user's profile information by ID.

- **Authentication:** Required (JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user to retrieve.
- **Responses:**
  - `200 OK`: `UserResponseDto` - User profile data, including `account_confirmed` status.
  - `404 Not Found`: User not found.

#### `GET /user/admin/users/{user_id}/profile-images`

Retrieves a list of all profile images for a specific user (Admin only).

- **Authentication:** Required (Admin JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user.
- **Responses:**
  - `200 OK`: `list[UserImageResponseDto]` - List of user's profile images.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Admin privileges required.

#### `GET /user/admin/users/{user_id}/profile-images/{image_id}/data`

Retrieves the actual image data for a specific profile image belonging to any user (Admin only).

- **Authentication:** Required (Admin JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user.
  - `image_id`: UUID of the profile image.
- **Responses:**
  - `200 OK`: Image data (e.g., `image/jpeg`).
  - `404 Not Found`: Image not found or does not belong to the user.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Admin privileges required.

#### `PUT /user/admin/edit`

Allows an admin to edit a user's information, including their role, account confirmation, and bio.

- **Authentication:** Required (Admin JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user to edit.
- **Request Body (multipart/form-data):**
  - `role`: "admin" | "user" (optional)
  - `account_confirmed`: true | false (optional)
  - `bio`: string (optional) - The new bio content. Can be empty to clear the bio.
- **Optional File:** `file` (type: file) - New profile picture for the user. If provided, it will be uploaded and set as the active profile picture.
- **Responses:**
  - `200 OK`: `UserResponseAdminDto` - User updated successfully.
  - `404 Not Found`: User not found.
  - `400 Bad Request`: Invalid input.

#### `DELETE /user/admin/delete/{user_id}`

Allows an admin to delete any user's account.

- **Authentication:** Required (Admin JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user to delete.
- **Responses:**
  - `200 OK`: `{"detail": "User deleted by admin"}` - User account deleted successfully.
  - `400 Bad Request`: User not found or other issues.

### Password Management

#### `POST /user/request-password-reset`

Requests a password reset email for the given email address.

- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Responses:**
  - `200 OK`: `{"detail": "Password reset email sent if user exists."}`
  - `400 Bad Request`: Invalid email format.

#### `POST /user/reset-password`

Resets the user's password using a valid reset token.

- **Authentication:** None
- **Request Body:**
  ```json
  {
    "token": "string",
    "new_password": "string",
    "confirm_password": "string"
  }
  ```
- **Responses:**
  - `200 OK`: `{"detail": "Password has been reset successfully."}`
  - `400 Bad Request`: Invalid token, passwords do not match, or user not found.

#### `GET /user/confirm-account`

Confirms a user's account using a valid confirmation token.

- **Authentication:** None
- **Query Parameters:**
  - `token`: string - The account confirmation token.
- **Responses:**
  - `200 OK`: `{"detail": "Account confirmed successfully."}`
  - `400 Bad Request`: Invalid or expired token, or user not found.

## WebSocket

### `GET /ws`

Establishes a WebSocket connection for real-time messaging.

- **Authentication:** Required (JWT Bearer Token passed as a query parameter `token`).
- **Query Parameters:**
  - `token`: string - The JWT Bearer token for authentication.
- **Messages (JSON format):**
  - **Sending (Client to Server):**
    ```json
    {
      "sender_id": "UUID",
      "receiver_id": "UUID" | null,  // For private messages
      "group_id": "UUID" | null,     // For group messages
      "content": "string",           // Message content (encrypted if is_encrypted is true)
      "is_encrypted": "boolean"      // True if content is end-to-end encrypted
    }
    ```
    **Note:** Either `receiver_id` or `group_id` must be provided, but not both.
  - **Receiving (Server to Client):**
    Messages received will be in the `Message` DTO format.
    ```json
    {
      "id": "UUID",
      "sender_id": "UUID",
      "receiver_id": "UUID" | null,
      "group_id": "UUID" | null,
      "conversation_id": "UUID" | null,
      "content": "string",
      "is_encrypted": "boolean",
      "created_at": "datetime"
    }
    ```
- **Connection Lifecycle:**
  - Client connects to `ws://your-backend-url/ws?token=<YOUR_JWT_TOKEN>`.
  - Server validates the token.
  - On successful connection, the client can send and receive messages.
  - Connection closes on `WebSocketDisconnect` or errors.

## Messaging and Conversations

For details on how to implement End-to-End Encryption on the frontend, please refer to the [Frontend E2E Messaging Guide](Frontend_E2E_Messaging_Guide.md).

### Conversations

#### `POST /conversations/`

Creates a new private conversation between two users or retrieves an existing one.

- **Authentication:** Required (JWT Bearer Token)
- **Request Body:**
  ```json
  {
    "user1_id": "UUID",
    "user2_id": "UUID"
  }
  ```
- **Responses:**
  - `200 OK`: `ConversationResponseDto` - The created or retrieved conversation.
  - `403 Forbidden`: If the current user is not one of the participants.
  - `400 Bad Request`: Invalid input.

#### `GET /conversations/my`

Retrieves all conversations the authenticated user is part of.

- **Authentication:** Required (JWT Bearer Token)
- **Responses:**
  - `200 OK`: `List[ConversationResponseDto]` - A list of conversations.

### Messages

#### `POST /messages/send`

Sends a new message. This endpoint handles both private (direct) and group messages.

- **Authentication:** Required (JWT Bearer Token)
- **Request Body:**
  ```json
  {
    "sender_id": "UUID",
    "receiver_id": "UUID" | null,  // Required for private messages
    "group_id": "UUID" | null,     // Required for group messages
    "content": "string",
    "is_encrypted": "boolean"      // True if content is end-to-end encrypted
  }
  ```
  **Note:** Either `receiver_id` or `group_id` must be provided, but not both.
- **Responses:**
  - `200 OK`: `Message` - The sent message.
  - `400 Bad Request`: Invalid input (e.g., both `receiver_id` and `group_id` provided, or neither).
  - `403 Forbidden`: If the sender_id does not match the current authenticated user.

#### `GET /messages/conversation/{conversation_id}`

Retrieves messages for a specific private conversation.

- **Authentication:** Required (JWT Bearer Token)
- **Path Parameters:**
  - `conversation_id`: UUID of the conversation.
- **Responses:**
  - `200 OK`: `List[Message]` - A list of messages in the conversation.
  - `403 Forbidden`: If the current user is not part of the conversation.

#### `GET /messages/group/{group_id}`

Retrieves messages for a specific group.

- **Authentication:** Required (JWT Bearer Token)
- **Path Parameters:**
  - `group_id`: UUID of the group.
- **Responses:**
  - `200 OK`: `List[Message]` - A list of messages in the group.
  - `403 Forbidden`: If the current user is not a member of the group.

# DTO Schemas

## UserResponseDto

```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "account_confirmed": true,
  "active_avatar_url": "string",
  "public_key": "string",
  "bio": "string",
  "created_at": "datetime"
}
```

## UserResponseAdminDto

```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "account_confirmed": true,
  "active_avatar_url": "string",
  "public_key": "string",
  "bio": "string",
  "created_at": "datetime",
  "role": "admin" | "user"
}
```

## UserResponseAdminListDto

```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "account_confirmed": true,
  "active_avatar_url": "string",
  "public_key": "string",
  "created_at": "datetime",
  "role": "admin" | "user"
}
```
