// src/lib/keyStorage.ts
// This file handles secure storage of cryptographic keys using IndexedDB.

const DB_NAME = 'WhatUpKeysDB';
const STORE_NAME = 'privateKeys';

interface PrivateKeyRecord {
  id: string; // User ID
  privateKey: string; // PEM-encoded private key
}

export const keyStorage = {
  /**
   * Opens the IndexedDB database and returns a promise that resolves with the DB instance.
   */
  _openDb: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  /**
   * Stores a private key associated with a user ID.
   * @param userId The ID of the user.
   * @param privateKey The PEM-encoded private key string.
   */
  savePrivateKey: async (userId: string, privateKey: string): Promise<void> => {
    const db = await keyStorage._openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record: PrivateKeyRecord = { id: userId, privateKey };
      const request = store.put(record);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error saving private key:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  },

  /**
   * Retrieves a private key for a given user ID.
   * @param userId The ID of the user.
   * @returns The PEM-encoded private key string, or null if not found.
   */
  getPrivateKey: async (userId: string): Promise<string | null> => {
    const db = await keyStorage._openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(userId);

      request.onsuccess = () => {
        const record = request.result as PrivateKeyRecord | undefined;
        resolve(record ? record.privateKey : null);
      };

      request.onerror = (event) => {
        console.error('Error getting private key:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  },

  /**
   * Deletes a private key for a given user ID.
   * @param userId The ID of the user.
   */
  deletePrivateKey: async (userId: string): Promise<void> => {
    const db = await keyStorage._openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(userId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error deleting private key:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  },
};
