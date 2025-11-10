#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT11
#define BUTTON 38

// wifi and ser
const char* ssid = "Nat";
const char* password = "abunat12";
const char* apiURL = "http://10.136.18.16:8000/api/sensors/readings";
const char* google = "https://google.com";

DHT dht(DHTPIN, DHTTYPE);


void setup() {
  // put your setup code here, to run once:
  pinMode(BUTTON, INPUT_PULLUP);
  Serial.begin(115200);
  dht.begin();
  delay(1000);
  

  // connect Wifi
  Serial.println("connecting to wifi...");
  WiFi.begin(ssid, password);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 20) {
    delay(500);
    Serial.println(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED ){
    Serial.println("\n Wifi Connected good job!");
    Serial.println(WiFi.localIP());
  }
  else {
    Serial.println("\n WiFi not connected.");
  }


}

void loop() {
  delay(15000);
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t)){
    Serial.println("Failed to read from DHT");
    return;
  }
  if (isnan(h)){
    Serial.println("Failed to read humidity");
  }

  Serial.print("temp: ");
  Serial.println(t);
  Serial.print("Humidity: ");
  Serial.println(h);

  if (WiFi.status() == WL_CONNECTED){
     HTTPClient http;
    http.begin(apiURL);
    http.addHeader("Content-Type", "application/json");
    String json = "{";

    // Button to send trigger data
    if (digitalRead(BUTTON) == LOW) {  // pressed
      json += "\"value\":" + String(140.00, 1) + ",";
    } else {
      json += "\"value\":" + String(t, 1) + ",";
    }

    json += "\"unit\":\"\",";
    json += "\"sensor_id\":1";
    json += "}";
    Serial.println(json);

    int code = http.POST(json);
    if (code > 0){
      Serial.printf("Alert Sent! Responce Code: %d\n", code);
    }
    else{
      Serial.printf("HTTP Error: %d\n", code);
    }

    http.end();

    // if(http.begin(google)){
    //   if (http.GET() > 0){
    //     Serial.println( http.getString());

    //   }
    //   http.end();
    // }

  }
  else{
    Serial.println("WiFi not connected! skipping Api post");
  }


}
