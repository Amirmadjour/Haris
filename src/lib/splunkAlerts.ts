import { EventEmitter } from 'events';

// Define the alert type
export type SplunkAlert = {
  _serial: any;
  sid: any;
  search_name: any;
  result: any;
  _time: string;
  message: string;
  // Add other fields as needed
};

// Create a global event emitter (persists between requests)
export const alertEmitter = new EventEmitter();