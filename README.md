
# 🏥 MedDoc

**MedDoc** is a web application designed to help people with disabilities fill out medical documents using text-to-speech and speech-to-text. It utilizes **Amazon Bedrock** for AI assistance throughout the form filling process. It uses **Firestore** for data management. The app provides an intuitive interface built with **React** and **Tailwind**, ensuring that users can easily understand what is happening. Once logged in, the user can fill out the form without ever needing to touch the tablet.

### 🚨 Important Note
Not all features of MedDoc will function properly until you set up your own Firebase database and provide your own Amazon AWS API Gateway keys. The application requires these for full functionality.

---

## 🛠️ Tech Stack
- **Frontend:** React + JavaScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase for authentication and database (Firestore)
- **AI Assistant:** Amazon Bedrock + Amazon Lambda
- **PDF Access:** Python for accessing and manipulating PDFs

---

## ⚙️ Installation & Setup
### 1. Clone the repository
```bash
git clone https://github.com/Uplix/MedDoc.git
cd MedDoc
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase
- Create a Firebase project in [Firebase Console](https://console.firebase.google.com/).
- Copy your keys into a .env file

### 4. Set up Amazon AWS API Keys
- Create an AWS account if you haven't already: [AWS](https://aws.amazon.com/).
- Set up Amazon Bedrock and Lambda according to AWS documentation.
- Provide the API keys in the application configuration for the features to work.

### 5. Start the development server
```bash
npm start
```

### 6. Open the application
- Visit [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### 7. Running the Medical Document Filler
To run the medical document filler script, execute the following command:
```bash
python3 real.py
```
This will trigger the document processing feature and allow the app to fill out medical forms based on the provided templates.

---

## 📁 Project Structure
```
📦 meddoc
 ┣ 📂 src/              # Main folder for all website code
 ┣ 📂 src/firebase/     # Firebase initialization and functions
 ┣ 📜 src/App.jsx       # Main application component
 ┣ 📜 src/form.jsx      # Form filling page
 ┣ 📜 real.py           # Python script for medical document filling
 ┣ 📜 package.json
 ┗ 📜 README.md
```

---

## 🧠 Future Improvements
- Improve AI model for better assistance
- Add support for additional document types
- Enhance UI with more features like document previews
- Add dashboard for medical staff to assign patients with documents
