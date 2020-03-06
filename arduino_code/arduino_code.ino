#include <aWOT.h>
#include <SPI.h>
#include <WiFiNINA.h>
#include <Arduino_LSM6DS3.h>
#include "wifi_secrets.h"
#include <avr/dtostrf.h>.

WiFiServer server(80);
Application app;

void callback(Request &req, Response &res) {
  unsigned long startTime = millis();
  unsigned long endTime = startTime;
  int index = 1;
  res.set("Content-Type", "application/json");
  res.print("[");
  while((endTime - startTime) <= 60000) {
    if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {
      Serial.print(F("Sample has been taken -- "));
      Serial.println(index++);
      float xA, yA, zA, xG, yG, zG;
      IMU.readAcceleration(xA, yA, zA);
      IMU.readGyroscope(xG, yG, zG);
      char rawData[80];
      sprintf(rawData, "{\"xA\":%f,\"yA\":%f,\"zA\":%f,\"xG\":%f,\"yG\":%f,\"zG\":%f},", xA, yA, zA, xG, yG, zG);
      res.print(rawData);
      res.flush();
    }
    endTime = millis();
  }
  res.println("]");
  res.end();
}

String toString(const IPAddress& address) {
  return String() + address[0] + "." + address[1] + "." + address[2] + "." + address[3];
}

void updateIpInServer(WiFiClient client, char* localIP) {
  if(WiFi.status() == WL_CONNECTED) {
     char serverURL[] = "3.89.190.108";
     char sensorName[] = "sensor1";
     char jsonBody[25];
     sprintf(jsonBody, "{\"sensor\":%s,\"ip\":%s}", sensorName, localIP);
     char kitID[] = "476da3c2-8581-45f5-a54f-e412fb001e6b";
     if (client.connect(serverURL, 3000)) {
        char httpRequest[80];
        sprintf(httpRequest, "PUT /api/sensorsKit/%s/ips HTTP/1.1", kitID);
        client.println(httpRequest);
        client.print(F("Host: "));
        client.println(serverURL);
        client.println(F("Content-type: application/json"));
        client.print(F("Content-Length: "));
        client.println(25); // length of jsonBody
        client.println(F("Connection: close"));
        client.println();
        client.println(jsonBody);
     } else
        while(true);
  }
}

void setup() {
  Serial.begin(9600);
  while(!Serial);
  if (WiFi.status() == WL_NO_MODULE)
    while (true);
  if (WiFi.firmwareVersion() < WIFI_FIRMWARE_LATEST_VERSION)
        while(true);   // "Please upgrade the firmware";
  int status = WL_IDLE_STATUS;
  while (status != WL_CONNECTED) {
    Serial.println(F("Attempting to connect to WIFI"));
    char ssid[] = SECRET_SSID;
    char pass[] = SECRET_PASS;
    status = WiFi.begin(ssid, pass);
  }
  char localIP[18];
  sprintf(localIP, "%s", toString(WiFi.localIP()).c_str());
  Serial.println(localIP);
  WiFiClient client;
  updateIpInServer(client, localIP);
  server.begin();
  app.post("/start", &callback);
  if (!IMU.begin())
    while (1);
}

void loop() {
  WiFiClient client = server.available();
  if (client.connected())
    app.process(&client);
}
