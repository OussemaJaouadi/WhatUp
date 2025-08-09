# WhatUp Messaging Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/kag3ryu/whatup)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com/)
[![Frontend: React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)

**WhatUp** is a full-stack, secure messaging application designed with a primary focus on privacy and end-to-end encryption (E2EE). It provides a modern, real-time chat experience while ensuring that user communications remain confidential and secure from eavesdropping.

This repository contains the complete source code for the backend API, the frontend web client, and the necessary infrastructure configuration.

## ✨ Features

- **End-to-End Encryption (E2EE):** Messages are encrypted on the client-side before being sent and can only be decrypted by the intended recipient. The server only handles encrypted data blobs.
- **Real-time Messaging:** Instant message delivery and status updates powered by WebSockets.
- **User Authentication:** Secure user registration, login, and session management using JWT.
- **Secure Key Management:** Asymmetric (RSA) and symmetric (AES) cryptography for key exchange and message encryption.
- **Modern & Responsive UI:** A clean and intuitive user interface built with React, TypeScript, and Shadcn/UI.
- **Object Storage for Media:** Securely stores user-generated content like images using a MinIO S3-compatible object store.

## 🛠️ Tech Stack

| Area          | Technology                                                              |
|---------------|-------------------------------------------------------------------------|
| **Frontend**  | [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/) |
| **Backend**   | [Python](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://www.sqlalchemy.org/), [WebSockets](https://fastapi.tiangolo.com/advanced/websockets/) |
| **Database**  | [PostgreSQL](https://www.postgresql.org/) (recommended)                 |
| **Storage**   | [MinIO](https://min.io/) (S3-Compatible Object Storage)                 |
| **Infra**     | [Docker](https://www.docker.com/)                                       |

## 🏛️ System Architecture

The system is designed with a decoupled frontend and backend.

1.  **Frontend Client:** A React-based single-page application (SPA) that handles all user interactions. It's responsible for the entire cryptographic lifecycle: generating keys, encrypting messages before sending, and decrypting them upon receipt. It communicates with the backend via a RESTful API and a WebSocket connection.
2.  **Backend API:** A FastAPI server that manages user data, conversations, and message routing. It is designed to be "zero-knowledge," meaning it never has access to plaintext message content. It only stores and transmits encrypted data blobs between clients.
3.  **Database:** A PostgreSQL database stores user accounts, conversation metadata, and other relational data.
4.  **Object Storage:** A MinIO server handles the storage of non-relational data like user profile pictures.

This separation ensures that even if the server is compromised, user messages remain secure thanks to the end-to-end encryption model.

## 🚀 Getting Started

To get the application running locally, you'll need to set up the backend, frontend, and the MinIO storage service.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Python](https://www.python.org/downloads/) 3.10+ and `pip`
- [Node.js](https://nodejs.org/en/download/) and `npm` (or `bun`)

### 1. Configure Environment Variables

You will need to create `.env` files for both the backend and frontend.

- For the backend, create a `.env` file in the `backend/` directory.
- For the frontend, create a `.env.development` file in the `frontend/` directory.

*Note: You can inspect the source code (e.g., `backend/core/config.py` and `frontend/src/services/api.ts`) to see which environment variables are required.*

### 2. Run MinIO Storage

The project uses MinIO for S3-compatible object storage. A Docker Compose file is provided for convenience.

```bash
# From the project root directory
docker-compose -f docker-compose.dev.yaml up
```

This will start the MinIO service. You can access the MinIO web UI at `http://localhost:9001`.

### 3. Set Up and Run the Backend

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if applicable)
# You may need to configure your database connection in the .env file first
alembic upgrade head

# Start the FastAPI server
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`.

### 4. Set Up and Run the Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be accessible at `http://localhost:5173`.

## 🔐 Security Deep Dive

The security of this application is paramount and is built on the principles of end-to-end encryption.

-   **Key Generation:** When a user signs up, a new RSA key pair (public and private) is generated directly on their device. The private key is encrypted with a key derived from the user's password and stored locally in the browser's `IndexedDB`. The public key is sent to the server for other users to discover.
-   **Message Encryption:** When a user sends a message, a new symmetric AES key is generated for that message. The message is encrypted with this AES key. The AES key is then asymmetrically encrypted with the recipient's public key. Both the encrypted message and the encrypted key are sent to the server.
-   **Zero-Knowledge Server:** The backend has no access to private keys or unencrypted message content. It only stores and relays opaque ciphertexts.
-   **Multi-Device Challenges:** True multi-device support in an E2EE system is complex. Our current implementation focuses on a single-client model. Expanding this would require a secure key-syncing mechanism, such as a user-managed backup or a device-to-device transfer protocol.

For more details, please refer to the documentation in the `backend/docs` and `frontend/docs` directories.

## 📂 Project Structure

```
whatup/
├── backend/            # FastAPI backend application
│   ├── alembic/        # Database migrations
│   ├── core/           # Core settings and database config
│   ├── models/         # SQLAlchemy ORM models
│   ├── routers/        # API endpoint definitions
│   ├── services/       # Business logic
│   └── utils/          # Utility functions (crypto, etc.)
├── frontend/           # React/Vite frontend application
│   ├── public/         # Static assets
│   └── src/            # Frontend source code
│       ├── components/ # Reusable UI components
│       ├── context/    # React context providers
│       ├── pages/      # Application pages
│       └── services/   # API and WebSocket services
├── minio/              # MinIO configuration
└── docker-compose.dev.yaml # Docker compose for MinIO
```

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/licenses/MIT) file for details.

## 📜 Project Retrospective

This section documents the project's journey, the specific technical challenges encountered, and the critical architectural oversight that led to its discontinuation.

### Research and Influences

The initial goal was to understand the practical challenges of building a secure, E2EE messaging system. The research phase involved analyzing industry leaders like **Signal** and **WhatsApp**, exploring client-side storage like **IndexedDB**, and reviewing open-source projects to understand best practices in applied cryptography.

### Design Evolution and The Critical Flaw

The development process followed a logical, yet ultimately flawed, path:

1.  **Initial Key Generation:** The first step was implementing basic client-side RSA key-pair generation for user identity.

2.  **The Receiver's Multi-Device Problem:** We immediately confronted the question: "How does a user log in from another device and read their messages?" This led to designing a system for encrypting the user's private key with a password-derived key, allowing it to be backed up and restored on a new device.

3.  **The "Forgot Password" Scenario:** The next logical challenge was password recovery. If a user forgot their password, they couldn't decrypt their private key. Our solution was to allow them to regenerate a new key-pair, accepting that all previous messages sent *to them* would become permanently inaccessible. We planned to mark these messages as such in the UI.

4.  **The Critical Oversight:** All of this thinking was focused exclusively on the **receiver's** ability to access their message history. We completely neglected the synchronization problem for the **sender**. This was a terrible mistake that invalidated the entire multi-device architecture.

### Conclusion: Why This Project is Archived

**This project is archived due to a fundamental architectural flaw in its cryptographic design.**

The core reason for discontinuing the project is the failure to account for the sender's message synchronization. 

Here is the scenario our model failed to address: A user sends an encrypted message from their phone. Later, they log in on their laptop. The laptop has no access to the unique, one-time symmetric key that was used to encrypt the message on the phone. Therefore, the user's own sent message is unreadable on their second device. This fractures the conversation history and creates an unusable experience.

Fixing this would require a complete redesign of the cryptographic protocol to implement a message-forking and key-distribution system similar to the one used by Signal. This was a far more complex challenge than we had anticipated and was beyond the project's scope.

This project was a valuable, if humbling, lesson in the complexities of secure system design. It is being open-sourced as a practical example of the subtle but critical challenges involved in building E2EE applications.
