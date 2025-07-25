# API Documentation

This document outlines the API endpoints for the WhatUp Backend application.

## Authentication

All authenticated endpoints require a JWT Bearer token in the `Authorization` header.

**Scheme:** `Bearer <YOUR_JWT_TOKEN>`

## Endpoints

### User Management

#### `POST /user/register`

Registers a new user.

- **Request Body (multipart/form-data):**
  - `username`: string
  - `email`: string (email format)
  - `password`: string
- **Optional File:** `file` (UploadFile) - User profile picture. If provided, the profile picture will be processed and associated with the user after successful registration and set as the active profile picture.
- **Responses:**
  - `200 OK`: `UserResponseDto` - User registered successfully.
  - `400 Bad Request`: If username or email already exists, or invalid input.

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
- **Request Body:** `file` (UploadFile) - New profile image.
- **Responses:**
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
  - `404 Not Found`: Image not found or does not belong to the user.

#### `PUT /user/profile-images/{image_id}/set-active`

Sets a specific profile image as the active one for the authenticated user.

- **Authentication:** Required (JWT Bearer Token)
- **Path Parameters:**
  - `image_id`: UUID of the profile image to set as active.
- **Responses:**
  - `200 OK`: `UserImageResponseDto` - Image set as active successfully.
  - `400 Bad Request`: Image not found or does not belong to the user.

#### `GET /admin/users/{user_id}/profile-images`

Retrieves a list of all profile images for a specific user (Admin only).

- **Authentication:** Required (Admin JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user.
- **Responses:**
  - `200 OK`: `list[UserImageResponseDto]` - List of user's profile images.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Admin privileges required.

#### `GET /admin/users/{user_id}/profile-images/{image_id}/data`

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

#### `DELETE /user/delete`

Deletes the authenticated user's account.

- **Authentication:** Required (JWT Bearer Token)
- **Responses:**
  - `200 OK`: `{"detail": "User deleted"}` - User account deleted successfully.
  - `400 Bad Request`: User not found or other issues.

#### `DELETE /user/admin/delete/{user_id}`

Allows an admin to delete any user's account.

- **Authentication:** Required (Admin JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user to delete.
- **Responses:**
  - `200 OK`: `{"detail": "User deleted by admin"}` - User account deleted successfully.
  - `400 Bad Request`: User not found or other issues.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Admin privileges required.

#### `GET /user/me`

Retrieves the authenticated user's profile information.

- **Authentication:** Required (JWT Bearer Token)
- **Responses:**
  - `200 OK`: `UserResponseDto` - User profile data.
  - `404 Not Found`: User not found.

#### `GET /user/all`

Retrieves a list of all users (Admin only).

- **Authentication:** Required (Admin JWT Bearer Token)
- **Responses:**
  - `200 OK`: `list[UserResponseAdminDto]` - List of all user profiles.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Admin privileges required.

#### `PUT /user/admin/edit`

Allows an admin to edit a user's information, including their profile pictures.

- **Authentication:** Required (Admin JWT Bearer Token)
- **Path Parameters:**
  - `user_id`: UUID of the user to edit.
- **Request Body:**
  ```json
  {
    "role": "admin" | "user" (optional),
    "account_confirmed": true | false (optional)
  }
  ```
- **Optional File:** `file` (UploadFile) - New profile picture for the user. If provided, it will be uploaded and set as the active profile picture.
- **Responses:**
  - `200 OK`: `UserResponseAdminDto` - User updated successfully.
  - `404 Not Found`: User not found.
  - `400 Bad Request`: Invalid input.

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
