# E2E Messaging: Frontend Integration Guide (Clarified)

This guide provides everything the frontend team needs to implement secure end-to-end encrypted messaging, including required endpoints, expected request/response fields, and workflow. If you follow this, you will be able to search users, start conversations, exchange encrypted messages, and use real-time messaging.

---

## 1. Key Management

- **Frontend must generate an RSA key pair (public/private) for each user.**
    - Use Web Crypto API or a secure library.
    - Store the private key securely on the client (never send to backend).
- **Send public key to backend:**
    - Endpoint: `PUT /user/public-key`
    - Payload:
        ```json
        {
          "public_key": "PEM-encoded-public-key-string"
        }
        ```

---

## 2. User Search & Profile

- **Search for users:**
    - Endpoint: `GET /user/search?username={username}`
    - Response: User profile data (including `user_id`).
- **Get user public key:**
    - Endpoint: `GET /user/public-key/{user_id}`
    - Response:
        ```json
        {
          "public_key": "PEM-encoded-public-key-string"
        }
        ```

---

## 3. Conversations

- **Start or get a conversation:**
    - Endpoint: `POST /conversations/`
    - Payload:
        ```json
        {
          "participant_ids": ["user_id_1", "user_id_2"]
        }
        ```
    - Response: Conversation object (including `conversation_id`).
- **List my conversations:**
    - Endpoint: `GET /conversations/my`
    - Response: List of conversations.

---

## 4. Sending Encrypted Messages

- **Encrypt message using recipient's public key (RSA-OAEP, Base64-encoded).**
- **Send message:**
    - Endpoint: `POST /messages/send`
    - Payload:
        ```json
        {
          "sender_id": "uuid-of-sender",
          "receiver_id": "uuid-of-recipient",
          "conversation_id": "uuid-of-conversation",
          "content": "Base64-encoded-encrypted-message",
          "is_encrypted": true
        }
        ```
    - Response: Message object.

---

## 5. Receiving & Decrypting Messages

- **Fetch messages for a conversation:**
    - Endpoint: `GET /messages/conversation/{conversation_id}`
    - Response: List of messages, each with:
        - `content` (Base64-encoded ciphertext)
        - `is_encrypted` (boolean)
        - `sender_id`, `timestamp`, etc.
- **Frontend decrypts messages using locally stored private key.**

---

## 6. Real-Time Messaging (WebSocket)

- **Connect to WebSocket:**
    - Endpoint: `ws://your-backend-url/ws`
    - Auth: Pass JWT token (query param or header)
- **Send message over WebSocket:**
    - Payload:
        ```json
        {
          "type": "chat_message",
          "sender_id": "uuid-of-sender",
          "receiver_id": "uuid-of-recipient",
          "conversation_id": "uuid-of-conversation",
          "content": "Base64-encoded-encrypted-message",
          "is_encrypted": true,
          "timestamp": "ISO-8601-timestamp"
        }
        ```
- **Receive message:**
    - Same format as above. Decrypt if `is_encrypted` is true.

---

## 7. Security Requirements

- **Private key must be stored securely (IndexedDB, encrypted local storage, etc). Never expose private key to backend or other users.**
- **Public key can be updated if user rotates keys:**
    - Endpoint: `PUT /user/public-key`
- **Error handling:**
    - Handle encryption/decryption failures gracefully.
- **Message size:**
    - RSA is for small messages. For large messages, use hybrid encryption (not required for MVP).

---

## 8. Example Workflow

1. User registers/logs in → Frontend generates key pair.
2. Frontend sends public key to backend.
3. User searches for another user → gets their `user_id` and public key.
4. User starts a conversation.
5. User encrypts message with recipient's public key, sends via REST or WebSocket.
6. Recipient receives message, decrypts with their private key.

---


# Full Technical Details (Clarified)

This section provides in-depth technical guidance for frontend developers implementing E2E messaging. It clarifies responsibilities, endpoint usage, payloads, and security requirements.

## Key Management

- The frontend is responsible for generating the RSA key pair (public/private) for each user. The backend does NOT generate keys.
- The private key must be stored securely on the client (IndexedDB, encrypted local storage, etc.) and must never leave the device.
- The public key must be uploaded to the backend using:
    - Endpoint: `PUT /user/public-key`
    - Payload:
        ```json
        {
          "public_key": "PEM-encoded-public-key-string"
        }
        ```
- Users can update their public key if they rotate keys.

## User Search & Public Key Retrieval

- Search for users:
    - Endpoint: `GET /user/search?username={username}`
    - Response: User profile data (including `user_id`).
- Retrieve a user's public key:
    - Endpoint: `GET /user/public-key/{user_id}`
    - Response:
        ```json
        {
          "public_key": "PEM-encoded-public-key-string"
        }
        ```

## Conversations

- Start or get a conversation:
    - Endpoint: `POST /conversations/`
    - Payload:
        ```json
        {
          "participant_ids": ["user_id_1", "user_id_2"]
        }
        ```
    - Response: Conversation object (including `conversation_id`).
- List my conversations:
    - Endpoint: `GET /conversations/my`
    - Response: List of conversations.

## Sending Encrypted Messages

- Encrypt the message using the recipient's public key (RSA-OAEP, Base64-encoded).
- Send the encrypted message:
    - Endpoint: `POST /messages/send`
    - Payload:
        ```json
        {
          "sender_id": "uuid-of-sender",
          "receiver_id": "uuid-of-recipient",
          "conversation_id": "uuid-of-conversation",
          "content": "Base64-encoded-encrypted-message",
          "is_encrypted": true
        }
        ```
    - Response: Message object.

## Receiving & Decrypting Messages

- Fetch messages for a conversation:
    - Endpoint: `GET /messages/conversation/{conversation_id}`
    - Response: List of messages, each with:
        - `content` (Base64-encoded ciphertext)
        - `is_encrypted` (boolean)
        - `sender_id`, `timestamp`, etc.
- Decrypt messages using the locally stored private key.

## Real-Time Messaging (WebSocket)

- Connect to WebSocket:
    - Endpoint: `ws://your-backend-url/ws`
    - Auth: Pass JWT token (query param or header)
- Send/receive messages as JSON payloads:
    - Payload:
        ```json
        {
          "type": "chat_message",
          "sender_id": "uuid-of-sender",
          "receiver_id": "uuid-of-recipient",
          "conversation_id": "uuid-of-conversation",
          "content": "Base64-encoded-encrypted-message",
          "is_encrypted": true,
          "timestamp": "ISO-8601-timestamp"
        }
        ```
- Decrypt received messages if `is_encrypted` is true.

## Security Requirements

- The private key must never leave the client and must be stored securely.
- The backend only stores and relays encrypted content; it never decrypts messages.
- Handle encryption/decryption errors gracefully.
- RSA is suitable for small messages only. For large messages, use hybrid encryption (not required for MVP).

## Example JavaScript (Key Generation, Encryption, Decryption)

```javascript
// Key Generation
async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
    // Export keys as PEM strings for storage/upload
    // ...
}

// Encrypt Message
async function encryptMessage(publicKeyPemString, messageText) {
    // ...
}

// Decrypt Message
async function decryptMessage(privateKeyPemString, encryptedMessageBase64) {
    // ...
}
```


# 9. What Happens If You Lose Your Private Key?

**If you lose access to your private key (e.g., forget your backup password or lose your backup), you will NOT be able to decrypt your old messages.** They will appear as unreadable ciphertext ("ancient magic"). This is a fundamental property of end-to-end encryption: only the holder of the private key can decrypt messages.

**How to handle this scenario:**
- The app should inform users that old messages are permanently inaccessible if the private key is lost.
- Provide clear UI/UX warnings during backup and recovery steps.
- Encourage users to create a strong, memorable backup password and store it securely.
- Offer a way to reset and generate a new key pair, but clarify that this only allows future messaging—past messages remain unreadable.
- Optionally, allow users to delete old encrypted messages if desired.


# 10. Day-to-Day Scenarios: Message & Conversation Management

## Deleting Conversations or Messages

### 1. Delete Conversation Only for Yourself
- User A can delete a conversation from their own device/app. This only removes the conversation and its messages locally for User A; User B and C still retain their copies.
- **Implementation:**
    - Frontend removes the conversation/messages from local storage/UI.
    - Optionally, send a request to backend to mark as "deleted for user" (soft delete), so backend can hide it from User A's future fetches.
    - Endpoint example: `DELETE /conversations/{conversation_id}` (affects only requesting user).

### 2. Delete Message for Both Sides ("Unsend")
- User A can request to delete a message for all participants (e.g., regrets sending it).
- **Implementation:**
    - Frontend sends a delete request for the message.
    - Backend marks the message as deleted for all users (or removes ciphertext).
    - Optionally, replace message content with a "Message deleted" notice for all users.
    - Endpoint example: `DELETE /messages/{message_id}?for_all=true`

### 3. Delete Message Only for Yourself
- User A can delete a message only from their own view (e.g., hiding embarrassing messages).
- **Implementation:**
    - Frontend removes the message locally.
    - Optionally, backend marks as deleted for User A only.
    - Endpoint example: `DELETE /messages/{message_id}` (affects only requesting user).


## Real-Time & REST Events: Sent, Read/Unread, Typing

- **Sent:**
    - When a message is sent, update UI immediately and send via REST or WebSocket.
    - Sent status can be tracked in real time (WebSocket) or via REST API (for offline scenarios).
- **Read/Unread:**
    - When a user opens a conversation or views a message, send a "read receipt" event to backend via REST or WebSocket.
    - Endpoint example: `POST /messages/{message_id}/read`
    - Read/unread status can be updated in real time (WebSocket) or via REST (when user comes online and fetches messages).
    - Update UI to show which messages have been read by whom, including unread messages for offline users.
- **Typing:**
    - Typing indicators are only sent and received via WebSocket (real-time only).
    - Payload example:
        ```json
        {
          "type": "typing",
          "conversation_id": "...",
          "user_id": "..."
        }
        ```
    - Update UI to show "User is typing..." in real time. Typing status is not available via REST.

## UX Recommendations
- Always confirm destructive actions (deletion, unsend) with the user.
- Clearly indicate which actions affect only the local user vs. all participants.
- Show status indicators for sent, delivered, read, and typing events.