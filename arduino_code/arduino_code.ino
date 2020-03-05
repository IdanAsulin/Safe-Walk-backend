#include <aWOT.h>
#include <SPI.h>
#include <WiFiNINA.h>
#include <Arduino_LSM6DS3.h>
#include "wifi_secrets.h"
#include <avr/dtostrf.h>.

int status = WL_IDLE_STATUS;
WiFiServer server(80);
Application app;
WiFiClient client; // WiFiSSLClient to use when application is hosted on cloud

void callback(Request &req, Response &res) {
  float x, y, z;
  unsigned long startTime = millis();
  unsigned long endTime = startTime;
  int index = 1;
  res.set("Content-Type", "application/json");
  res.print("[");
  while((endTime - startTime) <= 60000) {
    if (IMU.accelerationAvailable()) {
      Serial.print("Sample has been taken -- ");
      Serial.println(index++);
      IMU.readAcceleration(x, y, z);
      char rawData[35];
      sprintf(rawData, "{\"x\":%f,\"y\":%f,\"z\":%f},", x, y, z);
      res.print(rawData);
    }
    endTime = millis();
  }
  res.println("]");
  res.end();
}

String IpAddress2String(const IPAddress& ipAddress)
{
  return String(ipAddress[0]) + String(".") +\
  String(ipAddress[1]) + String(".") +\
  String(ipAddress[2]) + String(".") +\
  String(ipAddress[3]);
}

void HTTPRequest(String HTTPMethod, String endpoint, String jsonBody){
  if(WiFi.status()== WL_CONNECTED){
     #define serverURL "172.20.10.3"
     if (client.connect(serverURL, 3000)) { // replace port to 443 when application hosted on cloud
        client.println(HTTPMethod + " " + endpoint + " HTTP/1.1");
        client.print("Host: ");
        client.println(serverURL);
        client.println("Content-type: application/json");
        client.print("Content-Length: ");
        client.println(jsonBody.length());
        client.println("Connection: close");
        client.println();
        client.println(jsonBody);
     } else
        while(true);
  }
}

void setup() {
  Serial.begin(9600); // Comment out in production
  while(!Serial);
  String sensorName = "sensor1";
  String kitID = "476da3c2-8581-45f5-a54f-e412fb001e6b";
  if (WiFi.status() == WL_NO_MODULE)
    while (true);
  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION)
        while(true);   // "Please upgrade the firmware";
  while (status != WL_CONNECTED) {
    Serial.println("Attempting to connect to WIFI");
    char ssid[] = SECRET_SSID;
    char pass[] = SECRET_PASS;
    status = WiFi.begin(ssid, pass);
  }
  String localIP = IpAddress2String(WiFi.localIP());
  Serial.println(localIP); // Comment out in production
  String jsonBody = "{\n    \"sensor\": \"" + sensorName + "\",\n    \"ip\": \"" + localIP + "\"\n}";
  String endpoint = "/api/sensorsKit/" + kitID + "/ips";
  HTTPRequest("PUT", endpoint, jsonBody);
  app.post("/start", &callback);
  server.begin();
  if (!IMU.begin())
    while (1);
}

void loop() {
  WiFiClient client1 = server.available();
  if (client1.connected())
    app.process(&client1);
}
