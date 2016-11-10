void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}
int can[2] = {0x06,0x26};
void loop() {
  // put your main code here, to run repeatedly:
  Serial.write(can[0]);
  Serial.write(can[1]);
  unsigned long tick = millis();
  int time[4];
  time[0] = (unsigned int)((tick&0xFF000000)>>24);
  time[1] = (unsigned int)((tick&0x00FF0000)>>16);
  time[2] = (unsigned int)((tick&0x0000FF00)>>8);
  time[3] = (unsigned int)(tick&0x000000FF);
  Serial.write(time[0]);
  Serial.write(time[1]);
  Serial.write(time[2]);
  Serial.write(time[3]);
  Serial.write(1);
  Serial.write(1);
  Serial.write(1);
  Serial.write(1);
  Serial.write(1);
  Serial.write(1);
  Serial.write(1);
  Serial.write(1);
  Serial.write('\n');
  delay(1000);
}
