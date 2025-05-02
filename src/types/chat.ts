export interface ChatMessage {
  id: number;
  room_id: number;
  sender: string;
  message: string;
  created_at: string;
  mentions: string[];
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
}

export interface ChatRoom {
  id: number;
  alert_serial: string;
  created_at: string;
}