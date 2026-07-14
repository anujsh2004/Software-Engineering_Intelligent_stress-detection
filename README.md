🧠 ZenStudent AI

> An AI-powered real-time stress detection and monitoring platform using
> physiological signals, machine learning, and a full-stack
> microservices architecture.
> 🌐 Live Demo
> Live Application: https://zenstudent-ai.vercel.app/
> 📌 Overview
> ZenStudent AI is an end-to-end intelligent stress monitoring system
> designed to classify physiological stress states in real time.
> The platform simulates wearable biometric data such as Heart Rate
> Variability (HRV) and Electrodermal Activity (EDA), processes the
> signals through a deployed machine learning API, and displays stress
> insights through an interactive dashboard.
> The system combines a Next.js frontend, Node.js/Express backend, Flask
> ML inference service, and MongoDB Atlas database.
> ✨ Key Features
> Real-time HRV and EDA monitoring
> Machine-learning-based stress classification
> `NORMAL`, `MILD`, and `HIGH` stress states
> Random Forest based inference
> Isolation Forest anomaly detection support
> Real-time physiological dashboard
> Stress alerts and notification debouncing
> User registration and authentication
> Persistent MongoDB storage
> Context and activity logging
> Decoupled frontend, backend, and ML services
> Production deployment using Vercel, Render, and MongoDB Atlas
> 🏗️ Production Architecture

```text
Next.js Frontend — Vercel
        │
        ├── Authentication / User Data
        │              ↓
        │      Express Backend — Render
        │              ↓
        │         MongoDB Atlas
        │
        └── Real-time Biometric Data
                       ↓
               Flask ML API — Render
                       ↓
              Random Forest Model
```

🛠️ Tech Stack
Layer Technologies

---

Frontend Next.js, React, TypeScript, Tailwind CSS, Recharts
Backend Node.js, Express.js
ML API Python, Flask, Flask-CORS
Machine Learning Scikit-Learn, Random Forest, Isolation Forest
Data Processing Pandas, NumPy
Database MongoDB Atlas, Mongoose
Authentication JWT-based authentication
Deployment Vercel, Render
Version Control Git, GitHub
🔄 End-to-End Data Flow
The frontend simulates wearable HRV and EDA readings.
Biometric readings are generated at regular intervals.
The frontend sends a `POST` request to the Flask `/predict`
endpoint.
The ML server performs feature engineering on the physiological
inputs.
The trained stress model performs inference.
The API returns a stress classification.
The dashboard updates the real-time stress state.
Stress events can trigger alerts and notifications.
Backend APIs handle authentication and persistent application data.
MongoDB Atlas stores application records.
🤖 Machine Learning Pipeline
The ML service uses physiological signal-derived features to estimate
stress state.
Primary Model
A Random Forest classifier is used for stress prediction.
Anomaly Detection
An Isolation Forest model is included to identify unusual physiological
patterns or potentially abnormal sensor readings.
Feature Engineering
Feature Description

---

`MEAN\_RR` Mean interval between successive heartbeats
`RMSSD` Root mean square of successive RR interval differences
`SDRR` Standard deviation of RR intervals
`LF` Low-frequency power
`HF` High-frequency power
`LF\_HF\_ratio` Autonomic balance proxy
`HRV\_balance` Engineered HRV stability feature
The Flask service loads serialized Scikit-Learn model artifacts for
inference.
🚨 Stress Alert System
The prediction API returns stress states such as:

```text
NORMAL
MILD
HIGH
```

When elevated stress is detected, the application can trigger an alert
and persist notification data. A cooldown mechanism reduces repeated
alerts and notification fatigue.
🔌 API Integration
ML Prediction API

```http
POST /predict
```

Example request:

```json
{
  "heartRate": 70,
  "eda": 2.5
}
```

Example response:

```json
{
  "success": true,
  "stressLevel": "NORMAL",
  "prediction\_raw": "0"
}
```

Environment-Based Service Integration

```text
NEXT\_PUBLIC\_BACKEND\_URL
NEXT\_PUBLIC\_ML\_SERVICE\_URL
ML\_SERVICE\_URL
```

📁 Project Structure

```text
Software-Engineering\_Intelligent\_stress-detection/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── package.json
├── public/
├── src/
│   ├── app/
│   ├── components/
│   └── hooks/
│       └── useWearable.ts
├── ml\_server.py
├── stress\_model.pkl
├── anomaly\_model.pkl
├── baseline.pkl
├── stress\_scaler.pkl
├── requirements.txt
├── test.csv
├── package.json
└── README.md
```

💻 Local Installation
Prerequisites
Node.js 20+
Python 3.10+
Git
MongoDB Atlas or local MongoDB

1. Clone the Repository

```bash
git clone https://github.com/anujsh2004/Software-Engineering\_Intelligent\_stress-detection.git
cd Software-Engineering\_Intelligent\_stress-detection
```

2. Install Frontend Dependencies

```bash
npm install
```

3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

4. Configure Backend Environment Variables
   Create `backend/.env`:

```env
PORT=5000
MONGODB\_URI=mongodb+srv://<username>:<password>@<cluster>/stress\_detection
JWT\_SECRET=<your\_secure\_jwt\_secret>
ML\_SERVICE\_URL=http://127.0.0.1:5001/predict
```

Never commit `.env` files or real credentials. 5. Create a Python Virtual Environment
Windows Git Bash

```bash
python -m venv .venv
source .venv/Scripts/activate
```

Windows Command Prompt

```bat
python -m venv .venv
.venv\\Scripts\\activate
```

Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

6. Install ML Dependencies

```bash
pip install -r requirements.txt
```

▶️ Running Locally
Run three services in separate terminals.
Terminal 1 --- ML Server

```bash
source .venv/Scripts/activate
python ml\_server.py
```

ML API: `http://localhost:5001`
Terminal 2 --- Backend

```bash
cd backend
npm run dev
```

Backend API: `http://localhost:5000`
Terminal 3 --- Frontend

```bash
npm run dev
```

Frontend: `http://localhost:3000`
🌍 Frontend Environment Variables

```env
NEXT\_PUBLIC\_BACKEND\_URL=http://localhost:5000
NEXT\_PUBLIC\_ML\_SERVICE\_URL=http://127.0.0.1:5001
```

Production values should point to the deployed Render services.
🚀 Deployment
Frontend --- Vercel
Production variables:

```env
NEXT\_PUBLIC\_BACKEND\_URL=<deployed\_backend\_url>
NEXT\_PUBLIC\_ML\_SERVICE\_URL=<deployed\_ml\_service\_base\_url>
```

Live application: https://zenstudent-ai.vercel.app/
Backend --- Render

```text
Language: Node
Root Directory: backend
Build Command: npm install
Start Command: npm run start
```

```env
MONGODB\_URI=<mongodb\_atlas\_uri>
JWT\_SECRET=<secure\_jwt\_secret>
ML\_SERVICE\_URL=<deployed\_ml\_service\_url>/predict
```

ML Server --- Render

```text
Language: Python 3
Root Directory: repository root
Build Command: pip install -r requirements.txt
Start Command: gunicorn ml\_server:app
```

📊 Model Artifacts
File Purpose

---

`stress\_model.pkl` Serialized stress classification model
`anomaly\_model.pkl` Serialized anomaly detection model
`stress\_scaler.pkl` Feature scaling artifact
`baseline.pkl` Baseline physiological data artifact
🔐 Security Practices
Environment files are excluded through `.gitignore`.
MongoDB credentials are stored outside the repository.
JWT secrets use environment variables.
Production services use separate environment configuration.
Credentials and connection strings must never be committed.
🧪 Production Verification
The deployed system has been tested for:
Frontend availability
User registration and login
MongoDB Atlas persistence
Backend API connectivity
Flask ML API availability
Browser-to-ML API CORS requests
Repeated `POST /predict` requests
Successful `200 OK` prediction responses
🔮 Future Improvements
Real wearable device integration
WebSocket-based biometric streaming
Personalized stress baselines
User-specific model calibration
Advanced HRV time-series models
Mobile application support
Structured cloud observability
Model drift monitoring
Improved role-based authentication
Automated CI/CD testing
📚 References
Breiman, L. (2001). Random Forests. Machine Learning, 45, 5--32.
Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). Isolation Forest.
IEEE International Conference on Data Mining.
👨‍💻 Author
Anuj Sharma
B.Tech Computer Science and Engineering
GitHub: https://github.com/anujsh2004

---

If you found this project useful, consider giving the repository a ⭐.
