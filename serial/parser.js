function parse(data){
    if(data&&data.length>0){
        data = JSON.parse(data);
        data.Timestamp = data[1];
        switch(data[0]){
            case 1574:
                parseDashStatus(data);
                break;
        }
    return data;
    }
    else return "";
}
function parseDashStatus(data){
    data.CAN_Id = data[0];
    data.State = data[2];
    for(var i=0;i<=8;i++)
        delete data[i];
}
module.exports = parse;