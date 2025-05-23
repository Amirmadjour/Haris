// Store connected clients with proper typing
const clients = new Map<string, (data: string) => void>();

export function broadcastMessage(alertSerial: string, message: object) {
  const messageString = `data: ${JSON.stringify({ type: "message", data: message })}\n\n`;
  clients.forEach((send, clientId) => {
    if (clientId.startsWith(alertSerial)) {
      send(messageString);
    }
  });
}

export function addClient(clientId: string, send: (data: string) => void) {
  clients.set(clientId, send);
}

export function removeClient(clientId: string) {
  clients.delete(clientId);
}