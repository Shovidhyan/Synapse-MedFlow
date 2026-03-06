# Synapse MedFlow

Synapse MedFlow is a comprehensive healthcare management and patient engagement platform. It bridges the gap between patients, doctors, and caregivers, streamlining communication, action tracking, and wellness insights.

## Core Features

- **Patient Dashboard**: A personalized interface for patients to view their health metrics and receive actionable holistic wellness advice based on comprehensive analysis.
- **Doctor Dashboard**: A professional interface allowing doctors to review patient data, prescribe medications, and maintain a detailed "Action History" of all patient interactions.
- **Caregiver Dashboard**: A dedicated view for caretakers/caregivers to monitor patient well-being, featuring a polished, user-friendly layout.
- **Automated Communication**: Seamless patient registration flow with automated welcome emails and daily medication reminders.
- **Predictive Health Insights**: Integration with a Convolutional Neural Network (CNN) model. The model was trained using Google Colab to predict patient blood sugar levels and other vital metric trends for proactive healthcare.

## System Flow

1. **Patient Onboarding**: 
   - A patient registers via the platform.
   - An automated welcome email is dispatched.
   - Any prescribed medication schedules trigger automated daily reminder emails (e.g., 9 AM daily pill reminders).
2. **Medical Management (Doctor Flow)**:
   - Doctors access their dashboard to view patient details.
   - Doctors perform actions such as adding prescriptions or updating health records.
   - All interactions are logged in the "Action History" (synced via Firebase) for a complete audit trail of interventions.
3. **Daily Engagement (Patient Flow)**:
   - Patients log in to their dashboard.
   - They can view their ongoing treatments, health stats, and interact with AI-driven wellness features for daily advice and support.
4. **Caregiver Monitoring (Caregiver Flow)**:
   - Caregivers access a tailored dashboard to track the status of the patients they are assigned to, keeping them informed of schedules and vital health updates.

## Technologies Used

- **Frontend Core**: React, TypeScript, Vite
- **Styling & UI**: Tailwind CSS, shadcn/ui
- **Backend / Database**: Firebase (Authentication, Firestore for action logs and patient data)
- **AI Integration**: Google Gemini API
- **Automation**: Google Apps Script (for email dispatch flows)

## Running the Application Locally

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Shovidhyan/Synapse-MedFlow
   cd Synapse-MedFlow
   ```

2. **Install dependencies:**
   Make sure you have [Node.js](https://nodejs.org/) installed, then run:
   ```sh
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your required keys. Note: For security, the `.env` file is ignored by Git.
   ```env
   # Add your Firebase configuration keys and other environment variables here
   ```

4. **Start the development server:**
   ```sh
   npm run dev
   ```
   The application will instantly start running (typically at `http://localhost:5173`).


   **Live link :
    ```sh
    https://synapse-med-flow.vercel.app/
    ```

   **Apk link :
    ```sh
    https://drive.google.com/file/d/11Ye-Oi2DeDedcshPy3NkQYqrX8D0ad4d/view?usp=drivesdk
    ```



    ![Synapse MedFlow Workflow](./assets/WORKFLOW(1).png)
