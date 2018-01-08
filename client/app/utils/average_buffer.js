export class AverageBuffer {
  constructor(ms, keys, callback) {
    this.ms = ms;
    this.buffer = [];
    this.callback = callback;
    this.keys = keys;
  }
  getKeys() {
    return this.keys;
  }
  stop(){
    this.buffer.length = 0;
  }
  begin(){

  }
  aggregate(){
    if(this.buffer.length > 0) {
      var out = new Object();
    /*let seconds = Math.floor(point.Timestamp / (1000) % 60);
            let minutes = Math.floor(point.Timestamp / (1000 * 60) % 60);
            out.Timestamp = `${minutes}.${seconds}`;*/
      out.Timestamp = this.start;
      out.CAN_Id = this.buffer[0].CAN_Id;
      var self = this;
      this.keys.forEach(function (key) {
        if (self.buffer[0][key] instanceof Array) {
          var sums = [];
          for (let i = 0; i < self.buffer[0][key].length; i++) {
            sums.push(0);
            self.buffer.forEach(function (value) {
              if (value[key]) sums[i] += value[key][i];
            });
          }
          for (let i = 0; i < sums.length; i++) {
            sums[i] = sums[i] / self.buffer.length;
          }
          out[key] = sums;
        }
        else {
          out[key] = 0;
          self.buffer.forEach(function (value) {
            if (value[key]) out[key] += value[key];
          });
          if (self.buffer.length > 0) out[key] /= self.buffer.length;
        }
      });
      return out;
    }
  }
  push(point) {
    var self = this;
    if (point instanceof Object) {
      //console.log(point);
      //console.log(this.start);
      if (!this.start) {
        this.start = point.Timestamp;
      }
      //console.log(point.Timestamp - this.start < this.ms);
      this.buffer.push(point);
        //console.log(this.buffer);
      if(Math.abs(point.Timestamp - this.start) > this.ms) {
        try{
          var value = this.aggregate();
          this.start = undefined;
          this.buffer.length = 0;
          this.callback(value);
        }
        catch(e){
          console.error(e);
        }
        finally{
          this.start = undefined;
          this.buffer.length = 0;
        }
      }
    }
  }
}



export default AverageBuffer;
