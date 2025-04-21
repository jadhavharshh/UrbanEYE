export const HOST = import.meta.env.VITE_BACKEND_URL;
export const AUTH_API = "api/auth";

export const SEND_SIGNUP_DATA = `${AUTH_API}/send-signup-data`;

export const DATA_API = "api/data";
export const FETCH_USER_INFO = `${DATA_API}/fetch-user-info`;

export const COMPLAINT_API = "api/complaint";
export const CREATE_COMPLAINT = `${COMPLAINT_API}/create-complaint`;
export const GET_COMPLAINTS = `${COMPLAINT_API}/get-complaints`;

// Add these to your existing constants
export const LIKE_COMPLAINT = '/api/complaint/:id/like';
export const COMMENT_ON_COMPLAINT = '/api/complaint/:id/comment';

export const FETCH_CHAT = "/api/contacts/fetch-chat";
export const FETCH_CONTACTS = "/api/contacts/admin-contacts";