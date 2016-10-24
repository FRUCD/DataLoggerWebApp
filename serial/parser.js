function parse(data){
    if(data&&data.length>0){
        data = JSON.parse(data);
        switch(data.CAN_ID){
            case 1574:
                parseDashStatus(data);
                break;
        }
    return data;
    }
    else return "";
}
function parseDashStatus(data){
    data.PDO_Description = "TPDO1 Dash Status";
    switch(data.bit1){
        case 0:
            data.State = "Startup";
            break;
        case 1:
            data.State = "LV";
            break;
        case 2:
            data.State = "Precharging";
            break;
        case 3:
            data.State = "HV_Enabled";
            break;
        case 4:
            data.State = "Drive";
            break;
        case 5:
            data.State = "Fault";
            break;
    }
    for(var i=1;i<=8;i++)
        delete data['bit'+i];
}
module.exports = parse;