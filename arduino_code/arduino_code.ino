#include <aWOT.h>
#include <SPI.h>
#include <WiFiNINA.h>
#include <Arduino_LSM6DS3.h>
#include <avr/dtostrf.h>
#include "wifi_secrets.h"

WiFiServer server(80);
Application app;

void callback(Request &req, Response &res) {
  unsigned long startTime = millis();
  unsigned long endTime = startTime;
  int index = 0;
  res.set("Content-Type", "application/json");
  res.print("[");
  res.flush();
  while((endTime - startTime) <= 30000) {
    if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {
//      Serial.print(F("Sample has been taken -- "));
//      Serial.println(index);
      float xA, yA, zA, xG, yG, zG;
      IMU.readAcceleration(xA, yA, zA);
      IMU.readGyroscope(xG, yG, zG);
      char rawData[90];
      sprintf(rawData, "{\"xA\":%f,\"yA\":%f,\"zA\":%f,\"xG\":%f,\"yG\":%f,\"zG\":%f,\"t\":%d},", xA, yA, zA, xG, yG, zG, index++);
      res.print(rawData);
      res.flush();
    }
    endTime = millis();
  }
  res.print("]");
  res.flush();
  res.end();
//  Serial.print(F("Done"));
}

String toString(const IPAddress& address) {
  return String() + address[0] + "." + address[1] + "." + address[2] + "." + address[3];
}

void updateIpInServer(char* localIP) {
  if(WiFi.status() == WL_CONNECTED) {
     #define serverIP "3.89.190.108"
     String sensorName = F("sensor1");
     String kitID = F("476da3c2-8581-45f5-a54f-e412fb001e6b");
     WiFiClient client;
     if (client.connect(serverIP, 3000)) {
        String jsonBody = "{\"sensor\":\"" + sensorName + "\",\"ip\":\"" + localIP + "\"}";
        client.println("PUT /api/sensorsKit/" + kitID + "/ips HTTP/1.1");
        client.print(F("Host: "));
        client.println(serverIP);
        client.println(F("Content-type: application/json"));
        client.print(F("Content-Length: "));
        client.println(jsonBody.length());
        client.println(F("Connection: close"));
        client.println();
        client.println(jsonBody);
     } else
        while(true);
  }
}

void setup() {
//  Serial.begin(9600);
//  while(!Serial);
  if (WiFi.status() == WL_NO_MODULE)
    while (true);
  if (WiFi.firmwareVersion() < WIFI_FIRMWARE_LATEST_VERSION)
    while(true);
  int status = WL_IDLE_STATUS;
  while (status != WL_CONNECTED) {
//    Serial.println(F("Attempting to connect to WIFI"));
    char ssid[] = SECRET_SSID;
    char pass[] = SECRET_PASS;
    status = WiFi.begin(ssid, pass);
  }
  char localIP[18];
  sprintf(localIP, "%s", toString(WiFi.localIP()).c_str());
//  Serial.println(localIP);
  updateIpInServer(localIP);
  server.begin();
  app.post("/start", &callback);
  if (!IMU.begin())
    while (1);
}

void loop() {
  WiFiClient client1 = server.available();
  if (client1.connected())
    app.process(&client1);
}