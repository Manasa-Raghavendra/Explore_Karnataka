---


# 🌍 Explore Karnataka – AI Powered Tourism Platform

Explore Karnataka is a full-stack AI-driven tourism web application that helps users discover attractions, festivals, itineraries, and cultural experiences across Karnataka using intelligent recommendations, image recognition, AR visualization, and a conversational AI chatbot.

---

## 🚀 Features

### 🌟 User Features
- Browse tourist attractions and festivals
- Personalized attraction recommendations based on interests
- AI Chatbot for travel guidance
- Image-based place identification
- Audio stories for cultural experiences
- AR model viewer for selected attractions
- Build and manage personal itineraries
- Secure authentication (JWT)

### 🛠 Admin Features
- Manage attractions and festivals
- View user analytics
- Curate tourism content

---

## 🧠 AI & ML Capabilities
- Image recognition using CNN models
- Tourism classifier (TensorFlow / Keras)
- Chatbot powered by LLM (Groq / LLaMA)
- Recommendation engine based on user interests

---

## 🧩 Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Axios
- Lucide Icons

### Backend
- Flask
- Flask-CORS
- Flask-JWT-Extended
- MongoDB (PyMongo)
- TensorFlow / PyTorch
- OpenCV

---

## 📁 Project Structure

```text
EXPLORE-KARNATAKA/
│
├── backend/
│   ├── models/
│   │   ├── attraction_model.py
│   │   ├── festival_model.py
│   │   ├── image_recognition.py
│   │   ├── karnataka_model.keras
│   │   ├── tourism_classifier_v4.keras
│   │   ├── tourism_classifier_v4.tflite
│   │   └── user_model.py
│   │
│   ├── routes/
│   │   ├── admin.py
│   │   ├── analytics.py
│   │   ├── attractions.py
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── festivals.py
│   │   ├── image_recognition_routes.py
│   │   ├── itineraries.py
│   │   └── recommendations.py
│   │
│   ├── uploads/
│   ├── dataset/
│   ├── app.py
│   ├── run.py
│   ├── config.py
│   ├── extensions.py
│   ├── requirements.txt
│   ├── .env
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   │   └── data/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Chatbot/
│   │   │   ├── AttractionCard.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── RecommendedAttractions.tsx
│   │   │
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── .gitignore
│
└── README.md
````

---

## 🔧 Environment Setup

### Backend `.env`

```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=Karnataka_Tourism
JWT_SECRET_KEY=your_secrete_key
ADMIN_CODE=Admin_password_to_register_as_admin
GROQ_API_KEY=your_api_key
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## ▶️ Running the Project

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python run.py
```

Backend runs on:
[http://localhost:5000](http://localhost:5000)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
[http://localhost:8080](http://localhost:8080)

---

## 🔐 Authentication

* JWT-based authentication
* Role-based access (User / Admin)
* Secure API routes

---

## 🖼 AR & Image Recognition

* AR models rendered using `<model-viewer>`
* Image uploads analyzed using ML models
* Supports `.keras` and `.tflite` models

---

## 📌 Future Enhancements

* Offline itinerary support
* Festival prediction system
* Multilingual chatbot
* Deployment (Docker / Cloud)


---
⭐ If you like this project

Please ⭐ the repository and share your feedback!
