# Intelligent Stress Detection System

## Overview
The Intelligent Stress Detection System is an end-to-end, full-stack application designed to monitor, classify, and log physiological stress states in real-time. Leveraging Heart Rate Variability (HRV) parameters streamed from compatible wearable devices, the system processes complex time-series data using algorithmic Machine Learning models to identify states of cognitive load, stress, and baseline physiological relaxation.

## System Architecture

The application adopts a decoupled microservices architecture with three layers communicating via REST APIs:

**Frontend (Next.js + React)** → **Backend (Node.js + Express)** → **ML Server (Python + Flask)** → **MongoDB**

| Layer | System / Framework | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js, React, Tailwind CSS, Recharts | Real-time visualization dashboard, alerts, user settings |
| **Backend Gateway** | Node.js, Express.js | REST APIs, authentication middleware, payload validation |
| **ML Server** | Python, Flask, Scikit-Learn | Real-time stress prediction via trained Random Forest model |
| **Database** | MongoDB (Mongoose Schema) | Persistent storage for `SensorData`, `StressRecord`, `Notification`, `User` |

## Integration Architecture

### How the Components Connect

1. **Frontend → ML Server (Direct)**: The `useWearable.ts` hook sends biometric data directly to `http://localhost:5001/predict` every 2.5 seconds for real-time inference.
2. **Frontend → Backend**: Authentication, notification storage, and user data flow through the Express.js backend at `http://localhost:5000/api/*`.
3. **Backend → ML Server**: The `mlService.js` service abstracts ML calls, allowing the backend to also request predictions when needed.
4. **Backend → MongoDB**: All persistent data (users, notifications, stress records) is stored via Mongoose models.

### Key Integration Files

| File | Purpose |
| :--- | :--- |
| `src/hooks/useWearable.ts` | Simulates wearable data, calls ML server, triggers alerts |
| `backend/services/mlService.js` | Abstracted service to forward requests to ML server |
| `backend/routes/notifications.js` | CRUD API for alert persistence |
| `ml_server.py` | Flask API that loads model and returns predictions |

## Alert System

The alert system detects stress and notifies users in real-time. The data flow works as follows:

1. `useWearable.ts` generates HRV/EDA data every 2.5 seconds
2. HRV is converted to simulated heart rate: `HR = 140 - (HRV × 0.6)`
3. Data is POSTed to `http://127.0.0.1:5001/predict`
4. `ml_server.py` calculates 11 HRV features and runs model inference
5. Returns `NORMAL`, `MILD`, or `HIGH` stress level
6. If stress detected, `triggerAlert()` creates a notification and saves to MongoDB
7. Toast notification appears in the UI

**Alert Debouncing:** The system enforces a 5-second cooldown between alerts to prevent alert fatigue.

**Fallback Logic:** If the ML server is unavailable, the backend falls back to threshold-based detection:
```javascript
if (heartRate > 90 || eda > 3) stress = "HIGH";
else if (heartRate > 80) stress = "MILD";
```

## Machine Learning Methodology

The core intelligence of the system relies on supervised and unsupervised learning frameworks to ensure both accuracy and data integrity.

*   **Primary Inference (Random Forest Classifier):** Utilizes a 200-estimator depth-controlled ensemble technique to classify HRV payloads as "Stress" or "No Stress". This model achieved a validated 93% accuracy on testing cohorts.
*   **Anomaly Detection (Isolation Forest):** Identifies anomalous physiological readings (e.g., sensor malfunction, extreme arrhythmia) independently of the standard stress classifications.
*   **Feature Engineering:** Derives sophisticated metrics dynamically, such as Sympathovagal balance proxy (`LF_HF_ratio`) and internal variance stability (`HRV_balance`).

### Dataset Characteristics

The input pipeline demands structured physiological arrays. Below is a subset of the critical features utilized by the model:

| Parameter | Domain | Description |
| :--- | :--- | :--- |
| `MEAN_RR` | Time | Mean interval between successive heartbeats |
| `RMSSD` | Time | Root mean square of successive RR interval differences |
| `LF` | Frequency | Low-frequency power (Sympathetic nervous system proxy) |
| `HF` | Frequency | High-frequency power (Parasympathetic nervous system proxy) |
| `LF_HF_ratio` | Engineered | Ratio indicating autonomic nervous system balance |

## Prerequisites

Ensure the following environments are installed on the host machine prior to deployment:

- [Node.js](https://nodejs.org/) (v20.x or higher)
- [Python](https://www.python.org/) (v3.10 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or Atlas URI)
- [Git](https://git-scm.com/)

---

## Installation and Setup

**1. Clone the repository**

```bash
git clone <repository_url>
cd Software-Engineering_Intelligent_stress-detection
```

**2. Setup the Frontend Environment**

```bash
# Install frontend dependencies
npm install
```

**3. Setup the Backend Environment**

```bash
cd backend
# Install backend dependencies
npm install

# Configure environment variables
# Create a .env file in the /backend directory and add:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/stress_detection
# JWT_SECRET=your_secure_secret_key
cd ..
```

**4. Setup the Machine Learning Environment**
It is highly recommended to isolate Python dependencies using a virtual environment.

```bash
# Initialize virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/MacOS:
# source .venv/bin/activate

# Install Python packages
pip install flask flask-cors pandas numpy scikit-learn matplotlib seaborn joblib
```

---

## Running the Application

To ensure smooth concurrent execution, distinct terminal instances should be utilized for the Backend, Frontend, and ML-training scripts (if retraining is necessary).

### 1. Start the ML Server (Required First)

The ML server must be running for real-time stress predictions.

```bash
# Ensure the virtual environment is active
.venv\Scripts\activate

# Start the Flask ML server
python ml_server.py
```

_The ML server will initialize on http://localhost:5001._

### 2. Start the Backend API

The backend requires an active MongoDB connection.

```bash
cd backend
npm run dev
```

_The server will initialize on http://localhost:5000._

### 3. Start the Frontend Application

```bash
# From the project root directory
npm run dev
```

_The interactive dashboard will be accessible at http://localhost:3000._

### 4. Model Training and Analytics (Optional)

If modifications are made to the base datasets (`test.csv` / `train.csv`), models must be retrained to serialize updated `.pkl` binary files.

```bash
# Ensure the virtual environment is active
.venv\Scripts\activate

# Execute the core training pipeline algorithm
python train_cleaned.py

# Generate feature importance and predictive confusion matrices
python generate_graphs.py
```

## System Interfaces

*   **Web Dashboard UI (`/src/components/dashboard/Dashboard.tsx`):** Real-time aggregation of processed HRV feeds bridging visual metric cards.
*   **Context Logger (`/src/components/log/ContextLog.tsx`):** Maintains temporal relations between subjective human activities and objective physiological responses mapping causation logic.
*   **Inter-process Service (`/backend/services/mlService.js`):** The bridge transmitting raw Express.js HTTP streams directly into Python standard input for sub-second classification responses.

---

## Technical Documentation and Reporting Details

For academic or technical reporting, the following sections provide validated performance numbers and conceptual breakdowns derived from the system.

### Comparative Pipeline Evaluation

| Comparison Baseline       | Strategy                               | Validation Accuracy | Fallback Drawbacks                                                         |
| :------------------------ | :------------------------------------- | :------------------ | :------------------------------------------------------------------------- |
| **Traditional Threshold** | Binary bounds (e.g. HR > 100 BPM)      | ~70.0%              | Cannot distinguish cognitive strain from light physical exercise.          |
| **Proposed Approach**     | Random Forest Classifier + HRV Parsing | 93.0%               | Dependent on stable backend computation to evaluate matrices continuously. |

### Model Performance Metrics

Based on the `test.csv` subset containing 41,033 samples, the predictive matrix achieved the following metrics:

- **Global Accuracy:** 93%
- **Support Vectors:** 22,158 instances of "No Stress" / 18,875 instances of "Stress" (Time Pressure/Interruptions).
- **True Positives Metrics:** The F1-Score reliably maps above 0.92, ensuring that alert fatigue (false positive notifications sent to the user) is strictly minimized within the Next.js `Toast` hook.

### Key Directory and Data Flow References

*   `stress_model.pkl` / `anomaly_model.pkl` - Serialized Scikit-Learn binary objects storing logic trees for zero-latency loading.
*   `generate_graphs.py` - Script utility exporting `confusion_matrix.png` and `feature_importance.png` crucial for documenting empirical dataset relationships visually inside of research scopes.

### Academic References for Documentation Setup

When formally referencing this architecture's methodologies, refer to the underlying algorithms structure protocols:

1. Breiman, Leo. "Random forests." Machine learning 45.1 (2001): 5-32.
2. Liu, Fei Tony, Kai Ming Ting, and Zhi-Hua Zhou. "Isolation forest." 2008 Eighth IEEE international conference on data mining. IEEE, 2008.
