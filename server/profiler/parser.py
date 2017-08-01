import datetime
import random
import math
def parse(input):
    def parseDashStatus(out,data):
        out['state'] = data[2]
    def parsePackStatus(out,data):
        out['carName'] = data[2]
        out['SOC'] = data[3]
        flag = data[4] << 8 | data[5]
        out['flag'] = []
        out['flag'].append((flag&0x0000)==0x0000)
        out['flag'].append((flag&0x0001)==0x0001)
        out['flag'].append((flag&0x0002)==0x0002)
        out['flag'].append((flag&0x0004)==0x0004)
        out['flag'].append((flag&0x0008)==0x0008)
        out['flag'].append((flag&0x0010)==0x0010)
        out['flag'].append((flag&0x0020)==0x0020)
        out['flag'].append((flag&0x0040)==0x0040)
        out['flag'].append((flag&0x0080)==0x0080)
        out['flag'].append((flag&0x0100)==0x0100)
        out['flag'].append((flag&0x0200)==0x0200)
        out['flag'].append((flag&0x0400)==0x0400)
        out['flag'].append((flag&0x0800)==0x0800)
        out['flag'].append((flag&0x1000)==0x1000)
        out['flag'].append((flag&0x1000)==0x2000)
        out['flag'].append((flag&0x1000)==0x4000)
        out['flag'].append((flag&0x1000)==0x8000)
    def parseVoltageData(out,data):
        out['min_voltage'] = (data[2] << 8) | data[3]
        out['max_voltage'] = (data[4] << 8) | data[5]
        out['pack_voltage'] = (data[6] << 24) | (data[7] << 16) | (data[8] << 8) | data[9]
    def parseTemperature(out,data):
        out['temp_array'] = []
        for i in range(len(data)-2):
            out['temp_array'].append(data[i])
        out['highest'] = data[8]
        out['pack_max_temp'] = data[9]
    def parseThrottle(out,data):
        out['difference_check'] = data[2]
        out['throttle'] = (data[3] & 0x7F) << 8 | data[4]
        flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9]
        out['flag'] = []
        out['flag'].append((flag&0x0000)==0x0000)
        out['flag'].append((flag&0x0001)==0x0001)
        out['flag'].append((flag&0x0002)==0x0002)
        out['flag'].append((flag&0x0004)==0x0004)
        out['flag'].append((flag&0x0008)==0x0008)
        out['flag'].append((flag&0x0010)==0x0010)
        out['flag'].append((flag&0x0020)==0x0020)
        out['flag'].append((flag&0x0040)==0x0040)
    def parseBrake(out,data):
        out['difference_check'] = data[2]
        out['brake'] = (data[3] & 0x7F) << 8 | data[4]
        flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9]
        out['flag'] = []
        out['flag'].append(flag&0x0000==0x0000)
        out['flag'].append(flag&0x0001==0x0001)
        out['flag'].append(flag&0x0002==0x0002)
        out['flag'].append(flag&0x0004==0x0004)
        out['flag'].append(flag&0x0008==0x0008)
        out['flag'].append(flag&0x0010==0x0010)
        out['flag'].append(flag&0x0020==0x0020)
        out['flag'].append(flag&0x0040==0x0040)
    def chooseParser(out,data):
        if data[0] == 1574:
            parseDashStatus(out,data)
        if data[0] == 513:
            parseBrake(out,data)
        if data[0] == 512:
            parseThrottle(out,data)
        if data[0] == 1160:
            parseTemperature(out,data)
        if data[0] == 392:
            parsePackStatus(out,data)
        if data[0] == 904:
            parseVoltageData(out,data)
    if input and len(input) > 0:
        out = {}
        out['CAN_Id'] = input[0]
        out['Timestamp'] = input[1]
        chooseParser(out,input)   
        return out
    else:
        return ""
start = datetime.datetime.now()
can = [0x200, 0x201, 0x488, 0x626, 392, 904]
array = [
    200,
    0,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20
]
for i in range(100000):
    array[0] = can[int(math.floor(random.random() * len(can)))]
    array[1] = datetime.datetime.now().microsecond
    parse(array)
total = datetime.datetime.now() - start
diff = (total.microseconds + total.seconds * 1000000) / 1000.0
print 'time taken: ' + str(diff)
print 'average frame time: ' + str(diff / 100000.0)
print 'average frame rate: ' + str(1000.0 / (diff / 100000.0))