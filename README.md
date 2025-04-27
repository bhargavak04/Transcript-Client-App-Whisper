# Whisper Transcribe App

A web application that lets users record audio, transcribe it using OpenAI's Whisper API, and save transcripts.

## Features

- User authentication with Clerk
- Record audio directly in the browser
- Transcribe audio using OpenAI Whisper
- Store and manage transcripts
- Clean, responsive UI with Tailwind CSS

## Project Structure

```
frontend/           # React frontend
backend/           # Python Flask backend
```

## Prerequisites

- [Node.js and npm](https://nodejs.org/)
- [Python 3.8+](https://www.python.org/downloads/)
- [Redis](https://redis.io/download) (required for Celery background tasks)

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/bhargavak04/Transcript-Client-App-Whisper
cd Transcript-Client
```

### 2. Backend Setup (Flask + Celery)

```bash
cd backend
# Create and activate a Python virtual environment
python -m venv envs
# On Windows:
envs\Scripts\activate
# On Mac/Linux:
source envs/bin/activate

# Install Python dependencies
pip install -r new_requirements.txt

# Make sure Redis is running locally (default: redis://localhost:6379/0)
# Download and install from: https://redis.io/download
# Start Redis server before running the backend

# Start the Flask backend
python app.py

# In a new terminal, activate the same virtual environment and start Celery worker:
celery -A celery_app.celery worker --loglevel=info --pool=solo
```

# Optional: For Linux/macOS (recommended for production)
# Run Celery with multiple worker processes for true concurrency:
```bash
celery -A celery_app.celery worker --loglevel=info --concurrency=4
```
- Replace `4` with the number of concurrent tasks (workers) you want to run, depending on your CPU cores and workload.
- This allows multiple users to have their audio transcribed in parallel.


### 3. Frontend Setup (React)

```bash
cd ../frontend
npm install
npm start
```

### 4. Clerk Authentication
- Set up a [Clerk](https://clerk.com/) account for authentication.
- Add your Clerk publishable key to the frontend as needed.

---

## Additional Notes
- Uploaded audio files are stored in the `uploads/` directory (gitignored).
- Transcripts are stored in `backend/transcripts.db` (gitignored).
- Make sure Redis is running before starting Celery.
- For production, use a Linux server for better Celery concurrency.
- Whisper model files should be present in the backend directory (see `whisper-small/`).

---

## Useful Links
- [Redis Download](https://redis.io/download)
- [Clerk Documentation](https://clerk.com/docs)


## Setup Instructions

### Backend Setup

 **Whisper Download**:
   - To download the Whisper model visit (https://huggingface.co/openai/whisper-small)
   - change the self.model_path to your local path in backend/transcription.py

1. Navigate to the server directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```


6. Run the Flask server:
   ```
   python app.py
   ```

7. **Start the Celery worker (in a new terminal):**
   - Make sure Redis is running before starting Celery.
   - Activate your virtual environment in the new terminal:
     - On Windows:
       ```
       envs\Scripts\activate
       ```
     - On Mac/Linux:
       ```
       source envs/bin/activate
       ```
   - Start the Celery worker (Windows requires `--pool=solo`):
     ```
     celery -A celery_app.celery worker --loglevel=info --pool=solo
     ```
   - Celery must be running at all times to process background transcription tasks.

8. For Deployment (Optional):
   
   Replace this in app.py :
   ```
   if __name__ == '__main__':
    app.run(debug=True)
   ```
   With :
   ```
   if __name__ == '__main__':
   import uvicorn
   uvicorn.run(app,host=0.0.0.0,port=5000)
   ```
The server will start at http://localhost:5000.

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your Clerk publishable key:
   ```
   REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. Start the development server:
   ```
   npm start
   ```
5. For  deployment server:
   ```
   npm run  build
   ```

The application will open at http://localhost:3000.

## Usage

1. Sign in or create an account using Clerk
2. Navigate to the Record page
3. Click the microphone button to start recording
4. Click the stop button when finished
5. Wait for the transcription to complete
6. View your transcripts on the Dashboard

## Tech Stack

- **Frontend**:
  - React
  - Tailwind CSS
  - Clerk Authentication
  - Axios for API calls

- **Backend**:
  - Flask
  - SQLAlchemy with SQLite
  - OpenAI Whisper API
  - Pydub for audio processing

