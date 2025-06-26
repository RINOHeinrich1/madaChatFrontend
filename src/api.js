import axios from "axios";

// --- Service 1: Chat (RAG) ---
const chatApi = axios.create({
  baseURL: import.meta.env.VITE_CHAT_API_URL, // service de génération de réponse
});

// --- Service 2: Fine-tuning ---
const tuneApi = axios.create({
  baseURL: import.meta.env.VITE_TUNE_API_URL, // service de fine-tune et recherche
});

// --- Fonctions pour le service de chat ---
export const askQuestion = async (question) => {
  const response = await chatApi.post("/ask", { question });
  return response.data;
};

// --- Fonctions pour le service de fine-tuning ---
export const searchDocs = async (question, top_k = 3) => {
  const response = await tuneApi.get("/search", {
    params: { q: question, top_k },
  });
  return response.data.results; // tableau [{ document: ..., score: ... }]
};

export const fineTuneModel = async (question, positive_docs, negative_docs) => {
  const response = await tuneApi.post("/finetune", {
    question,
    positive_docs,
    negative_docs,
  });
  return response.data;
};
