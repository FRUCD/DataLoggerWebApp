#include <iostream>
#include <iomanip>
#include <fstream>
#include <exception>
#include <vector>
#include <chrono>
#include <cmath>
#include <cstdlib>
#include <ctime>
using namespace std;
class CANMessage {
    int id;
    int Timestamp;
public:
    CANMessage() : id(0), Timestamp(0) {};
    virtual void read(int *data, int length) {
        id = data[0];
        Timestamp = data[1];
    };
};
class ThrottleMessage : public CANMessage{
    int throttle;
    int difference_check;
    vector<bool> flags;
public:
    ThrottleMessage() : CANMessage(), throttle(0), difference_check(0) {};
    void read(int *data, int length) {
        CANMessage::read(data, length);
        difference_check = data[2];
        throttle = (data[3] & 0x7F) << 8 | data[4];
        int flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
        flags.push_back((flag&0x0000)==0x0000);
        flags.push_back((flag&0x0001)==0x0001);
        flags.push_back((flag&0x0002)==0x0002);
        flags.push_back((flag&0x0004)==0x0004);
        flags.push_back((flag&0x0008)==0x0008);
        flags.push_back((flag&0x0010)==0x0010);
        flags.push_back((flag&0x0020)==0x0020);
        flags.push_back((flag&0x0040)==0x0040);
    };
};
class DashMessage : public CANMessage {
    int state;
public:
    DashMessage() : CANMessage(), state(0) {};
    void read(int *data, int length) {
        CANMessage::read(data, length);
        state = data[2];
    };
};
class PackMessage : public CANMessage {
    int carName;
    int SOC;
    vector<bool> flags;  
public:
    PackMessage() : CANMessage(), carName(0), SOC(0) {};
    void read(int *data, int length) {
        CANMessage::read(data, length);
        carName = data[2];
        SOC = data[3];
        int flag = data[4] << 8 | data[5];
        flags.push_back((flag&0x0000)==0x0000);
        flags.push_back((flag&0x0001)==0x0001);
        flags.push_back((flag&0x0002)==0x0002);
        flags.push_back((flag&0x0004)==0x0004);
        flags.push_back((flag&0x0008)==0x0008);
        flags.push_back((flag&0x0010)==0x0010);
        flags.push_back((flag&0x0020)==0x0020);
        flags.push_back((flag&0x0040)==0x0040);
        flags.push_back((flag&0x0080)==0x0080);
        flags.push_back((flag&0x0100)==0x0100);
        flags.push_back((flag&0x0200)==0x0200);
        flags.push_back((flag&0x0400)==0x0400);
        flags.push_back((flag&0x0800)==0x0800);
        flags.push_back((flag&0x1000)==0x1000);
        flags.push_back((flag&0x1000)==0x2000);
        flags.push_back((flag&0x1000)==0x4000);
        flags.push_back((flag&0x1000)==0x8000);
    };
};
class VoltageMessage : public CANMessage {
    int min_voltage;
    int max_voltage;
    int pack_voltage;
public:
    VoltageMessage() : CANMessage(), min_voltage(0), max_voltage(0), pack_voltage(0) {};
    void read(int *data, int length) {
        CANMessage::read(data, length);
        min_voltage = (data[2] << 8) | data[3];
        max_voltage = (data[4] << 8) | data[5];
        pack_voltage = (data[6] << 24) | (data[7] << 16) | (data[8] << 8) | data[9];
    }
};
class TemperatureMessage : public CANMessage {
    vector<int> temp_array;
    int highest;
    int pack_max_temp;
public:
    TemperatureMessage() : CANMessage(), highest(0), pack_max_temp(0) {};
    void read(int *data, int length){
        CANMessage::read(data, length);
        for(int i=2; i<length-2;i++){
            temp_array.push_back(data[i]);
        }
        highest = data[8];
        pack_max_temp = data[9];
    };
};
class BrakeMessage : public CANMessage {
    int difference_check;
    int brake;
    vector<bool> flags;
public:
    BrakeMessage() : CANMessage(), brake(0), difference_check(0) {};
    void read(int *data, int length) {
        CANMessage::read(data, length);
        difference_check = data[2];
        brake = (data[3] & 0x7F) << 8 | data[4];
        int flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
        flags.push_back(flag&0x0000==0x0000);
        flags.push_back(flag&0x0001==0x0001);
        flags.push_back(flag&0x0002==0x0002);
        flags.push_back(flag&0x0004==0x0004);
        flags.push_back(flag&0x0008==0x0008);
        flags.push_back(flag&0x0010==0x0010);
        flags.push_back(flag&0x0020==0x0020);
        flags.push_back(flag&0x0040==0x0040);
    }
};
CANMessage* chooseParser(int *data, int length) {
    CANMessage *out;
    switch(data[0]) {
        case 1574:
            out = new DashMessage();
            out->read(data, length);
            break;
        case 513:
            out = new BrakeMessage();
            out->read(data, length);
            break;
        case 512:
            out = new BrakeMessage();
            out->read(data, length);
            break;
        case 1160:
            out = new TemperatureMessage();
            out->read(data, length);
            break;
        case 392:
            out = new PackMessage();
            out->read(data, length);
            break;
        case 904:
            out = new VoltageMessage();
            out->read(data, length);
            break;
    }
    return out;
}
CANMessage* parse(int *data, int length) {
    if(data && length > 0){
        return chooseParser(data, length);
    }
    else return NULL;
}
int main() {
    int can[] = {
        0x200,
        0x201,
        1574,
        392,
        1160,
        904
    };
    int array[] = {
        200,
        0, // timestamp
        20,
        20,
        20,
        20,
        20,
        20,
        20,
        20
    };
    auto start = chrono::high_resolution_clock::now();
    srand(time(NULL));
    for(int i = 0; i < 100000; i++) {
        array[0] = can[(int)floor(rand() % 6)];
        CANMessage *message = parse(array, 10);
        delete message;
    }
    auto end = chrono::high_resolution_clock::now();
    chrono::duration<double, milli> ms = end - start;
    cout << "time taken: " << ms.count() << endl;
    cout << "average frame time: " << ms.count() / 100000.0 << endl;
    cout << "average frame rate: " << 1000 / (ms.count() / 100000.0) << endl;
}