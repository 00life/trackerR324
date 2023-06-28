import React from "react";
import { funcAuth_setData, funcAuth_loadData, funcAuth_getUID, useAuthStatus } from "../context/Functions_Auth";
import { func3_timeFormatAMPM } from "../context/Functions_3";


function SentParticipant({firstname, lastname, timestamp, arriveTime, leaveTime, receiverName, dataConfirm}){
    const authstatus = useAuthStatus();
    const authuid = funcAuth_getUID(authstatus);

    const handleDeleteRequestEntry = () =>{
     
        let callback = data => {
            let dataVal = Object.values(data);
            // Get all object with the matching timestamp
            let filterArray = dataVal.filter(obj => obj.timestamp === timestamp);
            
            // Delete each matching object
            filterArray.forEach(obj => {
                funcAuth_setData(`/users/${authuid}/requests/${obj.key}`, {key: null});
            });
        } ;; // Callback Host
        funcAuth_loadData(`/users/${authuid}/requests`, callback);

        let callback2 = data2 =>{
            let dataVal = Object.values(data2);
            // Get all object with the matching timestamp
            let filterArray = dataVal.filter(obj2=>obj2.timestamp === timestamp);
            // Delete each matching object
            filterArray.forEach(obj2=>{
                funcAuth_setData(`/users/${authuid}/watch/${obj2.key}`, {key: null});
            });
        } ;; // Callback2 Host
        funcAuth_loadData(`/users/${authuid}/watch`, callback2);
    };

    const handleSentNote = async () => {
        let promRequestAuth = await new Promise(resolve=>{
            let callback = data => {
                let dataVal = Object.values(data);
                // Get all object with the matching timestamp
                let find = dataVal.find(obj => obj.timestamp === timestamp);
                resolve(find);
            } ;; // Callback Host
            funcAuth_loadData(`/users/${authuid}/requests`, callback);
        })

        let promRequestUser = await new Promise(resolve=>{
            let callback = data => {
                let dataVal = Object.values(data);
                // Get all object with the matching timestamp
                let find = dataVal.find(obj => obj.timestamp === timestamp);
                resolve(find);
            } ;; // Callback Host
            funcAuth_loadData(`/users/${promRequestAuth.destination}/requests`, callback);
        })

        const smalltalk = require('smalltalk'); // Electron app friendly prompt
        let ans = await new Promise(resolve=>{
            smalltalk
            .prompt('Note:', (promRequestAuth.note === undefined) ? 'None' : promRequestAuth.note)
            .then(value => resolve(value))
            .catch(()=>resolve(null))
        });
       
        let sendAns = (ans === null || ans.trim() === '') ? promRequestAuth.note : ans;
        funcAuth_setData(`/users/${authuid}/requests/${promRequestAuth.key}/note`, sendAns);
        funcAuth_setData(`/users/${promRequestAuth.destination}/requests/${promRequestUser.key}/note`, sendAns);
    };

    return(
        <div style={{border:'1px solid #8888', borderRadius:'5px', margin:'2px 0', padding:'5px 5px', display:'flex', alignItems:'center', flexWrap:'wrap'}}>

            {/* Type of Request and confirmation */}
            <span style={{border:'1px solid #8888', borderRadius:'5px', padding:'2px 5px', backgroundColor:(dataConfirm === undefined) ? 'var(--analogousBlue)': (dataConfirm) ? 'var(--tetradicGreen)' : 'var(--complimentRed)'}}>
                Sent 
                {(dataConfirm === undefined ) && <span>&#x10102;</span>}
                {(dataConfirm === true) && <span>&#x2611;</span>}
                {(dataConfirm === false) && <span>&#x2612;</span>}
            </span>

            <span>&nbsp;::&nbsp;</span>

            <span style={{border:'1px solid #8888', borderRadius:'5px', padding:'2px 5px', backgroundColor:'var(--complimentYellow)'}}>{receiverName.slice(0,15)}</span>
            
            <span>&nbsp;::&nbsp;</span>

            {/* Fistname and Lastname of Participant */}
            <span>{firstname}&nbsp;{lastname}</span>

            <span>&nbsp;::&nbsp;</span>

            {/* Time that the request was made */}
            <span>{func3_timeFormatAMPM(new Date(timestamp))}</span>

            <span>&nbsp;::&nbsp;</span>

            {/* Time that the Participant arrived */}
            <span style={{color:'darkred'}}>»&nbsp;{arriveTime}&nbsp; </span>

            {/* Time that the Participant left */}
            <span style={{color:'darkblue'}}>«&nbsp;{leaveTime}&nbsp; </span>

            <span>&nbsp;::&nbsp;</span>
            
            <svg onClick={()=>handleSentNote()} style={{cursor:'pointer'}} height="20" viewBox="0 96 960 960" width="20"><path d="M281 779h82l239-239-83-83-238 239v83Zm357-275 38-39q8-8 8-17t-8-17l-48-48q-8-8-17-8t-17 8l-39 39 83 82ZM226 962q-54.075 0-91.038-37.662Q98 886.675 98 834V326q0-54.075 36.962-91.037Q171.925 198 226 198h128q19-33 52-53t74-20q41 0 74 20t52 53h128q54.075 0 91.037 36.963Q862 271.925 862 326v508q0 52.675-36.963 90.338Q788.075 962 734 962H226Zm0-128h508V326H226v508Zm254-538q13.867 0 22.933-9.567Q512 276.867 512 264q0-13.867-9.067-22.933Q493.867 232 480 232q-13.867 0-22.933 9.067Q448 250.133 448 264q0 12.867 9.067 22.433Q466.133 296 480 296ZM226 834V326v508Z"/></svg>
            
            {/* Spacer to seperate items */}
            <div style={{flexGrow:1}}>&nbsp;</div>

            {/* Delete Request */}
            <span onClick={()=>handleDeleteRequestEntry()} style={{float:'right', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', cursor:'pointer'}}>
                <svg  height="24" width="24"><path d="M7.2 21.3q-1.05 0-1.75-.7t-.7-1.75V5.9h-1V3.75h5.2V2.675h6.15V3.75h5.2V5.9h-1v12.95q0 1.025-.713 1.737-.712.713-1.737.713Zm9.95-15.4H6.9v12.95q0 .125.088.212.087.088.212.088h9.65q.1 0 .2-.1t.1-.2ZM8.875 17.125h2.15v-9.2h-2.15Zm4.15 0h2.15v-9.2h-2.15ZM6.9 5.9V19.15v-.3Z"/></svg>
            </span>

        </div>
    );

};

export default SentParticipant