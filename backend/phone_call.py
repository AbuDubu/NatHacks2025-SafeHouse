# Download the helper library from https://www.twilio.com/docs/python/install
import os
from twilio.rest import Client
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import Response
import uvicorn
import threading
import time

load_dotenv()

app = FastAPI()

NGROK_URL = os.getenv("NGROK_URL", "").rstrip("/")

@app.get("/voice")
@app.post("/voice")
def voice():
    return Response(
        content=f'''<Response>
  <Say voice="alice">Press 1 to continue.</Say>
  <Gather input="dtmf" numDigits="1" action="{NGROK_URL}/gather" method="POST" timeout="10">
    <Say>Press 1 now.</Say>
  </Gather>
  <Say>No input received. Goodbye.</Say>
  <Hangup/>
</Response>''',
        media_type="application/xml"
    )

@app.get("/gather")
@app.post("/gather")
async def gather(request: Request):
    digits = ""
    if request.method == "POST":
        form_data = await request.form()
        digits = form_data.get("Digits", "")
    else:
        digits = request.query_params.get("Digits", "")
    
    if digits == "1":
        # Do something when they press 1
        return Response(
            content='<Response><Say voice="alice">You pressed 1. Action completed!</Say><Hangup/></Response>',
            media_type="application/xml"
        )
    else:
        return Response(
            content='<Response><Say voice="alice">Invalid input. Goodbye.</Say><Hangup/></Response>',
            media_type="application/xml"
        )

if __name__ == "__main__":
    if not NGROK_URL:
        print("ERROR: NGROK_URL is not set in your .env file!")
        print("Make sure you have NGROK_URL=https://your-ngrok-url.ngrok-free.dev in your .env")
        exit(1)
    
    # Start server
    threading.Thread(target=lambda: uvicorn.run(app, host="0.0.0.0", port=8001), daemon=True).start()
    time.sleep(2)
    
    # Make the call
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    client = Client(account_sid, auth_token)
    
    call = client.calls.create(
      url=f"{NGROK_URL}/voice",
      to=os.getenv("MY_PHONE_NUMBER"),
      from_=os.getenv("TWILIO_PHONE_NUMBER")
    )
    
    print(call.sid)
    
    # Keep server running
    while True:
        time.sleep(1)