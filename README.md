# NatHacks2025-SafeHaven
SafeHaven is a React Native mobile application designed to protect elderly or high-risk individuals living alone by monitoring their health and home environment. It connects to IoT sensors (built with an ESP32) that detect extreme temperatures and to Apple HealthKit for health data like heart rate and activity.When unsafe conditions are detected, SafeHaven first sends a warning notification to the user.  If there’s no response, it makes an AI-assisted call using Twilio’s API. If two calls go unanswered, the system automatically contacts emergency services and notifies caregivers.

Frontend: React Native (with Apple HealthKit integration for mock health data)
Backend: FastAPI (Python) + SQLite
Hardware: ESP32 microcontroller with temperature and humidity sensors
API Integrations: Twilio Voice API for automated calls and alert escalation


How to Access:

Backend Setup:

IN /backend directory
   
1. Set up a Python virtual environment:
python3 -m venv venv  
source venv/bin/activate  

2. Install dependencies:
pip install -r requirements.txt  

3. Run the backend server:
./run.sh  


Frontend Setup (Ensure you have Xcode installed for simulation):

IN /frontend directory.


1. Install dependencies:
npm install  

2. Run the app:
npm start  

The ESP32 continuously monitors environmental data and sends JSON payloads via REST API to the FastAPI backend.

Research:
https://www150.statcan.gc.ca/n1/daily-quotidien/230418/dq230418b-eng.htm#archived
https://www.cbc.ca/news/canada/montreal/heat-mortality-quebec-1.7239971

Hardware: Abubakar 

Backend: Rishi, Ayub 

Frontend: Alishba, Mehmood

Presentation/Submission: Alishba

