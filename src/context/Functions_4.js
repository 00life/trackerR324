import { func_snackbar } from "./Functions_1";
import { funcAuth_getUID, funcAuth_loadData, funcAuth_setData, funcAuth_updateData } from "./Functions_Auth";
import {func3_requestNotify} from "./Functions_3";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { App } from '@capacitor/app';

export async function func4_pageLock(configuration, setConfiguration, reference){
    try{

        const smalltalk = require('smalltalk'); // Electron app friendly prompt
        
        // Unlock the page
        if(configuration.pageLock){

            // Prompt the user for a password
            let ans = await new Promise(resolve=>{
            smalltalk
                .prompt('Page Lock Password:', '[Please Enter Password to Unlock]')
                .then(value => resolve(value ?? ''))
                .catch(()=>resolve(''))
            });

            // Success
            if(ans === configuration.pageLockPass){
                setConfiguration({...configuration, pageLock: false})
                func_snackbar(reference,'Page is Unlocked');
            
            // Failure
            }else{
                return 'locked'
            };
        
        // Lock the page
        }else{

            // Prompt the user for a password
            let ans = await new Promise(resolve=>{
                smalltalk
                .prompt('Page Lock Password:', '[Please Enter Password to Lock]')
                .then(value => resolve(value ?? ''))
                .catch(()=>resolve(''))
            });
            
            // Success
            if(ans === configuration.pageLockPass){
                func_snackbar(reference, 'Page is Locked');
                setConfiguration({...configuration, pageLock: true});
            }
        }
    }catch(err){console.log('func4_pageLock: ' + err)}
};

export function func4_loadDataOnline(path, callback, reference, authstatus){
    try{

        if(!authstatus){
            setTimeout(()=>func_snackbar(reference, 'Please sign-in to load from online'),0);
            return // Guard-Clause if the user is not online
        };

        let authuid = funcAuth_getUID(authstatus);

        // Returning the data via callback
        let callback2 = data => {
            if(data === '' || data === undefined || data === null)return // Guard-Clause
            
            callback(data)
        } ;; // Callback2 Host
        funcAuth_loadData(`users/${authuid}${path}`, callback2)

    }catch(err){console.log('func4_loadDataOnline: '+ err)}
};

export function func4_saveDataOnline(data, path, reference, authstatus){
    try{

        if(!authstatus){
            setTimeout(()=>func_snackbar(reference, 'Please sign-in to save online'),0);
            return // Guard-Clause if the user is not online
        };
        
        let authuid = funcAuth_getUID(authstatus);
        
        // Setting the data
        funcAuth_setData(`users/${authuid}${path}`, data);
        return true

    }catch(err){console.log('func4_saveDataOnline: ' + err)}
};

export async function func4_getRequestObjs(timestamp, sender, authstatus, setProcessObjs){
    try{

        let authuid = funcAuth_getUID(authstatus);

        // Getting the request object from your account
        let findRequestAuth = await new Promise(resolve=>{
            let callback = data =>{
                if(data === '' || data === undefined || data === null)return; // Guard-Clause

                let dataVal = Object?.values(data);
                let objFind = dataVal.find(obj=>obj.timestamp === timestamp ?? '');
                resolve(objFind);
            } ;; // Callback Host
            funcAuth_loadData(`users/${authuid}/requests`, callback);
        });

        // Getting the request object from the sender account
        let findRequestSender = await new Promise(resolve=>{
            let callback2 = data2 =>{
                if(data2 === '' || data2 === undefined || data2 === null)return; // Guard-Clause

                let dataVal = Object?.values(data2);
                let objFind = dataVal.find(obj=>obj.timestamp === timestamp) ?? '';
                resolve(objFind);
            } ;; // Callback2 Host
            funcAuth_loadData(`users/${sender}/requests`, callback2);
        });

        // Setting the useState to the request objects
        setProcessObjs({authObj: findRequestAuth, senderObj:findRequestSender})

    }catch(err){console.log('func4_getRequestObjs: ' + err)}
};

export async function func4_acceptAllRequests(authstatus, configuration, setRequestNotify){
    try{

        // Check LocalStorage for toggleAccept value
        let toggleAccept = JSON?.parse(window?.localStorage?.getItem('toggleAccept')) ?? '';
        
        // If LocalStorage fails, check configuration
        if(toggleAccept === '' || toggleAccept === undefined){toggleAccept = configuration.toggleAccept};
        
        if(toggleAccept === false)return; // Guard-Clause

        const authuid = funcAuth_getUID(authstatus);

        // Getting the request object from your account
        let requestAuthArray = await new Promise(resolve=>{
            let callback = data =>{
                if(data === '' || data === undefined || data === null)return; // Guard-Clause

                let dataVal = Object?.values(data) ?? '';
                resolve(dataVal);
            } ;; // Callback Host
            funcAuth_loadData(`users/${authuid}/requests`, callback);
        });

        requestAuthArray.forEach(obj=>{
            if(obj.type === 'receive' && (obj.confirm === undefined) && (obj.confirmSet === undefined && toggleAccept)){

                // Setting the requests objects with a new attribute for auth
                funcAuth_setData(`users/${authuid}/requests/${obj.key}`, {...obj, confirm: true, confirmSet: true});

                // Setting the request objects with a new attribute for the Sender
                let callback2 = data2 =>{
                    if(data2 === '' || data2 === undefined || data2 === null)return; // Guard-Clause

                    let dataVal2 = Object?.values(data2);
                    let findObj = dataVal2.find(obj2=>obj.timestamp === obj2.timestamp) ?? '';
                    (findObj !== '' && toggleAccept) && funcAuth_setData(`users/${obj.sender}/requests/${findObj.key}`, {...findObj, confirm: true, confirmSet: true});
                } ;; // Callback2 Host
                funcAuth_loadData(`users/${obj.sender}/requests`, callback2);

                // Get list of people on watchList Array
                let watchListArrayPromise = new Promise(resolve=>{
                    let callback3 = data3 => {
                        if(data3 === '' || data3 === undefined || data3 === null)return; // Guard-Clause

                        let dataVal = Object?.values(data3) ?? '';
                        resolve(dataVal)
                    } ;; // Callback Host
                funcAuth_loadData(`users/${authuid}/watch`, callback3);
                });

                // Populate the person object
                let person = {hash: obj.hash, firstname: obj.firstname, lastname: obj.lastname, email: obj.email, base64: obj.base64, schedule: obj.schedule, sender: obj.sender, timestamp: obj.timestamp};
                
                (async()=>{
                    //  See if the person is in the watchList
                    let promise = await watchListArrayPromise;
                    let find = promise.find(obj=>obj.timestamp === person.timestamp) ?? '';
                    
                    if(find === '' && toggleAccept){
                        funcAuth_updateData(`users/${authuid}/watch`, person);
                        func3_requestNotify(setRequestNotify, authstatus)
                    };
                })();
            };
        });

    }catch(err){console.log('func4_acceptAllRequests: ' + err)}
};

export async function func4_appendPhoneSave(configuration, data, reference){
    try{
     
        // Appending data in Documents
        if(configuration?.logPhone){
            await Filesystem.appendFile({
                path: 'log.txt',
                data: JSON.stringify(data),
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
                recursive: true
            });
            func_snackbar(reference, 'Saved to Documents') // Notification
        };
           
    }catch(err){console.log('func4_appendPhoneSave: ' + err)}
};

export function func4_phoneBackHandler(){
   try{
        
        App.addListener('backButton', () => {
            let ans = window.confirm('Exit Application?');
            ans && App.exitApp();
        }); 

    }catch(err){console.log('func4_phoneBackHandler: ' + err)}

};

