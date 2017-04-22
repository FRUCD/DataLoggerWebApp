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
    this.lastPoints.length = 0;
  }

  getKeys() {
    if(this.lastPoints[0].point instanceof Array){
      var array = [];
      for(var i=1; i < this.lastPoints[0].point.length; i++){
        array.push(this.keys[0] + i);
      }
      return array;  
    }
    return this.keys;
  }

  begin() {
    if(!this.refresh) this.refresh = setInterval(function () {
      this.publishLast();
    }.bind(this), 1000);
  }

  push(point) {
    var self = this;
    //console.log(point);
    for (var i = 0; i < this.keys.length; i++) {
      if (point[this.keys[i]] instanceof Array)//handle flags
      {
        var diffData = false || (this.keys[i] == "flag");
        for (var j = 0; j < point[this.keys[i]].length && !diffData; j++) {
          let currFlag = point[this.keys[i]][j];
          if (currFlag != this.lastPoints[i].point[j]) {
            diffData = true;
            break;
          }
        }
        if (diffData) {
          let out = new Object();
          /*let seconds = Math.floor(point.Timestamp / (1000) % 60);
          let minutes = Math.floor(point.Timestamp / (1000 * 60) % 60);
          out.Timestamp = `${minutes}.${seconds}`;*/
          out.Timestamp = point.Timestamp;
          out.CAN_Id = point.CAN_Id + this.keys[i];
          for(var j=1; j < point[this.keys[i]].length; j++){
            if(point[this.keys[i]][j]) out[this.keys[i]+j] = j;
          }
          this.callback(out);
        }
      }
      else {
          if(this.lastPoints[i].point != point[this.keys[i]] || this.keys[i] == "state") {
          //console.log("new point: " + point.CAN_Id);
            let out = new Object();
            /*let seconds = Math.floor(point.Timestamp / (1000) % 60);
            let minutes = Math.floor(point.Timestamp / (1000 * 60) % 60);
            out.Timestamp = `${minutes}.${seconds}`;*/
            out.Timestamp = point.Timestamp;
            out[this.keys[i]] = point[this.keys[i]];
            out.CAN_Id = point.CAN_Id;
            this.callback(out);
          }
      }
      this.lastPoints[i] = {time: point.Timestamp, CAN_Id: point.CAN_Id, point: point[this.keys[i]]};
    }

  }
  aggregate(){
    var array = [];
    for(let i = 0; i < this.keys.length; i++) {
      if(this.lastPoints[i].point instanceof Array){
        //console.log(this.lastPoints[i].point);
        let out = new Object();
        /*let seconds = Math.floor(point.Timestamp / (1000) % 60);
          let minutes = Math.floor(point.Timestamp / (1000 * 60) % 60);
          out.Timestamp = `${minutes}.${seconds}`;*/
        out.Timestamp = this.lastPoints[i].time;
        out.CAN_Id = this.lastPoints[i].CAN_Id + this.keys[i];
        for(let j = 1; j < this.lastPoints[i].point.length; j++){
          if(this.lastPoints[i].point[j]) out[this.keys[i] + j] = j;
        }
        array.push(out);
      }
      else {
        let out = new Object();
        /*let seconds = Math.floor(point.Timestamp / (1000) % 60);
          let minutes = Math.floor(point.Timestamp / (1000 * 60) % 60);
          out.Timestamp = `${minutes}.${seconds}`;*/
        out.Timestamp = this.lastPoints[i].time;
        out.CAN_Id = this.lastPoints[i].CAN_Id;
        out[this.keys[i]] = this.lastPoints[i].point;
        array.push(out);
      }
    }
    return array;
  }
  publishLast() {
    this.aggregate().forEach(function(value){
      this.callback(value);
    }.bind(this));
  }
}
export default DeltaBuffer;
