import { EventEmitter } from "events";

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

export type Alert = {
  id: string | number;
  alert: string;
  analyst: string;
  status: string;
  severity: string;
  _serial: string;
};

// Create a global event emitter (persists between requests)
export const alertEmitter = new EventEmitter();
