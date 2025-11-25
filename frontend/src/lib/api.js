import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const emailAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/emails`),
  getById: (id) => axios.get(`${API_BASE_URL}/emails/${id}`),
  ingest: () => axios.post(`${API_BASE_URL}/emails/ingest`),
  reanalyze: () => axios.post(`${API_BASE_URL}/emails/reanalyze`),
  generateDraft: (id) =>
    axios.post(`${API_BASE_URL}/emails/${id}/generate-draft`),
  regenerateDraft: (id) =>
    axios.post(`${API_BASE_URL}/emails/${id}/regenerate-draft`),
  chat: (id, data) => axios.post(`${API_BASE_URL}/emails/${id}/chat`, data),
};

export const promptAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/prompts`),
  update: (data) => axios.post(`${API_BASE_URL}/prompts/update`, data),
};
