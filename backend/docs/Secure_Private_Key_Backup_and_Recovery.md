# Secure Private Key Backup & Recovery for E2E Messaging

This document explains how both frontend and backend teams should collaborate to enable users to securely use their private key across devices (mobile, PC, tablet) for end-to-end encrypted messaging.

---

## 1. Where to Store the Private Key

- **On Device:**
  - Store the private key in secure local storage:
    - **Web:** IndexedDB (recommended), optionally encrypted with a password-derived key.
    - **Mobile/Desktop:** Use OS-provided secure storage (Keychain for iOS/macOS, Keystore for Android, Secure Enclave, etc.).

- **For Cross-Device Access:**
  - The private key must be backed up in encrypted form to the backend, so it can be restored on other devices.

---

## 2. How to Encrypt and Upload the Private Key (Frontend)

1. **User chooses a strong password for backup.**
2. **Hash the password for verification (use bcrypt or similar).**
3. **Encrypt the private key using AES-GCM with a key derived from the password (PBKDF2 or Argon2).**
4. **Upload the encrypted private key to the backend:**
    - Endpoint: `PUT /user/private-key-backup`
    - Payload:
      ```json
      {
        "encrypted_private_key": "Base64-encoded-ciphertext",
        "salt": "Base64-encoded-salt",
        "iv": "Base64-encoded-iv",
        "password_hash": "bcrypt-hash-of-password"
      }
      ```
    - The backend stores this encrypted blob and password hash, never the raw private key or password.

---

## 3. How to Retrieve and Decrypt the Private Key (Frontend)

1. **User logs in on a new device.**
2. **Prompt the user for their backup password.**
3. **Send password verification request to backend:**
    - Endpoint: `POST /user/private-key-backup`
    - Payload:
      ```json
      {
        "password": "user-entered-password"
      }
      ```
4. **Backend verifies password hash and returns encrypted backup:**
    - Response (if password is correct):
      ```json
      {
        "encrypted_private_key": "Base64-encoded-ciphertext",
        "salt": "Base64-encoded-salt",
        "iv": "Base64-encoded-iv"
      }
      ```
5. **Derive the key from the password and salt, then decrypt the private key using AES-GCM and the IV.**
6. **Store the decrypted private key in secure local storage on the new device.**

---

## 4. Backend Responsibilities

- **Store only the encrypted private key backup, salt, IV, and password hash.**
- **Verify password hash during backup retrieval requests.**
- **Never store or log the raw private key or user password.**
- **Provide endpoints for uploading encrypted backups and retrieving them after password verification.**
- **Return appropriate error codes for invalid passwords (401 Unauthorized).**

---

## 5. Security Considerations

- The password for backup should be strong and is hashed before storage.
- The frontend must always encrypt the private key before uploading.
- Password verification adds an extra layer of security to prevent unauthorized access.
- If the user loses their password, they must generate a new key pair and update their public key.
- The backend never has access to the raw password or private key.
- Password verification prevents unauthorized backup retrieval even if a user account is compromised.
- Optionally, allow users to export/import their encrypted private key manually for advanced users.

---

## 6. Example JavaScript (Frontend)

```javascript
// Encrypt private key for backup
async function encryptPrivateKey(privateKeyPem, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key for encryption
    const keyMaterial = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
    );
    
    // Encrypt the private key
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(privateKeyPem)
    );
    
    // Hash the password for server verification (you'll need bcrypt.js library)
    const passwordHash = await bcrypt.hash(password, 12);
    
    return {
        encrypted_private_key: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        salt: btoa(String.fromCharCode(...salt)),
        iv: btoa(String.fromCharCode(...iv)),
        password_hash: passwordHash
    };
}

// Request private key backup with password verification
async function requestPrivateKeyBackup(password) {
    const response = await fetch('/user/private-key-backup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid password');
        }
        throw new Error('Failed to retrieve backup');
    }
    
    return await response.json();
}

// Decrypt private key after download
async function decryptPrivateKey(encryptedObj, password) {
    const salt = Uint8Array.from(atob(encryptedObj.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedObj.iv), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedObj.encrypted_private_key), c => c.charCodeAt(0));
    
    const keyMaterial = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );
    
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
    );
    return new TextDecoder().decode(decrypted);
}
```

---

## 7. User Flow Summary

1. User generates key pair on first device.
2. User backs up private key with password (encrypted, password hashed, uploaded to backend).
3. User logs in on new device, enters backup password for verification.
4. Backend verifies password hash and returns encrypted backup if valid.
5. User decrypts backup with password and can now use E2E messaging on any device.

---

## 8. Advanced: Manual Export/Import

- Allow users to export their encrypted private key backup and import it manually if needed (e.g., via QR code, file, etc.).

---

## 9. FAQ

- **Q: What if the user loses their password?**
  - They must generate a new key pair and update their public key. Old messages cannot be decrypted.
- **Q: Is the backend ever able to decrypt messages or see the private key?**
  - No. The backend only stores encrypted blobs and never sees the raw private key or password.

---

## 10. Collaboration Checklist

- [ ] Frontend implements encryption, backup, restore UI and logic.
- [ ] Backend provides endpoints for encrypted backup upload/download.
- [ ] Both teams test cross-device key recovery and E2E messaging.

---

