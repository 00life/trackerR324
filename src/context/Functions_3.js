import { funcAuth_loadData, funcAuth_setData, funcAuth_getUID } from "./Functions_Auth";

export async function func3_handleHashWatch(type, hash, authstatus){
    try{
        let authuid = funcAuth_getUID(authstatus) ?? '';
        if(authuid === '' || authuid === undefined)return; // Guard-Clause

        // Collecting persons to watch
        let promWatchPersons = await new Promise(resolve => {
            let callback1 = data1 =>{
                if(data1 === '' || data1 === undefined || data1 === null)return // Guard-Clause
                let dataVal = Object?.values(data1) ?? '';

                let watchPersons = [];
                dataVal.forEach(obj => (obj.hash === hash) && watchPersons.push(obj));
                resolve(watchPersons);
            };; //Callback Host
            funcAuth_loadData(`users/${authuid}/watch`, callback1);
        });

        promWatchPersons.forEach(watPerson=>{

            // Changing the Request from the Auth 
            let callback2 = data2 =>{
                if(data2 === '' || data2 === undefined || data2 === null)return // Guard-Clause
                let dataVal = Object?.values(data2) ?? '';
            
                let find = dataVal.find(reqPerson => reqPerson.timestamp === watPerson.timestamp) ?? '';
                if(find === '' || find === undefined || find === null)return // Guard-Clause
        
                if(type === 'arrive' && find.arriveTime === '~' && find.leaveTime === '~'){
                    funcAuth_setData(`users/${authuid}/requests/${find.key}/arriveTime`, func3_timeFormatAMPM(new Date()) );
                    return
                }else if(type === 'leave' && find.arriveTime !== '~' && find.leaveTime === '~'){
                    funcAuth_setData(`users/${authuid}/requests/${find.key}/leaveTime`, func3_timeFormatAMPM(new Date()) );
                    return
                };
            } ;; //Callback2 Host
            funcAuth_loadData(`users/${authuid}/requests`, callback2);

            // Changing the Request from the Sender
            let callback3 = data3 =>{
                if(data3 === '' || data3 === undefined || data3 === null){return} // Guard-Clause
                let dataVal = Object?.values(data3) ?? '';
                
                let find = dataVal.find(reqPerson => reqPerson.timestamp === watPerson.timestamp) ?? '';  
                if(find === '' || find === undefined || find === null){return} // Guard-Clause

                if(type === 'arrive' && find.arriveTime === '~' && find.leaveTime === '~'){
                    funcAuth_setData(`users/${watPerson.sender}/requests/${find.key}/arriveTime`, func3_timeFormatAMPM(new Date()) );
                    return
                }else if(type === 'leave' && find.arriveTime !== '~' && find.leaveTime === '~'){
                    funcAuth_setData(`users/${watPerson.sender}/requests/${find.key}/leaveTime`, func3_timeFormatAMPM(new Date()) );
                    return
                };
            } ;; //Callback2 Host
            funcAuth_loadData(`users/${watPerson.sender}/requests`, callback3);

        });

    }catch(err){console.log('func3_handleHashWatch2: ' + err)}
};

export async function func3_requestNotify(setRequestNotify, authstatus){  
    try{
        let authuid = funcAuth_getUID(authstatus) ?? '';
        if(authuid === '' || authuid === undefined)return false // Guard-Clause

        let requestArray = await new Promise(resolve=>{
            let callback = data => {
                if(data === '' || data === undefined || data === null)return; // Guard-Clause
                
                let dataVal = Object?.values(data) ?? '';
                resolve(dataVal);
            } ;; // Callback Host
            funcAuth_loadData(`users/${authuid}/requests`, callback);
        });

        // Collecting an array of 'true' values for 'obj.confirm = undefined' in the request array
        let unconfirmRequests = [];
        requestArray.forEach(obj=>{
            (obj.type === 'receive' && obj?.confirm === undefined) && unconfirmRequests.push(true);  
        });

        // If 'true' is present in the array setRequestNotify(true), else setRequestNotify(false)
        (unconfirmRequests.some(bool=>bool)) ? setRequestNotify(true) : setRequestNotify(false);

    }catch(err){console.log('func3_requestNotify: ' + err)};
};

export function func3_timeFormatAMPM(date){
// convert date object into 12:00PM format

    try{

        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes.toString().padStart(2, '0');
        let strTime = hours + ':' + minutes + ampm;
        return strTime;

    }catch(err){console.log('func3_timeFormatAMPM: ' + err)}
};

export function func3_dateFormat(date){
// Convert date object into yyyy/mm/dd formate
    try{

        let yyyy = date.getFullYear();
        let mm = date.getMonth() + 1; // Months start at 0!
        let dd = date.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        let formattedDate = yyyy + '/' + mm + '/' + dd;
        return formattedDate

    }catch(err){console.log('func3_dateFormat: ' + err)}
};

export function printRecordContent(divContent){
    var a = window.open('', '', 'height=500, width=500');
    a.document.write('<html><body >');
    a.document.write(divContent);
    a.document.write('</body></html>');
    a.document.close();
    a.print();
};