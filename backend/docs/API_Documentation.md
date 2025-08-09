# WhatUp API Documentation

## Overview
This document provides comprehensive documentation for the WhatUp application API endpoints, focusing on user management, authentication, profile functionality, messaging, and administrative features.

## Base URL
```
http://localhost:8000
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication Decorators
- `@requires_auth`: Requires valid JWT token
- `@requires_admin`: Requires admin role
- `@requires_no_auth`: No authentication required

## Data Models

### User Models

#### UserResponseDto
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "account_confirmed": "boolean",
  "active_avatar_url": "string|null",
  "public_key": "string|null",
  "bio": "string|null",
  "created_at": "datetime"
}
```

#### UserResponseAdminDto
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "account_confirmed": "boolean",
  "active_avatar_url": "string|null",
  "public_key": "string|null",
  "bio": "string|null",
  "created_at": "datetime",
  "role": "admin|user"
}
```

#### UserImageResponseDto
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "image_key": "string",
  "is_active": "boolean",
  "created_at": "datetime"
}
```

#### TokenData
```json
{
  "access_token": "string"
}
```

#### Message
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "receiver_id": "uuid|null",
  "group_id": "uuid|null",
  "conversation_id": "uuid|null",
  "content": "string",
  "is_encrypted": "boolean",
  "created_at": "datetime"
}
```

#### ConversationResponseDto
```json
{
  "id": "uuid",
  "user1_id": "uuid",
  "user2_id": "uuid",
  "created_at": "datetime"
}
```

## User Management Endpoints

### Authentication & Registration

#### POST /user/register
Register a new user account with optional profile image.

**Authentication:** None required
**Content-Type:** `multipart/form-data` (REQUIRED - do not use application/json)

**Request Body (Form Data):**
```
username: string (required)
email: string (required, valid email format)
password: string (required)
file: File (optional, image file - PNG, JPEG, etc.)
```

**Important Notes for Frontend:**
- MUST use `multipart/form-data` content type
- Do NOT send as JSON - this will result in 422 error
- File parameter is optional but if provided, must be a valid image file
- All text fields should be sent as form fields, not JSON

**Response:** `UserResponseDto`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request - username/email already exists, invalid file, image security error)
- 422 (Validation Error - typically caused by using JSON instead of form data)
- 500 (Internal Server Error)

**Example using curl:**
```bash
# Without image
curl -X POST "http://localhost:8000/user/register" \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=securepassword123"

# With image
curl -X POST "http://localhost:8000/user/register" \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=securepassword123" \
  -F "file=@profile.jpg"
```

**Example using JavaScript fetch:**
```javascript
// Registration without image
const formData = new FormData();
formData.append('username', 'johndoe');
formData.append('email', 'john@example.com');
formData.append('password', 'securepassword123');

const response = await fetch('/user/register', {
  method: 'POST',
  body: formData  // Do NOT set Content-Type header, let browser set it
});

// Registration with image
const formData = new FormData();
formData.append('username', 'johndoe');
formData.append('email', 'john@example.com');
formData.append('password', 'securepassword123');
formData.append('file', imageFile); // imageFile is a File object from input[type="file"]

const response = await fetch('/user/register', {
  method: 'POST',
  body: formData
});
```

#### POST /user/login
Authenticate a user and return a JWT token.

**Authentication:** None required
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "string", // Can be username or email
  "password": "string"
}
```

**Response:** `TokenData`
**Status Codes:** 
- 200 (Success)
- 401 (Unauthorized - invalid credentials)

**Example:**
```bash
curl -X POST "http://localhost:8000/user/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "password": "securepassword123"}'
```

### User Profile Management

#### GET /user/me
Get the current authenticated user's profile information.

**Authentication:** Required
**Response:** `UserResponseDto`
**Status Codes:** 
- 200 (Success)
- 404 (Not Found)

**Example:**
```bash
curl -X GET "http://localhost:8000/user/me" \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### PUT /user/me/bio
Update the current user's bio.

**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body:**
```
bio: string (optional, can be empty to clear bio)
```

**Response:** `UserResponseDto`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

#### DELETE /user/delete
Delete the current authenticated user's account.

**Authentication:** Required
**Response:** `{"detail": "User deleted"}`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

### User Search & Discovery

#### GET /user/search
Search for a user by username.

**Authentication:** Required
**Query Parameters:**
- `username`: string (required)

**Response:** `UserResponseDto`
**Status Codes:** 
- 200 (Success)
- 404 (Not Found)

**Example:**
```bash
curl -X GET "http://localhost:8000/user/search?username=johndoe" \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### GET /user/{user_id}
Get user information by user ID.

**Authentication:** Required
**Path Parameters:**
- `user_id`: UUID (required)

**Response:** `UserResponseDto`
**Status Codes:** 
- 200 (Success)
- 404 (Not Found)

### Profile Image Management

#### POST /user/profile-images
Upload a new profile image (max 5 images per user).

**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: UploadFile (required, image file)
```

**Response:** `UserImageResponseDto`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request - invalid image, limit reached)

**Notes:**
- Maximum 5 profile images per user
- First image is automatically set as active
- If 5 images exist, oldest inactive image is replaced

#### GET /user/profile-images
Get all profile images for the current user.

**Authentication:** Required
**Response:** `list[UserImageResponseDto]`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

#### GET /user/profile-images/{image_id}/data
Get the actual image data for a specific profile image.

**Authentication:** Required
**Path Parameters:**
- `image_id`: UUID (required)

**Response:** Image data (JPEG format)
**Content-Type:** `image/jpeg`
**Status Codes:** 
- 200 (Success)
- 404 (Not Found)

#### PUT /user/profile-images/{image_id}/set-active
Set a specific profile image as active.

**Authentication:** Required
**Path Parameters:**
- `image_id`: UUID (required)

**Response:** `UserImageResponseDto`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

#### DELETE /user/profile-images/{image_id}
Delete a specific profile image.

**Authentication:** Required
**Path Parameters:**
- `image_id`: UUID (required)

**Response:** `{"detail": "Image deleted successfully."}`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

**Notes:**
- Cannot delete the last active profile picture
- If deleted image was active, another image is automatically set as active

### Encryption & Security

#### PUT /user/public-key
Update the user's public key for end-to-end encryption.

**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "public_key": "string"
}
```

**Response:** `{"detail": "Public key updated successfully."}`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

#### GET /user/public-key/{user_id}
Get a user's public key for encryption purposes.

**Authentication:** Required
**Path Parameters:**
- `user_id`: string (required)

**Response:** 
```json
{
  "public_key": "string|null",
  "message": "string (optional - when key is not set up)"
}
```
**Status Codes:** 
- 200 (Success - returns key or null if not set up)
- 404 (User not found)
- 400 (Bad Request)

#### PUT /user/private-key-backup
Store encrypted private key backup.

**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "encrypted_private_key": "string",
  "salt": "string",
  "iv": "string",
  "password": "string"
}
```

**Response:** `{"detail": "Encrypted private key backup stored successfully."}`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

**Note:** The `password_hash` field should contain the hash of the password used to encrypt the private key. This hash will be stored for verification during recovery.

#### POST /user/private-key-backup
Retrieve encrypted private key backup after password verification.

**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "password": "string"
}
```

**Response:**
```json
{
  "encrypted_private_key": "string",
  "salt": "string",
  "iv": "string"
}
```
**OR if no backup exists:**
```json
{
  "message": "No private key backup found. Please create a backup first.",
  "backup_exists": false
}
```
**Status Codes:** 
- 200 (Success - backup found or informative message if no backup)
- 401 (Unauthorized - Invalid password)
- 404 (User not found)
- 400 (Bad Request)

**Note:** The password provided must match the original password used for encryption. The server verifies the password hash but never decrypts the private key - decryption is handled client-side for security.

#### GET /user/crypto-setup-status
Check the cryptographic setup status for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "has_public_key": "boolean",
  "has_private_key_backup": "boolean", 
  "setup_complete": "boolean",
  "next_steps": ["array of helpful setup instructions"]
}
```
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

**Note:** This endpoint helps frontends determine what cryptographic setup steps are still needed without requiring passwords.

### Password Management

#### POST /user/request-password-reset
Request a password reset email.

**Authentication:** None required
**Content-Type:** `multipart/form-data` (REQUIRED - do not use application/json)

**Request Body (Form Data):**
```
email: string (required, valid email format)
```

**Response:** `{"detail": "Password reset email sent if user exists."}`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)
- 422 (Validation Error - typically caused by using JSON instead of form data)

**Notes:**
- For security, always returns success message regardless of email existence
- MUST use form data, not JSON

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/user/request-password-reset" \
  -F "email=user@example.com"
```

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('email', 'user@example.com');

const response = await fetch('/user/request-password-reset', {
  method: 'POST',
  body: formData
});
```

#### POST /user/reset-password
Reset password using a reset token.

**Authentication:** None required
**Content-Type:** `multipart/form-data` (REQUIRED - do not use application/json)

**Request Body (Form Data):**
```
token: string (required)
new_password: string (required)
confirm_password: string (required)
```

**Response:** `{"detail": "Password has been reset successfully."}`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request - invalid token, passwords don't match)
- 422 (Validation Error - typically caused by using JSON instead of form data)

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/user/reset-password" \
  -F "token=reset_token_here" \
  -F "new_password=newpassword123" \
  -F "confirm_password=newpassword123"
```

**Example using JavaScript:**
```javascript
const formData = new FormData();
formData.append('token', resetToken);
formData.append('new_password', 'newpassword123');
formData.append('confirm_password', 'newpassword123');

const response = await fetch('/user/reset-password', {
  method: 'POST',
  body: formData
});
```

### Account Confirmation

#### GET /user/confirm-account
Confirm user account using confirmation token.

**Authentication:** None required
**Query Parameters:**
- `token`: string (required)

**Response:** `{"detail": "Account confirmed successfully."}`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)

**Example:**
```bash
curl -X GET "http://localhost:8000/user/confirm-account?token=<confirmation_token>"
```

## Administrative Endpoints

### User Management (Admin Only)

#### GET /user/all
Get all users in the system.

**Authentication:** Admin required
**Response:** `list[UserResponseAdminListDto]`
**Status Codes:** 
- 200 (Success)
- 401 (Unauthorized)
- 403 (Forbidden)

#### GET /user/{user_id} (Admin)
Get detailed user information by ID (admin view).

**Authentication:** Admin required
**Path Parameters:**
- `user_id`: string (required)

**Response:** `UserResponseAdminDto`
**Status Codes:** 
- 200 (Success)
- 404 (Not Found)
- 401 (Unauthorized)
- 403 (Forbidden)

#### PUT /user/admin/edit
Edit user information as admin.

**Authentication:** Admin required
**Content-Type:** `multipart/form-data`

**Request Body:**
```
user_id: string (required)
role: string (optional, "admin" or "user")
account_confirmed: boolean (optional)
bio: string (optional)
file: UploadFile (optional, profile image)
```

**Response:** `UserResponseAdminDto`
**Status Codes:** 
- 200 (Success)
- 404 (Not Found)
- 401 (Unauthorized)
- 403 (Forbidden)

#### DELETE /user/admin/delete/{user_id}
Delete a user account as admin.

**Authentication:** Admin required
**Path Parameters:**
- `user_id`: string (required)

**Response:** `{"detail": "User deleted by admin"}`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)
- 401 (Unauthorized)
- 403 (Forbidden)

### Admin Profile Image Management

#### GET /user/admin/users/{user_id}/profile-images
Get all profile images for a specific user (admin only).

**Authentication:** Admin required
**Path Parameters:**
- `user_id`: UUID (required)

**Response:** `list[UserImageResponseDto]`
**Status Codes:** 
- 200 (Success)
- 404 (Not Found)
- 401 (Unauthorized)
- 403 (Forbidden)

#### GET /user/admin/users/{user_id}/profile-images/{image_id}/data
Get image data for a specific user's profile image (admin only).

**Authentication:** Admin required
**Path Parameters:**
- `user_id`: UUID (required)
- `image_id`: UUID (required)

**Response:** Image data (JPEG format)
**Content-Type:** `image/jpeg`
**Status Codes:** 
- 200 (Success)
- 404 (Not Found)
- 401 (Unauthorized)
- 403 (Forbidden)

## Messaging Endpoints

### Conversations

#### POST /conversations/
Create a new private conversation or retrieve existing one.

**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "user1_id": "uuid",
  "user2_id": "uuid"
}
```

**Response:** `ConversationResponseDto`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)
- 403 (Forbidden - user not participant)

#### GET /conversations/my
Get all conversations for the current user.

**Authentication:** Required
**Response:** `list[ConversationResponseDto]`
**Status Codes:** 
- 200 (Success)

### Messages

#### POST /messages/send
Send a new message (private or group).

**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "sender_id": "uuid",
  "receiver_id": "uuid|null",  // For private messages
  "group_id": "uuid|null",     // For group messages
  "content": "string",
  "is_encrypted": "boolean"
}
```

**Note:** Either `receiver_id` or `group_id` must be provided, but not both.

**Response:** `Message`
**Status Codes:** 
- 200 (Success)
- 400 (Bad Request)
- 403 (Forbidden - sender mismatch)

#### GET /messages/conversation/{conversation_id}
Get messages for a specific conversation.

**Authentication:** Required
**Path Parameters:**
- `conversation_id`: UUID (required)

**Response:** `list[Message]`
**Status Codes:** 
- 200 (Success)
- 403 (Forbidden - not conversation participant)

#### GET /messages/group/{group_id}
Get messages for a specific group.

**Authentication:** Required
**Path Parameters:**
- `group_id`: UUID (required)

**Response:** `list[Message]`
**Status Codes:** 
- 200 (Success)
- 403 (Forbidden - not group member)

## WebSocket Endpoints

### GET /ws
Establish WebSocket connection for real-time messaging.

**Authentication:** Required (JWT token as query parameter)
**Query Parameters:**
- `token`: string (required - JWT Bearer token)

**Connection URL:**
```
ws://localhost:8000/ws?token=<your_jwt_token>
```

**Message Format (Client to Server):**
```json
{
  "sender_id": "uuid",
  "receiver_id": "uuid|null",
  "group_id": "uuid|null",
  "content": "string",
  "is_encrypted": "boolean"
}
```

**Message Format (Server to Client):**
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "receiver_id": "uuid|null",
  "group_id": "uuid|null",
  "conversation_id": "uuid|null",
  "content": "string",
  "is_encrypted": "boolean",
  "created_at": "datetime"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["field_name"],
      "msg": "Error message",
      "type": "error_type"
    }
  ]
}
```

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt
- Minimum password requirements should be enforced on frontend
- Password reset tokens are time-limited and single-use

### Image Security
- Images are processed and validated before storage
- Only JPEG format is supported for output
- Images are stored in AWS S3 with secure access patterns
- Maximum file size limits should be enforced

### JWT Tokens
- Tokens have configurable expiration periods
- Account confirmation and password reset use separate token types
- Tokens are signed with HS256 algorithm
- Different secrets for different token types

### End-to-End Encryption
- Users can store public keys for message encryption
- Private key backups are encrypted client-side before storage
- Backup includes salt and IV for proper decryption
- Password used for encryption is hashed and stored for verification during recovery
- Server never has access to unencrypted private keys or encryption passwords
- Password verification ensures only authorized users can retrieve their backups
- Decryption is performed entirely on the client side for maximum security

### Input Validation
- All user inputs are validated using Pydantic models
- File uploads are scanned for security threats
- SQL injection protection through ORM usage

## Rate Limiting
Currently, no rate limiting is implemented, but it may be added in future versions for:
- Login attempts
- Password reset requests
- Image uploads
- Message sending

## CORS
Cross-Origin Resource Sharing (CORS) is enabled for development. In production, specific origins should be configured.

## Environment Configuration

Key configuration variables:
- `JWT_EXPIRATION_PERIOD`: Token expiration time (e.g., "24h", "30m")
- `JWT_SECRET_KEY`: Secret key for JWT signing
- `JWT_ACCOUNT_CONFIRMATION`: Secret key for confirmation tokens
- `DEBUG`: Enable/disable debug mode
- AWS S3 configuration for image storage
- Email service configuration for notifications

## Additional Documentation

For detailed implementation guides, see:
- [Frontend E2E Messaging Guide](Frontend_E2E_Messaging_Guide.md)
- [Secure Private Key Backup and Recovery](Secure_Private_Key_Backup_and_Recovery.md)

## Testing

Use tools like:
- `curl` for command-line testing
- Postman for interactive API testing
- WebSocket test clients for real-time functionality

## Support

For technical support or questions about the API, please contact the development team or refer to the source code documentation.
