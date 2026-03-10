# ReadAssess
**Powered by Silicon Mango**

![Silicon Mango Logo](./images/Mauli_Logo-removebg-preview.png)

ReadAssess is a comprehensive English Reading Assessment Auto-Checker designed for students and educators. It provides daily reading assignments, records student audio, and uses AI (Faster-Whisper) to analyze pronunciation and accuracy. The application offers dedicated dashboards for both students and administrators.

---

## 🌟 Key Features

- **Daily Reading Assignments:** Students receive a new story to read every day.
- **Automated Pronunciation Scoring:** Records audio directly in the browser and automatically calculates reading accuracy using AI speech recognition.
- **Detailed Error Analysis:** Identifies specific mispronounced or skipped words.
- **Student Dashboard:** View today's assignment, record/upload audio, and get instant feedback.
- **Admin Dashboard:** Manage students, classes, and view comprehensive reports on student progress and commonly mispronounced words.
- **n8n Integration:** Seamlessly fetch and publish new stories automatically using n8n workflows.

---

## 🚀 Technology Stack

- **Frontend:** React, Vite, Tailwind CSS (Material Design 3 Minimalist Theme)
- **Backend:** FastAPI, Python 3.11, SQLAlchemy (Async)
- **Database:** PostgreSQL (with `asyncpg`)
- **AI/ML:** `faster-whisper` (CTranslate2 for high-speed, CPU-friendly speech recognition)
- **Deployment:** Docker & Docker Compose (with Nginx reverse proxy)

---

## 🛠️ Local Setup & Deployment

Prerequisites: **Docker** and **Docker Compose**.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hopeworks/hopeworks-english-assignment.git
   cd hopeworks-english-assignment
   ```

2. **Configure Environment Variables:**
   Ensure you have a `.env` file in the root directory:
   ```env
   ADMIN_EMAIL="admin@school.com"
   ADMIN_PASSWORD="securepassword"
   DATABASE_URL="postgresql+asyncpg://app:app@db:5432/reading"
   JWT_SECRET="your-super-secret-key"
   WHISPER_MODEL="small" # Options: tiny, base, small, medium, large-v3
   ```

3. **Build and Run with Docker Compose:**
   ```bash
   docker compose up --build -d
   ```
   *Note: The first run will download the Whisper AI model, which might take a minute or two depending on your connection.*

4. **Access the Application:**
   - **App:** `http://localhost:3000`
   - **API Docs:** `http://localhost:8000/docs`

---

## 🤖 Integrating with n8n

ReadAssess is designed to automatically receive daily reading assignments from an n8n workflow.

### The API Endpoint
The backend exposes a `POST` endpoint to create a new daily story:

- **URL:** `http://your-server-ip:3000/api/story` (or port 8000 directly to the backend)
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "title": "The Golden Retreiver's Great Adventure",
    "story_text": "Once upon a time, a brave golden retriever named Max decided to explore the mysterious forest behind his house. He sniffed every tree, chased a couple of squirrels, and finally found a hidden lake that sparkled in the afternoon sun."
  }
  ```

*Note: The system enforces **one story per day**. If you try to post a second story on the same day, the API will return a `409 Conflict` error.*

### Setting up the n8n Workflow

1. **Trigger Node:** Use a **Schedule Trigger** (e.g., set to run every day at 6:00 AM).
2. **Content Generation Node (Optional):** Use an **OpenAI** or **Anthropic** node to generate a short, engaging story suitable for the students' reading level.
   - *Prompt Example:* "Write a 150-word story about space exploration for 3rd graders."
3. **HTTP Request Node:**
   - **Method:** POST
   - **URL:** `http://your-server-ip/api/story`
   - **Body Parameters:** Send JSON containing the `title` and `story_text` from the previous node.
   - **Authentication:** Currently, the POST `/api/story` endpoint is open for automated systems, but you can configure ingress rules to restrict it to your n8n server's IP.

Once the n8n workflow runs, the new story will immediately appear on the Student Dashboard for that day's reading assignment!

---
*Developed with simplicity and performance in mind by Silicon Mango.*
