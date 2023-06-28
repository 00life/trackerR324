import { funcAuth_getUID, funcAuth_loadData } from "./Functions_Auth";
import beepGo from '../sounds/beep-07a.mp3';
import beepStop from '../sounds/beep-10.mp3';
import beepBack from '../sounds/beep-08b.mp3';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { func_snackbar } from "./Functions_1";


export function func2_autoLoadOnlinePersons(persons, setPersons, authstatus, configuration){
    try{

        // Guard-Clause if the toggle is turned off (NOTE: true/false is backwards)
        if(!configuration.onlineLoadParticipant)return // Guard-Clause
        
        let authuid = funcAuth_getUID(authstatus) ?? '';
        if(authuid === '')return // Guard-Clause
                
        // Load the data from firebase
        let callback = data =>{
            if(data === '' || data === undefined || data === null)return // Guard-Clause
            setPersons([...persons, ...data]);
        } ;; // Callback Host
        funcAuth_loadData(`/users/${authuid}/participants`, callback);
        
    }catch(err){console.log('func2_autoLoadPersons: ' + err)}
};

export async function func2_autoLoadFilePerson(persons, setPersons, configuration){ 
    try{
        
        if(configuration.participantsWin){

            try{ // Electron-Based Apps
                let systemPersons = JSON.parse(await window?.api?.part);
                setPersons(systemPersons);
            }catch{}; 
            
            try{ // Web-Based Apps
                let promise1 = await fetch("http://127.0.0.1:3001/partWin");
                let promise2 = await promise1.text();
                let promise3 = await JSON.parse(promise2);
                setPersons(promise3);
            }catch{}
            
        }else if(configuration.participantsLin){

            try{ // Electron-Based Apps
                let systemPersons = JSON.parse(await window?.api?.part);
                setPersons(systemPersons);
            }catch{}

            try{ //  Web-Based Apps
                let promise1 = await fetch("http://127.0.0.1:3001/partLin");
                let promise2 = await promise1.text();
                let promise3 = await JSON.parse(promise2);
                setPersons(promise3);
            }catch{}
            
        } else if (configuration.participantsPhone){
            
            let ATTEMPTS = 10;

            for(let i=0; i < ATTEMPTS; i++){

                try{ // Phone-Based Apps

                    let contents = await Filesystem.readFile({
                        path: 'participants.txt',
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8,
                    });
                    setTimeout(()=>{setPersons(JSON.parse(contents))},1000);
                    
                    if(persons.length > 0)break;
                    
                }catch{}

            };
            
        };

    }catch(err){console.log('func2_autoLoadFilePerson: ' + err)}

};

export async function func2_autoLoadRecords(setRecords, configuration){

    if(configuration.recordWin){
        try{ // Web-Based Apps
            let promise1 = await fetch("http://127.0.0.1:3001/recordWin");
            let promise2 = await promise1.text();
            let promise3 = await JSON.parse(promise2);
            setRecords(promise3)
        }catch{ // Computer-Based Apps
            setRecords(window.api.recordWin);
        };

    }else if(configuration.recordLin){
        try{ // Web-Based Apps
            let promise1 = await fetch("http://127.0.0.1:3001/recordLin");
            let promise2 = await promise1.text();
            let promise3 = await JSON.parse(promise2);
            setRecords(promise3)
        }catch{ // Computer-Based Apps
            setRecords(window.api.recordLin);
        };
    }; 
};

export function func2_toDataURL(src, callback){
    try{
        var image = new Image();
        image.crossOrigin = 'Anonymous';
        image.onload = function(){
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        context.drawImage(this, 0, 0);
        var dataURL = canvas.toDataURL('image/jpeg');
        callback(dataURL);
        };
        image.src = src;
    }catch(err){console.log('func2_toDataURL: ' + err)};
};

export function func2_stringDateName(){
    try{
        let date = new Date();
        let year = date.getFullYear();
        let month = ('0'+String(parseInt(date.getMonth())+1)).slice(-2);
        let day = ('0'+date.getDate()).slice(-2);
        let time = date.toLocaleString('en-US', {hour12: false});
        let hours = time.slice(-8,-6);
        let minutes = time.slice(-5,-3);
        let seconds = time.slice(-2,);
        return `${year}.${month}.${day}_${hours}.${minutes}.${seconds}`;
    }catch(err){console.log('func2_stringDateName: ' + err)};
};

export async function func2_playAudio(type){
    try{
    // Default Beep
        
        let audioType = beepGo;

        if(type==='go'){
            audioType = beepGo;
        }else if(type==='stop'){
            audioType = beepStop;
        }else if(type==='back'){
            audioType = beepBack
        };

        const audio = new Audio(audioType);
        await audio.play();
    }catch(err){console.log('func2_playAudio: '+err)}
};

export function func2_visualEffect(reference,id='rateLimitVisual',color='palegreen'){
    try{
        reference.current.querySelector('#'+id).style.display = 'block';
        reference.current.querySelector('#'+id).style.backgroundColor = color;
        setTimeout(()=>{
            reference.current.querySelector('#'+id).style.display = 'none';
            reference.current.querySelector('#'+id).style.backgroundColor = '';
        },250)
    }catch(err){console.log('func2_visualEffect: ' + err)}
};
