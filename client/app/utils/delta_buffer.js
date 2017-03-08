export class DeltaBuffer {
  constructor(keys, callback) {
    this.lastPoints = [];
    this.callback = callback;
    this.keys = keys;
    this.delta = 0;
    this.keys.forEach(function (key) {
      this.push({time: NaN, point: NaN});
    }.bind(this.lastPoints));
  }

  stop() {
    if (this.refresh) clearInterval(this.refresh);
    this.buffer.length = 0;
  }

  getKeys() {
    return this.keys;
  }

  begin() {
    this.refresh = setInterval(function () {
      this.publishLast();
    }.bind(this), 1000);
  }

  push(point) {
    var self = this;
    //console.log(point);
    for (var i = 0; i < this.keys.length; i++) {
      if (point[this.keys[i]] instanceof Array)//handle flags
      {
        for (var j = 0; j < point[this.keys[i]].length; j++) {
          let currFlag = point[this.keys[i]][j];
          var diffData = false;
          if (currFlag != this.lastPoints[i].point[j]) {
            diffData = true;
            break;
          }
        }
        if (diffData) {
          let out = new Object();
          out.Timestamp = point.Timestamp;
          for(var j=1; j < point[this.keys[i]].length; j++){
            out[this.keys[i]+j] = point[this.keys[i]][j];
          }
          out.CAN_Id = point.CAN_Id;
          this.callback(out);
        }
      }
      else {
        if (this.lastPoints[i].point != point[this.keys[i]]) {
          //console.log("new point: " + point.CAN_Id);
          let out = new Object();
          out.Timestamp = point.Timestamp;
          out[this.keys[i]] = point[this.keys[i]];
          out.CAN_Id = point.CAN_Id;
          this.callback(out);
        }
      }
      this.lastPoints[i] = {time: point.Timestamp, CAN_Id: point.CAN_Id, point: point[this.keys[i]]};
    }

  }

  publishLast() {
    for (let i = 0; i < this.keys.length; i++) {
      let out = new Object();
      out.CAN_Id = this.lastPoints[i].CAN_Id;
      out.Timestamp = this.lastPoints[i].time;
      if(this.lastPoints[i].point instanceof Array){
        for(let j = 1; j < this.lastPoints[i].point.length; j++){
          if(this.lastPoints[i].point[j]) out[this.keys[i] + j] = j;
        }
      }
      else out[this.keys[i]] = this.lastPoints[i].point;
      console.log(out);
      this.callback(out);
    }
  }
}

export default DeltaBuffer;
