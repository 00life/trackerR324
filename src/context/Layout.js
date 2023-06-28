import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { func_loaddata, func_savedata, func1_saveLogCSV } from './Functions_1';
import { func2_stringDateName } from './Functions_2';
import { funcAuth_setData, funcAuth_updateData, funcAuth_getUID } from "../context/Functions_Auth";
import { func4_pageLock } from './Functions_4';
import Copyright from '../components/Copyright';
import './Snackbar.css';
import './Dropdown.css';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


function Layout({children}) {
    const {func_logout, func_snackbar, logArray, setLogArray, configuration, setConfiguration, requestNotify, authstatus, setOutPeople, setBackPeople, reference, setPersons} = useAuth();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState('');
    const [svgColor, setSvgColor] = useState('');

    const handleButtonEvent = e => {
    // Visit the pages indicated in e.datatset page
        try{
            if(configuration.pageLock)return // Guard-Clause

            let current = reference.current.querySelectorAll('data')[0].value
            let last = sessionStorage.getItem('lastpage');
            let destination = e.currentTarget.dataset.dest;
            
            last !== current && sessionStorage.setItem('lastpage',current);
            navigate(destination);
        }catch(err){console.log('handleButtonEvent:'+ err)} 
    };

    const handleCheckboxMenu = e => {
    // If checkbox-link is checked, apply the styles

        if(e.currentTarget.checked){
            setSvgColor('var(--selectBlue)');
            reference.current.querySelector("#backgroundLabel").style.display = 'block';
        }else{
            setSvgColor('');
            reference.current.querySelector("#backgroundLabel").style.display = 'none';
        };
    };

    const handleSaveLogJSON = () => {
    // Save Log in JSON format

        let saveName = `log_${func2_stringDateName()}.json`;
        func_savedata(logArray, saveName, '/logs', reference);

        reference.current.querySelector('#backgroundLabel').click(); // Close Menu
        setSvgColor('');
    };

    const handleSaveLogCVS = () => {
    // Save Log in CSV format
        let saveName = `log_${func2_stringDateName()}.csv`;
        func1_saveLogCSV(logArray, saveName, reference)
        reference.current.querySelector('#backgroundLabel').click(); // Close Menu
        setSvgColor('');
    };

    const handleLoadLog = () => {
    // Load Log from JSON format

        if(configuration.pageLock)return // Guard-Clause lockpage

        let callback = data => setLogArray(data);
        func_loaddata('/logs', callback, reference);
        reference.current.querySelector('#checkbox-link').checked = false;
        setSvgColor('');
    };

    const handleLastPage = e =>{
    // Load the last page visited

        if(configuration.pageLock)return // Guard-Clause lockpage

        e.currentTarget.setAttribute('fill','blue');
        setTimeout(()=>{reference.current.querySelector('#lastpage').setAttribute('fill','')},200);
        setTimeout(()=>{navigate(sessionStorage.getItem('lastpage'))},200);
    };

    const handleClearLogs = () => {
    // Clear the Log from the screen

        if(configuration.pageLock)return  // Guard-Clause lockpage

        setLogArray([]);
        setOutPeople([]);
        setBackPeople([]);
        func_snackbar(reference,'Logs Cleared'); // Notification

        reference.current.querySelector('#checkbox-link').click(); // Close Menu
    };

    const handleClearRequests = () => {

        if(configuration.pageLock)return // Guard-Clause lockpage

        let authuid = funcAuth_getUID(authstatus);
        let timestamp = new Date().getTime();

        // Clear firebase request
        funcAuth_setData(`/users/${authuid}/requests`, '');
        funcAuth_updateData(`/users/${authuid}/requests`, {timestamp: timestamp});
        
        // Clear firebase watch
        funcAuth_setData(`/users/${authuid}/watch`, '');
        funcAuth_updateData(`/users/${authuid}/watch`, {timestamp: timestamp});
        
        func_snackbar(reference,'Requests Cleared'); // Notification

        reference.current.querySelector('#checkbox-link').click(); // Close Menu
    };
    
    const handleTest = async () => {
        window.alert('test')
        let contents = await Filesystem.readFile({
            path: 'participants.txt',
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        window.alert(JSON.parse(contents));
        setPersons(JSON.parse(contents));
    };

    useEffect(()=>{
        try{setCurrentPage(reference?.current?.querySelectorAll('data')[0].value)}catch{};
    },[currentPage, reference])

  return (
    <div ref={reference} style={{backgroundColor:'var(--main-backgroundColor)', height:'100vh', display:'flex', flexDirection:'column'}}>
        <label id="backgroundLabel" htmlFor='checkbox-link' style={{display:'none',position:'absolute',backgroundColor:'transparent', width:'100%', height:'100%', zIndex:1}}></label>
        <nav style={{display:'flex', border:'2px solid grey', backgroundImage: 'linear-gradient(to bottom, cornsilk, white)', marginBottom:"3px", borderRadius:"5px", boxShadow:"var(--main-boxShadow)"}}>
            <table style={{width:'100%'}}>
                <tbody>
                    <tr>
                        <td style={{width:'100%', display:'flex', alignItems:'center'}}>
                            
                            {/* App Logo Image */}
                            <img src={require("./../images/logo.png")} alt="logo" height="50px" width="max-width" //onClick={()=>navigate('/R324Tracker')}
                                onClick={()=>{handleTest()}} style={{filter:'drop-shadow(2px 2px 0px black)'}}/>
                            
                            {/* Online-Offline Status Bubble */}
                            <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} id="indicator-online" width="24px" height="24px" viewBox="0 0 24 24" fill={!authstatus?"none":"var(--tetradicGreen)"} >
                                <path opacity="0.15" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" fill="#001A72"/>
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="black" strokeWidth="1.5"/>
                            </svg>

                        </td>
                        <td style={{width:"90px"}}>
                            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>

                                {/* Last Page Button */}
                                <svg id='lastpage' onClick={e=>handleLastPage(e)} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--monochromaticWhite)'} onMouseOut={e=>e.currentTarget.style.backgroundColor=''}
                                    style={{filter:'drop-shadow(2px 2px 1px #8888)', boxShadow:"var(--main-boxShadow)", float:"right", borderRadius:"5px", cursor:'pointer'}} height="40" width="40"><path d="M27.208 37.833 9.333 20 27.208 2.167l3.667 3.708L16.75 20l14.125 14.125Z"/></svg>
                                
                                {/* Account Profile Button */}
                                <svg id="profile" onClick={()=>{if(configuration.pageLock){return};navigate('/profile')}} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--monochromaticWhite)'} onMouseOut={e=>e.currentTarget.style.backgroundColor=''}
                                    style={{filter:'drop-shadow(2px 2px 1px #8888)', boxShadow:"var(--main-boxShadow)", float:"right", margin:"0px 10px", borderRadius:"5px", cursor:'pointer'}} fill={currentPage==='/profile'?'var(--selectBlue)':''} height="40" width="40"><path d="M9.583 28.542q2.417-1.584 4.979-2.396 2.563-.813 5.438-.813 2.875 0 5.521.855 2.646.854 4.937 2.354 1.584-2.125 2.292-4.146.708-2.021.708-4.396 0-5.667-3.896-9.562Q25.667 6.542 20 6.542t-9.562 3.896Q6.542 14.333 6.542 20q0 2.417.687 4.417.688 2 2.354 4.125ZM20 21.75q-2.542 0-4.312-1.75-1.771-1.75-1.771-4.292 0-2.541 1.771-4.312Q17.458 9.625 20 9.625q2.542 0 4.312 1.771 1.771 1.771 1.771 4.312 0 2.542-1.771 4.292-1.77 1.75-4.312 1.75Zm0 16.125q-3.667 0-6.938-1.396-3.27-1.396-5.729-3.854-2.458-2.458-3.833-5.687Q2.125 23.708 2.125 20q0-3.708 1.396-6.958t3.854-5.688Q9.833 4.917 13.062 3.5q3.23-1.417 6.98-1.417 3.666 0 6.916 1.417 3.25 1.417 5.688 3.854 2.437 2.438 3.854 5.688 1.417 3.25 1.417 6.958T36.5 26.938q-1.417 3.229-3.854 5.687-2.438 2.458-5.688 3.854-3.25 1.396-6.958 1.396Z"/></svg>
                                
                                {/* Dropdown Menu */}
                                <div className="dropdown" onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--monochromaticWhite)'} onMouseOut={e=>e.currentTarget.style.backgroundColor=''}
                                    style={{position:'relative'}}>
                                    
                                    {/* Menu Button */}
                                    <label htmlFor='checkbox-link'><svg style={{filter:'drop-shadow(2px 2px 1px #8888)', boxShadow:"var(--main-boxShadow)", float:"right", borderRadius:"5px", cursor:'pointer'}} height="40" width="40" stroke={svgColor} fill={svgColor}><path d="M4.167 31.333v-4.416h31.666v4.416Zm0-9.125v-4.416h31.666v4.416Zm0-9.125V8.625h31.666v4.458Z"/></svg></label>
                                    <input id="checkbox-link" type='checkbox' onChange={e=>handleCheckboxMenu(e)} style={{display:'none'}}/>
                                
                                    {/* Dropdown Buttons */}
                                    <div className='dropdown-menu' style={{position:'absolute', borderRadius:'5px', padding:'2px', top:'130%', right:0, boxShadow:'0px 2px 5px 0px #8888', backgroundColor:'white',width:'4rem', zIndex:1}}>
                                        
                                        {/* Dropdown Button to navigate to Auto Config Settins */}
                                        <div onClick={()=>{if(configuration.pageLock){return}; navigate('/autoconfig')}} onMouseOver={e=>e.currentTarget.style.backgroundColor = 'var(--thir-backgroundColor)'} onMouseOut={e=>e.currentTarget.style.backgroundColor = 'var(--sec-backgroundColor)'}
                                            style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',width:'100%', backgroundColor:'var(--sec-backgroundColor)', boxShadow:'var(--main-boxShadow)', cursor:'pointer', padding:'5px', borderRadius:'5px', marginTop:'5px'}}>
                                            <div style={{fontSize:'10px'}}>Config</div>
                                            <svg height="24" viewBox="0 96 960 960" width="24"><path d="m332 1022-19-141q-3-2-6.309-4.045-3.309-2.046-6.691-3.955l-133 56L19 668l112-85q0-1.926.5-4t.5-4.5q0-1.907-.5-3t-.5-3.5L19 483l148-258 133 54q3.886-1.455 7.443-3.227Q311 274 314 272l18-143h296l18 143 8 4 8 4 131-55 148 258-114 85v8q0 1.556-.5 4t-.5 4l114 84-150 261-132-56q-3 1-6 3.5t-5 3.5l-19 142H332Zm146-296q62.557 0 106.779-44.221Q629 637.557 629 575q0-61.6-44.221-106.3Q540.557 424 478 424q-63 0-107 44.7T327 575q0 62.557 44 106.779Q415 726 478 726Zm-.118-90Q453 636 435 617.882q-18-18.117-18-43Q417 550 435.118 532q18.117-18 43-18Q503 514 521 532.118q18 18.117 18 43Q539 600 520.882 618q-18.117 18-43 18ZM480 576Zm-29 310h56l15-104q33-9 62.353-25 29.354-16 51.647-42l97 41 28-50-83-63q6-16 9-32.992 3-16.992 3-34.5T687 541q-3-17-8-33l84-63-29-50-96.818 42Q615 410 585.607 392.705 556.214 375.41 522 369l-13-104h-59l-11 102q-35 8-65.5 25.5T320 436l-95-41-28 50 81 61q-6 19-8.5 35.5t-2.5 33.985Q267 592 269.5 609t8.5 36l-81 61 28 50 95-41q25 26 55.5 43.5T439 783l12 103Z"/></svg>
                                            <div style={{fontSize:'10px'}}>Settings</div>
                                        </div>

                                        <div style={{position:'relative'}}>

                                            {/* Dropdown Button to Save as .JSON */}
                                            <div onClick={()=>handleSaveLogJSON()} onMouseOver={e=>e.currentTarget.style.backgroundColor = 'var(--thir-backgroundColor)'} onMouseOut={e=>e.currentTarget.style.backgroundColor = 'var(--sec-backgroundColor)'}
                                                style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',width:'100%', backgroundColor:'var(--sec-backgroundColor)', boxShadow:'var(--main-boxShadow)', cursor:'pointer', padding:'5px', borderRadius:'5px', marginTop:'5px'}}>
                                                <div style={{fontSize:'10px'}}>Save Log</div>
                                                <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M22.15 6.525V18.75q0 1.425-.987 2.413-.988.987-2.413.987H5.25q-1.425 0-2.412-.987-.988-.988-.988-2.413V5.25q0-1.425.988-2.413.987-.987 2.412-.987h12.225Zm-3.4 1.425-2.7-2.7H5.25v13.5h13.5ZM12 17.825q1.3 0 2.213-.912.912-.913.912-2.213t-.912-2.213q-.913-.912-2.213-.912t-2.212.912q-.913.913-.913 2.213t.913 2.213q.912.912 2.212.912Zm-5.825-7.4h9.3v-4.25h-9.3ZM5.25 7.95v10.8-13.5Z"/></svg>
                                                <div style={{fontSize:'10px'}}>.JSON</div>
                                            </div>

                                            {/* Dropdown Button to Save as .CVS */}
                                            <div onClick={()=>handleSaveLogCVS()} onMouseOver={e=>e.currentTarget.style.backgroundColor = 'var(--thir-backgroundColor)'} onMouseOut={e=>e.currentTarget.style.backgroundColor = 'var(--sec-backgroundColor)'}
                                                style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',width:'100%', backgroundColor:'var(--sec-backgroundColor)', boxShadow:'var(--main-boxShadow)', cursor:'pointer', padding:'5px', borderRadius:'5px', position:'absolute', right:'105%', top:0}}>
                                                <div style={{fontSize:'10px'}}>Save Log</div>
                                                <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M22.15 6.525V18.75q0 1.425-.987 2.413-.988.987-2.413.987H5.25q-1.425 0-2.412-.987-.988-.988-.988-2.413V5.25q0-1.425.988-2.413.987-.987 2.412-.987h12.225Zm-3.4 1.425-2.7-2.7H5.25v13.5h13.5ZM12 17.825q1.3 0 2.213-.912.912-.913.912-2.213t-.912-2.213q-.913-.912-2.213-.912t-2.212.912q-.913.913-.913 2.213t.913 2.213q.912.912 2.212.912Zm-5.825-7.4h9.3v-4.25h-9.3ZM5.25 7.95v10.8-13.5Z"/></svg>
                                                <div style={{fontSize:'10px'}}>.CVS</div>
                                            </div>
                                            

                                        </div>

                                        {/* Dropdown Button to Load .JSON */}
                                        <div onClick={()=>handleLoadLog()} onMouseOver={e=>e.currentTarget.style.backgroundColor = 'var(--thir-backgroundColor)'} onMouseOut={e=>e.currentTarget.style.backgroundColor = 'var(--sec-backgroundColor)'}
                                            style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',width:'100%', backgroundColor:'var(--sec-backgroundColor)', boxShadow:'var(--main-boxShadow)', cursor:'pointer', padding:'5px', borderRadius:'5px', marginTop:'5px'}}>
                                            <div style={{fontSize:'10px'}}>Load Log</div>
                                            <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M10.875 19.1H13.1v-4.35l1.6 1.6 1.525-1.525-4.25-4.25-4.25 4.25 1.55 1.525 1.6-1.6ZM6.25 23.15q-1.4 0-2.4-.987-1-.988-1-2.413V4.25q0-1.425 1-2.413 1-.987 2.4-.987h7.975l6.925 6.875V19.75q0 1.425-1 2.413-1 .987-2.4.987ZM12.475 9.5V4.25H6.25v15.5h11.5V9.5ZM6.25 4.25V9.5 4.25v15.5-15.5Z"/></svg>
                                            <div style={{fontSize:'10px'}}>.JSON</div>
                                        </div>

                                        {/* Clear Logs */}
                                        <div onClick={()=>handleClearLogs()} onMouseOver={e=>e.currentTarget.style.backgroundColor = 'var(--thir-backgroundColor)'} onMouseOut={e=>e.currentTarget.style.backgroundColor = 'var(--sec-backgroundColor)'}
                                            style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',width:'100%', backgroundColor:'var(--sec-backgroundColor)', boxShadow:'var(--main-boxShadow)', cursor:'pointer', padding:'5px', borderRadius:'5px', marginTop:'5px'}}>
                                            <div style={{fontSize:'10px'}}>Clear</div>
                                            <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" viewBox="0 96 960 960" width="24"><path d="M624 871V766h186v105H624Zm0-353V413h308v105H624Zm0 177V589h267v106H624ZM69 418H28V282h180v-67h212v67h179v136h-41v350q0 57.125-39.438 96.562Q479.125 904 422 904H205q-57.125 0-96.562-39.438Q69 825.125 69 768V418Zm136 0v350h217V418H205Zm0 0v350-350Z"/></svg>
                                            <div style={{fontSize:'10px'}}>Logs</div>
                                        </div>

                                        {/* Clear Requests */}
                                        <div id='Layout_clearRequests' onClick={()=>handleClearRequests()} onMouseOver={e=>e.currentTarget.style.backgroundColor = 'var(--thir-backgroundColor)'} onMouseOut={e=>e.currentTarget.style.backgroundColor = 'var(--sec-backgroundColor)'}
                                            style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',width:'100%', backgroundColor:'var(--sec-backgroundColor)', boxShadow:'var(--main-boxShadow)', cursor:'pointer', padding:'5px', borderRadius:'5px', marginTop:'5px'}}>
                                            <div style={{fontSize:'10px'}}>Clear</div>
                                            <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" viewBox="0 96 960 960" width="24"><path d="M624 871V766h186v105H624Zm0-353V413h308v105H624Zm0 177V589h267v106H624ZM69 418H28V282h180v-67h212v67h179v136h-41v350q0 57.125-39.438 96.562Q479.125 904 422 904H205q-57.125 0-96.562-39.438Q69 825.125 69 768V418Z"/></svg>
                                            <div style={{fontSize:'10px'}}>Requests</div>
                                        </div>

                                        {/* Page Lock Button */}
                                        <div onClick={()=>{func4_pageLock(configuration, setConfiguration, reference); reference.current.querySelector('#backgroundLabel').click()}} onMouseOver={e=>e.currentTarget.style.backgroundColor = 'var(--thir-backgroundColor)'} onMouseOut={e=>e.currentTarget.style.backgroundColor = 'var(--sec-backgroundColor)'}
                                            style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',width:'100%', backgroundColor:'var(--sec-backgroundColor)', boxShadow:'var(--main-boxShadow)', cursor:'pointer', padding:'5px', borderRadius:'5px', marginTop:'5px'}}>
                                            <div style={{fontSize:'10px'}}>Page</div>
                                            {configuration.pageLock && <svg fill='blue' height="20" width="20"><path d="M5.708 19q-1.104 0-1.885-.781-.781-.781-.781-1.886V8.771q0-1.125.781-1.896.781-.771 1.885-.771h-.25V4.708q0-1.937 1.334-3.281Q8.125.083 10 .083q1.896 0 3.219 1.344t1.323 3.281v1.396h-.25q1.104 0 1.885.771.781.771.781 1.896v7.562q0 1.105-.781 1.886-.781.781-1.885.781ZM10 14.188q.688 0 1.146-.48.458-.479.458-1.146 0-.666-.469-1.135-.468-.469-1.135-.469-.688 0-1.146.469-.458.469-.458 1.135 0 .688.469 1.157.468.469 1.135.469ZM8.125 6.104h3.75V4.708q0-.812-.542-1.385Q10.792 2.75 10 2.75q-.792 0-1.333.573-.542.573-.542 1.385Z"/></svg>}
                                            {!configuration.pageLock && <svg height="20" width="20"><path d="M5.708 6.104h6.167V4.708q0-.812-.542-1.385Q10.792 2.75 10 2.75q-.792 0-1.333.573-.542.573-.542 1.385H5.458q0-1.937 1.334-3.281Q8.125.083 10 .083q1.896 0 3.219 1.344t1.323 3.281v1.396h-.25q1.104 0 1.885.771.781.771.781 1.896v7.562q0 1.105-.781 1.886-.781.781-1.885.781H5.708q-1.104 0-1.885-.781-.781-.781-.781-1.886V8.771q0-1.125.781-1.896.781-.771 1.885-.771ZM10 14.188q.688 0 1.146-.48.458-.479.458-1.146 0-.666-.469-1.135-.468-.469-1.135-.469-.688 0-1.146.469-.458.469-.458 1.135 0 .688.469 1.157.468.469 1.135.469Z"/></svg>}
                                            <div style={{fontSize:'10px'}}>Lock</div>
                                        </div>

                                        {/* Record Page Navigate */}
                                        <div data-dest="/records" onClick={e=>handleButtonEvent(e)} onMouseOver={e=>e.currentTarget.style.backgroundColor = 'var(--thir-backgroundColor)'} onMouseOut={e=>e.currentTarget.style.backgroundColor = 'var(--sec-backgroundColor)'}
                                            style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',width:'100%', backgroundColor:'var(--sec-backgroundColor)', boxShadow:'var(--main-boxShadow)', cursor:'pointer', padding:'5px', borderRadius:'5px', marginTop:'5px'}}>
                                            <svg height="24" viewBox="0 96 960 960" width="24"><path d="M314 825h332V722H314v103Zm0-164h332V559H314v102Zm-64 361q-55.725 0-95.863-39.438Q114 943.125 114 886V266q0-57.125 40.137-96.562Q194.275 130 250 130h319l277 275v481q0 57.125-40.138 96.562Q765.725 1022 710 1022H250Zm249-546V266H250v620h460V476H499ZM250 266v210-210 620-620Z"/></svg>
                                            <div style={{fontSize:'10px'}}>Records</div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>    
        </nav>

        <nav style={{display:"flex",boxShadow:"var(--main-boxShadow)", height:"50px", backgroundImage: 'linear-gradient(to top, white, cornsilk)', border:"2px solid grey", borderRadius:"5px", alignItems:"center", justifyContent:"space-between", padding:"8px"}}>
            
            {/* Home Button */}
            <button id="home" data-dest="/" onClick={(e)=>handleButtonEvent(e)} style={{boxShadow:"var(--main-boxShadow)", height:"40px", width:"40px", cursor:'pointer'}}>
                <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} fill={currentPage==='/'?'var(--selectBlue)':''} height="24" width="24"><path d="M2.925 22.1V8.475L12 1.65l9.075 6.825V22.1H14.3v-8.3H9.7v8.3Z"/></svg>
            </button>

            {/* Barcode Button */}
            <button id="barcode" data-dest="/barcode" onClick={(e)=>handleButtonEvent(e)} style={{boxShadow:"var(--main-boxShadow)", height:"40px", width:"40px", cursor:'pointer'}}>
                <svg  style={{filter:'drop-shadow(2px 2px 1px #8888)', cursor:'pointer'}} fill={currentPage==='/barcode'?'var(--selectBlue)':''} height="24" width="24"><path d="M13.825 24.3v-2.825h2.825V24.3ZM11 21.475v-6.65h2.825v6.65Zm10.275-4.025V12H24.1v5.45ZM18.45 12V9.175h2.825V12ZM2.525 14.825V12H5.35v2.825ZM-.3 12V9.175h2.825V12ZM12 2.525V-.3h2.825v2.825ZM2.175 5.7H5.7V2.175H2.175ZM-.3 8.175V-.3h8.475v8.475Zm2.475 13.65H5.7V18.3H2.175ZM-.3 24.3v-8.475h8.475V24.3ZM18.3 5.7h3.525V2.175H18.3Zm-2.475 2.475V-.3H24.3v8.475ZM18.85 24.3v-4.025H16.2V17.45h5.075v4.025H24.1V24.3Zm-5.025-9.475V12h4.625v2.825Zm-5.65 0V12H5.35V9.175h8.475V12H11v2.825Zm1-6.65v-5.65H12V5.55h2.825v2.625ZM3.15 4.725V3.15h1.575v1.575Zm0 16.125v-1.575h1.575v1.575ZM19.275 4.725V3.15h1.575v1.575Z"/></svg>
            </button>

            {/* Request Button */}
            <button id="request" data-dest="/request" onClick={(e)=>handleButtonEvent(e)} style={{pointerboxShadow:"var(--main-boxShadow)", height:"40px", width:"40px", cursor:'pointer'}}>
                <div style={{position:'relative'}}>

                    <svg  style={{filter:'drop-shadow(2px 2px 1px #8888)'}} fill={currentPage==='/request'?'var(--selectBlue)':''} height="24" width="24"><path d="M.5 17.825V1.7q0-.6.413-1Q1.325.3 1.925.3H16.05q.625 0 1.025.4.4.4.4 1v10.05q0 .625-.413 1.025-.412.4-1.012.4H5.15ZM6.9 19.2q-.625 0-1.025-.412-.4-.413-.4-1.038v-2.575h14v-9.85h2.6q.6 0 1.012.4.413.4.413 1V23.75l-4.575-4.55Zm7.5-15.825H3.575V10.6l.5-.5H14.4Zm-10.825 0V10.6Z"/></svg>
                    
                    {requestNotify && <svg fill='var(--monochromaticBlue)' stroke='black' height="20" width="20" style={{position:'absolute', left:'50%', top:'50%', transform:'translateX(-50%)'}}><path d="M2.667 16.125v-2.667h1.229V9.417q0-2.084 1.239-3.75Q6.375 4 8.417 3.562v-.979q0-.666.458-1.125Q9.333 1 10 1t1.125.458q.458.459.458 1.125v.979q2.063.417 3.292 2.084 1.229 1.666 1.229 3.771v4.041h1.25v2.667Zm7.354 2.792q-.771 0-1.313-.542-.541-.542-.541-1.292h3.687q0 .771-.542 1.302-.541.532-1.291.532Z"/></svg>}
                </div>
            </button>

            {/* Participant Button */}
            <button id="participants" data-dest="/participants" onClick={(e)=>handleButtonEvent(e)} style={{boxShadow:"var(--main-boxShadow)", height:"40px", width:"40px", cursor:'pointer'}}>
                <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} fill={currentPage==='/participants'?'var(--selectBlue)':''} height="24" width="24"><path d="M6.075 23.9q-1.825 0-3.113-1.288-1.287-1.287-1.287-3.112v-4.15h3.4V1.125L6.85 2.85l1.7-1.725 1.725 1.725L12 1.125l1.7 1.725 1.725-1.725 1.7 1.725 1.7-1.725L20.55 2.85l1.775-1.725V19.5q0 1.825-1.287 3.112Q19.75 23.9 17.925 23.9Zm11.85-3.4q.425 0 .713-.3.287-.3.287-.7V5.7H8.475v9.65h8.45v4.15q0 .4.287.7.288.3.713.3ZM9.4 10.05V7.8h5.475v2.25Zm0 3.175v-2.25h5.475v2.25Zm7.45-3.175q-.45 0-.788-.325-.337-.325-.337-.8 0-.45.337-.788.338-.337.788-.337.475 0 .8.337.325.338.325.788 0 .475-.325.8-.325.325-.8.325Zm0 3.175q-.45 0-.788-.325-.337-.325-.337-.8 0-.475.337-.8.338-.325.788-.325.475 0 .8.325.325.325.325.8 0 .475-.325.8-.325.325-.8.325ZM6.075 20.5h7.45v-1.75h-8.45v.75q0 .4.288.7.287.3.712.3Zm-1 0v-1.75 1.75Z"/></svg>
            </button> 

            {/* Login && Logout Button */}
            <div>
                
                {!authstatus && <button id="login" onClick={()=>{if(configuration.pageLock){return};navigate('/login')}} style={{boxShadow:"var(--main-boxShadow)", height:"40px", width:"40px", cursor:'pointer'}}>
                    <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} width="30px" height="30px" viewBox="0 0 256 256" id="Flat" fill={currentPage==='/login'?'var(--selectBlue)':''}>
                    <path d="M144.48633,136.48438l-41.98926,42a12.0001,12.0001,0,0,1-16.97266-16.96875L107.03467,140H24a12,12,0,0,1,0-24h83.03467L85.52441,94.48438a12.0001,12.0001,0,0,1,16.97266-16.96875l41.98926,42A12.00093,12.00093,0,0,1,144.48633,136.48438ZM192,28H136a12,12,0,0,0,0,24h52V204H136a12,12,0,0,0,0,24h56a20.02229,20.02229,0,0,0,20-20V48A20.02229,20.02229,0,0,0,192,28Z"/>
                    </svg>
                </button>}

                {authstatus && <button onClick={()=>{if(configuration.pageLock){return};window?.localStorage?.setItem('uid', undefined); func_logout(); func_snackbar(reference, 'Logout Successful')}} style={{boxShadow:"var(--main-boxShadow)", height:"40px", width:"40px", cursor:'pointer'}}>
                    <svg style={{filter:'drop-shadow(2px 2px 1px #8888)', cursor:'pointer'}} width="30px" height="30px" viewBox="0 0 256 256" id="Flat">
                    <path d="M224.48633,136.48438l-41.98926,42a12.0001,12.0001,0,0,1-16.97266-16.96876L187.03467,140H104a12,12,0,0,1,0-24h83.03467L165.52441,94.48438a12.0001,12.0001,0,0,1,16.97266-16.96876l41.98926,42A12.00094,12.00094,0,0,1,224.48633,136.48438ZM104,204H52V52h52a12,12,0,0,0,0-24H48A20.02229,20.02229,0,0,0,28,48V208a20.02229,20.02229,0,0,0,20,20h56a12,12,0,0,0,0-24Z"/>
                    </svg>
                </button>}

            </div>
        </nav>
        
        {/* Children Pages Insert */}
        <div style={{flexGrow:1, position:'relative'}}>
            <div id='alertBorder' style={{display:'none', backgroundColor:'palegreen', opacity:'0.25', position:'absolute', width:'100%', height:'100%'}}>&nbsp;</div>
            {children}
        </div>

        {/* Snackbar Notification */}
        <div id="snackbar" st={{zIndex:"100", borderRadius:"20px"}}>Some text some message..</div>

        <Copyright />
    </div>
  )
}

export default Layout