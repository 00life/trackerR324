const {contextBridge} = require('electron');
const fs = require('fs');
var os = require('os');

const returnParticipants = () =>{

    if(fs.existsSync('C:/trackerR324/autoconfig.txt')){
        let config = JSON.parse(fs.readFileSync('C:/trackerR324/autoconfig.txt',{encoding:'utf8'}));
        if(config.participantsWin && fs.existsSync('C:/trackerR324/participants.txt')){
            return fs.readFileSync('C:/trackerR324/participants.txt',{encoding:'utf8'})
        };
    }else if(fs.existsSync('/home/trackerR324/autoconfig.txt')){
        let config = JSON.parse(fs.readFileSync('/home/trackerR324/participants.txt',{encoding:'utf8'}));
        if(config.participantsLin && fs.existsSync('/home/trackerR324/participants.txt')){
            return fs.readFileSync('/home/trackerR324/participants.txt',{encoding:'utf8'})
        };
    } 
};

const returnAutoConfigSettings = ()=>{

    if(fs.existsSync('C:/trackerR324/autoconfig.txt')){
        return JSON.parse(fs.readFileSync('C:/trackerR324/autoconfig.txt',{encoding:'utf8'}));
        
    }else if(fs.existsSync('/home/trackerR324/autoconfig.txt')){
        return JSON.parse(fs.readFileSync('/home/trackerR324/autoconfig.txt',{encoding:'utf8'}));
    };
};

const saveToComputer = (data) => {
    let osSystem = os.platform()

    if(osSystem.toLocaleLowerCase().match('win') !== null){
        fs.writeFileSync("C:/trackerR324/autoconfig.txt", data, {encoding: "utf8"});

    }else if(osSystem.toLocaleLowerCase().match('lin') !== null){
        fs.writeFileSync("/home/trackerR324/autoconfig.txt", data, {encoding: "utf8"});
    };
};

const returnRecords = () => {
    if(fs.existsSync('C:/trackerR324/RecordData.json')){
        return JSON.parse(fs.readFileSync('C:/trackerR324/RecordData.json',{encoding:'utf8'}));
    }else if(fs.existsSync('home/trackerR324/RecordData.json')){
        return JSON.parse(fs.readFileSync('home/trackerR324/RecordData.json',{encoding:'utf8'}));
    };

};

contextBridge.exposeInMainWorld('api', {
    lin:(msg)=>fs.appendFileSync('/home/trackerR324/log.txt', msg),
    win:(msg)=>fs.appendFileSync('C:/trackerR324/log.txt', msg),
    part: returnParticipants(),
    autoconfig: returnAutoConfigSettings(),
    saveAutoConfig: (data) => saveToComputer(data),
    recordWin: returnRecords(),
    recordLin: returnRecords(),
});