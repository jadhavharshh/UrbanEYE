import { apiClient } from './api-client';

export const likeComplaint = async (complaintId: string) => {
  return apiClient.post(`/api/complaint/${complaintId}/like`);
};

export const unlikeComplaint = async (complaintId: string) => {
  return apiClient.delete(`/api/complaint/${complaintId}/like`);
};

export const addComment = async (complaintId: string, text: string) => {
  return apiClient.post(`/api/complaint/${complaintId}/comment`, { text });
};

export const deleteComment = async (complaintId: string, commentId: string) => {
  return apiClient.delete(`/api/complaint/${complaintId}/comment/${commentId}`);
};



