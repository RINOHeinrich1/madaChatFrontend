# 🤖 RAG Chatbot Builder - Frontend

Bienvenue dans le dépôt **frontend** du projet **RAG Chatbot Builder**, une plateforme open source permettant de créer facilement des chatbots IA alimentés par des documents personnalisés, grâce à l'architecture RAG.

---

## 🧩 Stack utilisée

- ⚛️ **ReactJS** — pour une interface utilisateur réactive et moderne.
- 🐘 **Supabase** — pour la gestion multitenant des utilisateurs, l'authentification (JWT), le stockage des fichiers, et la base de données.
- 🧠 **FastAPI** — backend pour l'IA RAG (recherche et génération).
- 🛡️ **JWT (JSON Web Token)** — pour une authentification sécurisée.

---

## 🚀 Fonctionnalités principales

- 🔐 Authentification multitenant via Supabase (email / mot de passe).
- 🧠 Création de chatbots basés sur des documents uploadés.
- 📁 Téléversement et gestion de fichiers (PDF, DOCX, TXT, etc.).
- 💬 Interface de chat avec génération IA (via FastAPI).
- 🏢 Gestion multi-utilisateurs (inscription/authentification) 
- 📊 Interface moderne en ReactJS.

---

## 📦 Installation locale

### Prérequis

- Node.js ≥ 18
- Supabase Project (configuré)
- Les backend FastAPI (en fonctionnement):
https://github.com/RINOHeinrich1/embedder-api
https://github.com/RINOHeinrich1/chatbot-service
https://github.com/RINOHeinrich1/backend-finetune

### Architecture du projet:
- Microservice
- Un peu de Jamstack
- MVP
### 1. Cloner le projet

```bash
git clone https://github.com/ton-org/rag-chatbot-frontend.git
cd rag-chatbot-frontend
