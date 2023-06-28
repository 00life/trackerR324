import { funcAuth_loadData, funcAuth_getUID } from './Functions_Auth';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export function funcAuto_localStorageAutoConfig(configuration, setConfiguration) {
    try {
        // Getting the localStorage data from 'autoconfig'
        let autoconfig = JSON?.parse(window?.localStorage?.getItem('autoconfig')) ?? '';

        if(autoconfig === '')return // Guard-Clause
        setConfiguration({...configuration, ...autoconfig}); 

    } catch (err) { console.log('funcAuto_localStorageAutoConfig: ' + err) }
};

export async function funcAuto_electronLoadAutoConfig(configuration, setConfiguration){
    try{
    
        let autoconfig = JSON?.parse(window?.localStorage?.getItem('autoconfig')) ?? '';
        if(autoconfig !== '')return // Guard-Clause

        try{
            let electronAutoConfig = JSON.parse(await window?.api?.autoconfig);
            setConfiguration({...configuration, ...electronAutoConfig});
        }catch{
            let electronAutoConfig = await window?.api?.autoconfig;
            setConfiguration({...configuration, ...electronAutoConfig});
        };
       

    }catch(err){console.log('funcAuto_electronLoadAutoConfig: ' + err)}
    
};

export async function funcAuto_capacitorLoadAutoConfig(configuration, setConfiguration){
    try{
        let agent = window.navigator.userAgent.toLocaleLowerCase()
        if(agent.match(/android/gi) === null || agent.match(/ios/gi) === null)return // Guard-Clause

        let autoconfig = JSON?.parse(window?.localStorage?.getItem('autoconfig')) ?? '';
        if(autoconfig !== '')return // Guard-Clause

        const phoneAutoConfig = await Filesystem.readFile({
            path: 'autoconfig.txt',
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });

        setConfiguration({...configuration, ...JSON.parse(phoneAutoConfig)});

    }catch(err){console.log('funcAuto_capacitorLoadAutoConfig: ' + err)}
};

export function funcAuto_cleanYesterdaysRequests(authstatus) {
    try {
        let authuid = funcAuth_getUID(authstatus) ?? '';
        if (authuid === '' || authuid === undefined)return // Guard-Clause

        // Load the data from firebase if data is not null
        let callback = data => {
            if(data === '' || data === undefined || data === null)return // Guard-Clause

            let date = new Date();
            let timestampOld = Object?.values(data)[0]?.timestamp ?? '';

            if (timestampOld === '' || timestampOld === null || timestampOld === undefined)return // Guard-Clause

            let formatTimestampOld = JSON.stringify(new Date(timestampOld).getDate()); // Online Date Timestamp
            let formatTodaysDate = JSON.stringify(date.getDate()); // Today's Date Timestamp

            // Checking if the recorded timestamp.day is the same as todays timestamp.day
            if ( formatTimestampOld !== formatTodaysDate ) {
                window.document.querySelector('#Layout_clearRequests').click();

                // Clicking background to close the menu dropdown after some time
                window.document.querySelector('#checkbox-link').checked 
                    && setTimeout(() => { window.document.querySelector('#backgroundLabel').click() }, 3000);
                return
            };
            
        } ;; // Callback2 Host
        funcAuth_loadData(`/users/${authuid}/requests`, callback);

    } catch (err) { console.log('funcAuto_cleanYesterdaysRequests: ' + err) }
};

export async function funcAuto_desktopAutosave(configuration, string_entry) {
    // Electron App: Autosave log entry onto the desktop computer
    try {
        if (!configuration?.logWin) {
            await window?.api?.win(string_entry)
        } else if (!configuration?.logLin) {
            await window?.api?.lin(string_entry)
        } else {
            return
        };
    } catch (err) { console.log('funcAuto_desktopAutosave: ' + err) };
};

export function funcAuto_profileLoadOnline(authstatus, setProfileData){
    try{

        if(!authstatus)return // Guard-Clause

        let authuid = funcAuth_getUID(authstatus) ?? '';
        if(authuid === '')return // Guard-Clause

        
        // Loading the data to setProfilData object
        let callback = data => {
            if(data === '' || data === undefined || data === null)return // Guard-Clause

            setProfileData({
                firstname: data?.firstname ? data?.firstname : 'First Name',
                lastname: data?.lastname ? data?.lastname : 'Last Name',
                displayName: authstatus?.displayName ? authstatus?.displayName: '',
                uid: authuid ? authuid : authstatus?.uid,
                email: data?.email ? data?.email : authstatus?.email,
                schedule: data?.schedule ? data?.schedule : [],
                contactList: data?.contactList ? data?.contactList : [],
                base64: data?.base64 ? data?.base64 : '',
            });

        };; // Callback Host
        funcAuth_loadData(`users/${authuid}/profile`, callback)

    }catch(err){console.log('funcAuto_profileLoadOnlin: ' + err)}   
}