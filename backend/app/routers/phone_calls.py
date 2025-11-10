from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
from twilio.rest import Client
from dotenv import load_dotenv
import threading

# Load .env file from backend directory
backend_dir = Path(__file__).parent.parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter(prefix="/phone-calls", tags=["phone-calls"])

# Initialize Twilio client
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
ngrok_url = os.getenv("NGROK_URL", "").rstrip("/")

# Debug: Log if credentials are found (without exposing values)
if account_sid and auth_token:
    print(f"✅ Twilio client initialized (Account SID: {account_sid[:8]}...)")
else:
    print(f"❌ Twilio client NOT initialized - Account SID: {'Found' if account_sid else 'Missing'}, Auth Token: {'Found' if auth_token else 'Missing'}")
    print(f"   Looking for .env at: {env_path}")
    print(f"   .env file exists: {env_path.exists()}")

client = Client(account_sid, auth_token) if account_sid and auth_token else None


class EmergencyCallRequest(BaseModel):
    """Request to make an emergency call"""
    to_number: Optional[str] = None  # If None, uses MY_PHONE_NUMBER from env
    resident_name: Optional[str] = None
    alert_type: Optional[str] = None


class CallResponse(BaseModel):
    """Response from making a call"""
    success: bool
    message: str
    call_sid: Optional[str] = None


@router.post("/emergency", response_model=CallResponse)
def make_emergency_call(request: EmergencyCallRequest):
    """
    Make an emergency call to the resident or guardian.
    If to_number is not provided, calls MY_PHONE_NUMBER from environment.
    """
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Twilio client not initialized. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env"
        )
    
    if not ngrok_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="NGROK_URL not set in .env. Required for Twilio webhooks."
        )
    
    # Determine phone number to call
    to_number = request.to_number or os.getenv("MY_PHONE_NUMBER")
    if not to_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No phone number provided and MY_PHONE_NUMBER not set in .env"
        )
    
    # Build emergency message
    resident_info = f" for {request.resident_name}" if request.resident_name else ""
    alert_info = f" ({request.alert_type})" if request.alert_type else ""
    
    try:
        # Make the call using the emergency endpoint
        call = client.calls.create(
            url=f"{ngrok_url}/emergency",
            to=to_number,
            from_=twilio_phone
        )
        
        return CallResponse(
            success=True,
            message=f"Emergency call initiated{resident_info}{alert_info}",
            call_sid=call.sid
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate call: {str(e)}"
        )


@router.post("/temperature-alert", response_model=CallResponse)
def make_temperature_alert_call(request: EmergencyCallRequest):
    """
    Make a temperature alert call to the resident.
    This is the interactive call that asks them to press 1 if OK or 2 for emergency.
    """
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Twilio client not initialized. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env"
        )
    
    if not ngrok_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="NGROK_URL not set in .env. Required for Twilio webhooks."
        )
    
    # Determine phone number to call
    to_number = request.to_number or os.getenv("MY_PHONE_NUMBER")
    if not to_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No phone number provided and MY_PHONE_NUMBER not set in .env"
        )
    
    try:
        # Make the call using the temperature-alert endpoint
        call = client.calls.create(
            url=f"{ngrok_url}/temperature-alert",
            to=to_number,
            from_=twilio_phone
        )
        
        return CallResponse(
            success=True,
            message="Temperature alert call initiated",
            call_sid=call.sid
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate temperature alert call: {str(e)}"
        )


@router.post("/call-resident", response_model=CallResponse)
def call_resident(request: EmergencyCallRequest):
    """
    Call a resident (for guardian to call their resident).
    Uses the temperature-alert flow which allows interaction.
    """
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Twilio client not initialized. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env"
        )
    
    if not ngrok_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="NGROK_URL not set in .env. Required for Twilio webhooks."
        )
    
    if not request.to_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="to_number is required for calling a resident"
        )
    
    try:
        # Use temperature-alert endpoint for interactive calls
        call = client.calls.create(
            url=f"{ngrok_url}/temperature-alert",
            to=request.to_number,
            from_=twilio_phone
        )
        
        resident_info = f" to {request.resident_name}" if request.resident_name else ""
        return CallResponse(
            success=True,
            message=f"Call initiated{resident_info}",
            call_sid=call.sid
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate call: {str(e)}"
        )


# Twilio webhook endpoints (these need to be accessible via ngrok)
@router.get("/voice")
@router.post("/voice")
def voice():
    """Twilio webhook for voice calls"""
    return Response(
        content=f'''<Response>
  <Say voice="alice">Press 1 to continue.</Say>
  <Gather input="dtmf" numDigits="1" action="{ngrok_url}/api/phone-calls/gather" method="POST" timeout="10">
    <Say>Press 1 now.</Say>
  </Gather>
  <Say>No input received. Goodbye.</Say>
  <Hangup/>
</Response>''',
        media_type="application/xml"
    )


@router.get("/emergency")
@router.post("/emergency")
def emergency():
    """Twilio webhook for emergency calls"""
    return Response(
        content='<Response><Say voice="alice">This is an emergency call from SafeHouse. The user has triggered an emergency alert. Please check on them immediately.</Say><Hangup/></Response>',
        media_type="application/xml"
    )


@router.get("/temperature-alert")
@router.post("/temperature-alert")
def temperature_alert():
    """Twilio webhook for temperature alert calls"""
    return Response(
        content=f'''<Response>
  <Say voice="alice">Alert from SafeHouse. Your home temperature is dangerously high. This may indicate a heatwave or fire.</Say>
  <Gather input="dtmf" numDigits="1" action="{ngrok_url}/api/phone-calls/temperature-response" method="POST" timeout="10">
    <Say voice="alice">Press 1 if everything is okay, or press 2 if you need emergency assistance.</Say>
  </Gather>
  <Say voice="alice">No response received. Escalating to emergency contact.</Say>
  <Hangup/>
</Response>''',
        media_type="application/xml"
    )


@router.get("/temperature-response")
@router.post("/temperature-response")
async def temperature_response(request: Request):
    """Handle DTMF response from temperature alert call"""
    digits = ""
    if request.method == "POST":
        form_data = await request.form()
        digits = form_data.get("Digits", "")
    else:
        digits = request.query_params.get("Digits", "")
    
    abus_number = os.getenv("ABUS_NUMBER")
    
    if digits == "1":
        # User pressed 1 - everything is OK
        return Response(
            content='<Response><Say voice="alice">Thank you for confirming. We will continue monitoring. Stay safe.</Say><Hangup/></Response>',
            media_type="application/xml"
        )
    elif digits == "2":
        # User pressed 2 - needs emergency assistance
        # Trigger emergency call to emergency contact in background
        def call_emergency():
            if client and abus_number:
                try:
                    emergency_call = client.calls.create(
                        url=f"{ngrok_url}/api/phone-calls/emergency",
                        to=abus_number,
                        from_=twilio_phone
                    )
                    print(f"Emergency call to {abus_number} initiated: {emergency_call.sid}")
                except Exception as e:
                    print(f"Error calling emergency number: {e}")
        
        threading.Thread(target=call_emergency, daemon=True).start()
        
        return Response(
            content='<Response><Say voice="alice">Emergency assistance has been requested. We are calling your emergency contact now. Help is on the way.</Say><Hangup/></Response>',
            media_type="application/xml"
        )
    else:
        # No valid input or timeout
        return Response(
            content='<Response><Say voice="alice">No response received. We will check back with you shortly.</Say><Hangup/></Response>',
            media_type="application/xml"
        )


@router.get("/gather")
@router.post("/gather")
async def gather(request: Request):
    """Handle DTMF input from calls"""
    digits = ""
    if request.method == "POST":
        form_data = await request.form()
        digits = form_data.get("Digits", "")
    else:
        digits = request.query_params.get("Digits", "")
    
    abus_number = os.getenv("ABUS_NUMBER")
    
    if digits == "1":
        return Response(
            content='<Response><Say voice="alice">You pressed 1. Action completed!</Say><Hangup/></Response>',
            media_type="application/xml"
        )
    else:
        # Make emergency call in background thread
        def make_emergency_call():
            if client and abus_number:
                try:
                    emergency_call = client.calls.create(
                        url=f"{ngrok_url}/api/phone-calls/emergency",
                        to=abus_number,
                        from_=twilio_phone
                    )
                    print(f"Emergency call initiated: {emergency_call.sid}")
                except Exception as e:
                    print(f"Error calling emergency number: {e}")
        
        threading.Thread(target=make_emergency_call, daemon=True).start()
        
        return Response(
            content='<Response><Say voice="alice">Emergency noted calling emergency number. Goodbye.</Say><Hangup/></Response>',
            media_type="application/xml"
        )

