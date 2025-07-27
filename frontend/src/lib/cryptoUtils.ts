
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  const publicKeyPem = await crypto.subtle.exportKey(
    "spki", // SubjectPublicKeyInfo format for PEM
    keyPair.publicKey
  );
  const publicKeyPemString = btoa(String.fromCharCode(...new Uint8Array(publicKeyPem)));

  const privateKeyPem = await crypto.subtle.exportKey(
    "pkcs8", // PKCS#8 format for PEM
    keyPair.privateKey
  );
  const privateKeyPemString = btoa(String.fromCharCode(...new Uint8Array(privateKeyPem)));

  return { publicKey: publicKeyPemString, privateKey: privateKeyPemString };
}

export async function encryptMessage(publicKeyPemString: string, messageText: string): Promise<string> {
  const publicKeyPem = new Uint8Array(atob(publicKeyPemString).split("").map(char => char.charCodeAt(0)));
  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyPem,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt"]
  );

  const encodedMessage = new TextEncoder().encode(messageText);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encodedMessage
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export async function decryptMessage(privateKeyPemString: string, encryptedMessageBase64: string): Promise<string> {
  const privateKeyPem = new Uint8Array(atob(privateKeyPemString).split("").map(char => char.charCodeAt(0)));
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyPem,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true, // extractable
    ["decrypt"]
  );

  const encryptedBuffer = new Uint8Array(atob(encryptedMessageBase64).split("").map(char => char.charCodeAt(0)));
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedBuffer
  );

  return new TextDecoder().decode(decrypted);
}

export async function encryptPrivateKey(privateKeyPem: string, password: string): Promise<{ encrypted_private_key: string; salt: string; iv: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
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
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(privateKeyPem)
  );
  return {
    encrypted_private_key: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export async function decryptPrivateKey(encryptedObj: { encrypted_private_key: string; salt: string; iv: string }, password: string): Promise<string> {
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
