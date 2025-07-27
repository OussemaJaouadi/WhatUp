import { getApiBaseUrl } from '@/lib/env';
import { authUtils } from '@/lib/authUtils';
import { WebSocketMessagePayload } from '@/types/message';

let ws: WebSocket | null = null;
let onMessageCallback: ((message: WebSocketMessagePayload) => void) | null = null;

export const websocketService = {
  connect: (userId: string) => {
    if (ws) {
      console.warn('WebSocket already connected.');
      return;
    }

    const token = authUtils.getToken();
    if (!token) {
      console.error('No authentication token found for WebSocket connection.');
      return;
    }

    const wsBaseUrl = getApiBaseUrl().replace(/^http/, 'ws');
    // Respect backend spec: do NOT include userId in path
    const url = `${wsBaseUrl}/ws?token=${token}`;

    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected.');
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessagePayload = JSON.parse(event.data);
        if (onMessageCallback) {
          onMessageCallback(message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      ws = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  },

  sendMessage: (payload: WebSocketMessagePayload) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    } else {
      console.error('WebSocket is not connected or not open.');
    }
  },
  handleLogout: () => {
    websocketService.disconnect();
  },

  onMessage: (callback: (message: WebSocketMessagePayload) => void) => {
    onMessageCallback = callback;
  },

  disconnect: () => {
    if (ws) {
      ws.close();
      ws = null;
      onMessageCallback = null;
      console.log('WebSocket connection closed.');
    }
  },

  isConnected: () => {
    return ws !== null && ws.readyState === WebSocket.OPEN;
  },
};
