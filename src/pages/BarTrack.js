import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import InputBar from "../components/inputBar";
import Avatar from "../components/Avatar";
import ModalView2 from "../components/ModalView2";
import { func_convertFrom24To12Format} from '../context/Functions_1';


function BarTrack(){
    const {configuration, setConfiguration, outPeople, backPeople, persons, reference} = useAuth();
    const [nowTime, setNowTime] = useState(null);
    

    useEffect(()=>{
        try{

            // Set up global timer variable
            let timer = setInterval(()=>{
                setNowTime(new Date().getTime());      
            }, 1000);
        
            return function cleanup(){
                clearInterval(nowTime);
                clearInterval(timer)};

        }catch{}
    },[nowTime]);


    const handleRateLimit = e => {
        if(configuration.pageLock)return // Guard-Clause pagelock

        (e === '' || isNaN(e))
            ? setConfiguration({...configuration, rateLimit:0})
            : setConfiguration({...configuration, rateLimit: parseInt(e)}); 
    };

    const handTimeLimit = e => {
        if(configuration.pageLock)return // Guard-Clause pagelock

        (e === '' || isNaN(e))
            ? setConfiguration({...configuration, timeLimit:0})
            : setConfiguration({...configuration, timeLimit: parseInt(e)}); 
    };
    
    const handleViewParticipant = e => {
        reference.current.querySelector('#myModal2').click();
        
        // Getting the hash and finding the person
        let hash = e.currentTarget.dataset.hash;
        let filteredPerson = persons.find(obj=>obj.hash===hash);
        
        // Creating the string header and inserting it into the html
        let stringHeader = `${filteredPerson.lastname}, ${filteredPerson.firstname} (${filteredPerson.email})`;
        reference.current.querySelector('#ModalView2_header').innerHTML = stringHeader;

        // Creating the html table to insert into ModuleView popup
        let html_schedule = `
            <table border="1">
            <tr>
                <th style="padding:5px">DETAILS</th>
                <th style="padding:5px">START-TIME</th>
                <th style="padding:5px">END-TIME</th>
            </tr>
                ${filteredPerson.schedule.map(item=>(`
                    <tr style="text-align:center">
                    <th style="color:var(--main-textColor); word-wrap: break-word">${item.details}</th>
                    <td>${(!item?.starttime)?'':func_convertFrom24To12Format(item.starttime)}</td>
                    <td>${(!item?.endtime)?'':func_convertFrom24To12Format(item.endtime)}</td>
                    </tr>
                `)).join('')}
        
            <table>
        `;

        // Inserting the html code into the ModuleView2 popup
        reference.current.querySelector('#ModalView2_schedule').innerHTML = html_schedule;
        
        // Sending base64 image to ModalView2 popup
        reference.current.querySelector('#ModalView2_Avatar').style.backgroundImage = `url(${filteredPerson.base64})`;
    };

    return(
    <div>
        <ModalView2 ids={"myModal2"} />

        <div style={{backgroundColor:'var(--sec-backgroundColor)', padding:'5px', borderRadius:'5px', boxShadow:'1px 1px 4px 0px #8888', marginBottom:'5px'}}>
            <div style={{display:'flex'}}>
                
                {/* Rate Limit Input */}
                <div style={{width:'100%', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'space-evenly', padding:'5px'}}>
                    <label htmlFor='Input-rateLimit' style={{color:'var(--main-textColor)'}}>Rate Limit:</label>
                    <InputBar ids='Input-rateLimit' func_onChange={handleRateLimit} placeholder={configuration.rateLimit+' 🏃'}/>     
                </div>
                
                {/* Time Limit Input */}
                <div style={{width:'100%', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'space-evenly', padding:'5px'}}>
                    <label htmlFor='Input-timeLimit' style={{color:'var(--main-textColor)'}}>Time Limit:</label>
                    <InputBar ids='Input-timeLimit' func_onChange={handTimeLimit} placeholder={configuration.timeLimit+' min'}/>
                </div>

            </div>
        </div>
        <div style={{backgroundColor:'var(--main-backgroundColor)', borderRadius:'5px', boxShadow:'1px 1px 4px 0px #8888'}}>
            
            <div style={{display:'flex'}}>

                {/* Title Header for » */}
                <div style={{width: '100%', display:'flex', justifyContent:'center', boxShadow:'1px 1px 4px 0px #8888'}}>
                    <div style={{color:'var(--main-textColor)', fontSize:'20px', fontWeight:'bolder'}}>
                        <span style={{color:'black'}}>(»)</span>
                    </div>
                </div>

                {/* Title Header for « */}
                <div style={{width: '100%', display:'flex', justifyContent:'center', boxShadow:'1px 1px 4px 0px #8888'}}>
                    <div style={{color:'var(--main-textColor)', fontSize:'20px', fontWeight:'bolder'}}>
                        <span style={{color:'blue'}}>(«)</span>
                    </div>
                </div>
            </div>

            <div id={'smallAvatar'} style={{display:'flex', height:'60vh'}}>
                <div style={{width: '100%', display:'flex', boxShadow:'1px 1px 4px 0px #8888', padding:'15px'}}>
                    {outPeople.map((obj,i)=>(
                        <div key={i}>
                            <div style={{margin:'5px', position:'relative'}}>

                                {/* Timer Display */}
                                <div className='textDesign1' style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', 
                                    
                                    // Conditions for Colors
                                    color: Math.round((nowTime - obj.timestamp)/1000/60) > configuration.timeLimit && configuration.timeLimit !== 0 
                                        ? 'tomato': 'palegreen' }}>
                                    
                                    {(nowTime !== null) ? Math.round((nowTime - obj.timestamp)/1000/60) : '~'}
                                    <span style={{fontSize:'10px'}}>min</span>
                                </div>
                                
                                {/* Avatar Display */}
                                <Avatar hash={obj.hash} func_function={()=>{}} firstname={obj.firstname} lastname={obj.lastname} base64={obj.base64} styles={{height:'50px', width:'50px'}} />
                                
                                {/* Clickable Overlay */}
                                <div data-hash={obj.hash} onClick={e=>handleViewParticipant(e)} style={{position:'absolute', borderRadius:'50%', top:'50%',left:'50%', transform:'translate(-50%,-50%)', height:'55px', width:'55px', cursor:'pointer'}}>&nbsp;</div>
                            </div>
                        </div>
                    ))} 
                </div>
                <div style={{width: '100%', display:'flex', boxShadow:'1px 1px 4px 0px #8888', padding:'15px'}}>
                    {backPeople.map((obj,i)=>(
                        <div key={i}>
                            <div style={{margin:'5px', position:'relative'}}>

                                {/* Duration Display */}
                                <div className='textDesign1' style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                                    
                                    // Condition for Colors
                                    color: obj.duration > configuration.timeLimit && configuration.timeLimit !==0
                                        ? 'tomato':'white'}}>
                                    
                                    {obj.duration}
                                    <span style={{fontSize:'10px'}}>min</span>
                                </div>

                                {/* Avatar Display */}
                                <Avatar hash={obj.hash} func_function={()=>{}} firstname={obj.firstname} lastname={obj.lastname} base64={obj.base64} styles={{height:'50px', width:'50px'}} />
                            
                                {/* Clickable Overlay */}
                                <div data-hash={obj.hash} onClick={e=>handleViewParticipant(e)} style={{position:'absolute', borderRadius:'50%', top:'50%',left:'50%', transform:'translate(-50%,-50%)', height:'55px', width:'55px', cursor:'pointer'}}>&nbsp;</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </div>
)};

export default BarTrack