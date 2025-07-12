# 🤖 RAG Chatbot Builder - Frontend

🎥 **Démo : un chatbot en moins de 5 minutes**  
[![Voir la démo](https://img.icons8.com/fluency/96/video-playlist.png)](https://screenrec.com/share/hz1v6klJVi)

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
https://github.com/RINOHeinrich1/embedder-api (service d'embedding)
https://github.com/RINOHeinrich1/chatbot-service (service du chatbot)
https://github.com/RINOHeinrich1/backend-finetune (service de finetuning et gestion des documents)

### Architecture du projet:
- Microservice
- Un peu de Jamstack
- MVP
### 1. Cloner le projet

```bash
git clone https://github.com/RINOHeinrich1/madaChatFrontend.git
cd madaChatFrontend
