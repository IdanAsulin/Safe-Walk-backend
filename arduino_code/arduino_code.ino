
#include <aWOT.h>
#include <SPI.h>
#include <WiFiNINA.h>
#include <Arduino_LSM6DS3.h>
#include "wifi_secrets.h"
#include <avr/dtostrf.h>.

#define serverURL "192.168.0.2"
String sensorName = "sensor1";
String kitID = "476da3c2-8581-45f5-a54f-e412fb001e6b";
String errorMessage = "";
char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

int status = WL_IDLE_STATUS;
WiFiServer server(80);
Application app;
WiFiClient client; // WiFiSSLClient to use when application is hosted on cloud

String floatToString(float number) {
  char buffer[6];
  return dtostrf(number, 0, 5, buffer);
}

void callback(Request &req, Response &res) {
  float x, y, z;
  unsigned long startTime = millis();
  unsigned long endTime = startTime;
  int index = 1;
  res.set("Content-Type", "application/json");
  res.println("[");
  while((endTime - startTime) <= 60000) {
    if (IMU.accelerationAvailable()) {
      Serial.print("Sample has been taken --");
      Serial.println(index++);
      IMU.readAcceleration(x, y, z);
      String xString = floatToString(x), yString = floatToString(y), zString = floatToString(z);
      res.println("{\"x\":" + xString + ",\"y\":" + yString + ", \"z\":" + zString + "},");
    }
    endTime = millis();
  }
  res.println("]");
  Serial.println("Returning results");
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
     if (client.connect(serverURL, 3000)) { // replace port to 443 when application hosted on cloud
        client.println(HTTPMethod + " " + endpoint + " HTTP/1.1");
        client.print("Host: ");
        client.println(serverURL);
        client.println("Content-type: application/json");
        client.println("Accept: application/json");
        client.println("Cache-Control: no-cache");
        client.println("Accept-Encoding: gzip, deflate");
        client.print("Content-Length: ");
        client.println(jsonBody.length());
        client.println("Connection: close");
        client.println();
        client.println(jsonBody);
     } else {
      errorMessage = "Error connecting to server";
     }
  }
}

void setup() {
  if (WiFi.status() == WL_NO_MODULE) {
    errorMessage = "Communication with WiFi module failed!";
    while (true);
  }
  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    errorMessage = "Please upgrade the firmware";
  }
  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    delay(1000);
  }
  String localIP = IpAddress2String(WiFi.localIP());
  String jsonBody = "{\n    \"sensor\": \"" + sensorName + "\",\n    \"ip\": \"" + localIP + "\"\n}";
  String endpoint = "/api/sensorsKit/" + kitID + "/ips";
//  HTTPRequest("PUT", endpoint, jsonBody);
  Serial.begin(115200); // Comment out in production
  Serial.println(localIP); // Comment out in production
  app.post("/start", &callback);
  server.begin();
  if (!IMU.begin())
    while (1);
}


void loop() {
  WiFiClient client1 = server.available();
  if (client1.connected()) {
    app.process(&client1);
  }
}
