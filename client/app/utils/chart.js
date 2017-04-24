import c3 from 'c3'
import smoothie from 'smoothie'
import $ from 'jquery'
class C3Chart{
    constructor(chart) {
        this._chart = chart;
    }
    flow(object) {
        if(object.json instanceof Array) {
            for(let data of object.json){
                data.Timestamp = timeFormatter(data.Timestamp);
            }
        }
        else {
            object.json.Timestamp = timeFormatter(object.json.Timestamp);
        }
        this._chart.flow(object);
    }
    load(object){
        for(let data of object.json){
            data.Timestamp = timeFormatter(data.Timestamp);
        }
        this._chart.load(object);
    }
}
function timeFormatter(date){
    let seconds = Math.floor(date / (1000) % 60);
    let minutes = Math.floor(date / (1000 * 60) % 60);
    return `${minutes}.${seconds}`;
}
class Chart{
    constructor(canvas, conf){
        let config = conf;
        this._keys = config.data.keys;
        this._id = config.bindto;
        let isStep = config.data.type == 'step';
        if(!isStep) config.data.type = 'bezier';
        this._chart = new smoothie.SmoothieChart({
            timestampFormatter: timeFormatter,
            interpolation: config.data.type,
        });
        this._lines = new Map();
        for(let key of this._keys.value){
            var temp = new smoothie.TimeSeries();
            this._lines.set(key, temp);
            this._chart.addTimeSeries(temp);
        }
        this._chart.streamTo(canvas,1000);
    }
    flow(data){
        if(data.json){
            for(let key in data.json){
                if(key!="Timestamp" && key!="CAN_Id"){
                    let object = data.json;
                    this._lines.get(key).append(new Date().getTime(), object[key]);
                }
            }
        }
    }
}
module.exports = function (bindTo, dataJson, xKey, xValue, type, names, yTick, smoothie){
    if(smoothie){
        let canvas = document.createElement("canvas");
        canvas.style.height = "600px";
        canvas.height = 600;
        canvas.width = $(dataJson.bindto).innerWidth();
        canvas.style.width = "100%";
        $(dataJson.bindto).append(canvas);
        return new Chart(canvas, dataJson);
    }
    else{
        let config  = {
          bindto: bindTo,
          data: {
            json: dataJson,
            xFormat: '%M.%S',
            keys: {
              x: xKey,
              value: xValue
            },
            names: names || null,
            type: type || 'line'
          },
          line: {
            connectNull: true
          },
          axis: {
            y: yTick,
            x: {
              type: 'timeseries',
              tick: {
                format: '%M:%S'
              },
              culling:false,
            }
          },
          transition: {
            duration: 0
          },
          subchart: {
            show: true
          },
          size: {
            height: 600
          },
          tooltip:{
            show: true
          }
        };
        let chart = c3.generate(config);
        return new C3Chart(chart);
    }
}
