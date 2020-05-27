#include <SPI.h>
#include <WiFiNINA.h>
#include <Arduino_LSM6DS3.h>
#include <avr/dtostrf.h>
#include "config.h"

WiFiServer server(80);

String toString(const IPAddress& address) {
  return String() + address[0] + "." + address[1] + "." + address[2] + "." + address[3];
}

void updateIpInServer(char* localIP) {
  if (WiFi.status() == WL_CONNECTED) {
    String sensorName = SENSOR_NAME;
    String kitID = KIT_ID;
    WiFiSSLClient client;
    if (client.connect(SERVER_IP, 443)) {
      String jsonBody = "{\"sensor\":\"" + sensorName + "\",\"ip\":\"" + localIP + "\"}";
      client.println("PUT /api/sensorsKit/" + kitID + "/ips HTTP/1.1");
      client.print(F("Host: "));
      client.println(SERVER_IP);
      client.println(F("Content-type: application/json"));
      client.print(F("Content-Length: "));
      client.println(jsonBody.length());
      client.println(F("Connection: close"));
      client.println();
      client.println(jsonBody);
    } else
      while (true);
  }
}

void setup() {
  //  Serial.begin(9600);
  //  while (!Serial);
  if (WiFi.status() == WL_NO_MODULE)
    while (true);
  if (WiFi.firmwareVersion() < WIFI_FIRMWARE_LATEST_VERSION)
    while (true);
  int status = WL_IDLE_STATUS;
  while (status != WL_CONNECTED) {
    //    Serial.println(F("Attempting to connect to WIFI"));
    status = WiFi.begin(WIFI_NAME, WIFI_PASS);
  }
  char localIP[18];
  sprintf(localIP, "%s", toString(WiFi.localIP()).c_str());
  //  Serial.println(localIP);
  updateIpInServer(localIP);
  server.begin();
  if (!IMU.begin())
    while (1);
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    //    Serial.println("new client");
    unsigned long startTime = millis();
    unsigned long endTime = startTime;
    int index = 0;
    boolean currentLineIsBlank = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        if (c == '\n' && currentLineIsBlank) {
          client.println(F("HTTP/1.1 200 OK"));
          client.println(F("Access-Control-Allow-Origin: *"));
          client.println(F("Content-Type: application/json"));
          client.println(F("Connection: keep-alive"));
          client.println();
          client.print(F("["));
          while ((endTime - startTime) <= SAMPLE_TIME) {
            if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {
              //              Serial.print(F("Sample has been taken -- "));
              //              Serial.println(index);
              float xA, yA, zA, xG, yG, zG;
              IMU.readAcceleration(xA, yA, zA);
              IMU.readGyroscope(xG, yG, zG);
              char rawData[105];
              sprintf(rawData, "{\"xA\":%.3f,\"yA\":%.3f,\"zA\":%.3f,\"xG\":%.3f,\"yG\":%.3f,\"zG\":%.3f,\"t\":%d},", xA, yA, zA, xG, yG, zG, index++);
              client.print(rawData);
            }
            endTime = millis();
          }
          client.print(F("]"));
          break;
        }
        if (c == '\n') {
          currentLineIsBlank = true;
        } else if (c != '\r') {
          currentLineIsBlank = false;
        }
      }
    }
    client.stop();
    //    Serial.println(F("Done"));
  }
}