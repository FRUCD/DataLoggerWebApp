void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}
int x = 0;
void loop() {
  // put your main code here, to run repeatedly:
  Serial.print(x);
  Serial.println("i hate javascript");
  delay(1000);
  x++;
}
