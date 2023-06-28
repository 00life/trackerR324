import React, {useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import Layout from "../context/Layout";
import ToggleBtn from "../components/ToggleBtn";
import InputBar from "../components/inputBar";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { func_snackbar } from "../context/Functions_1";


function AutoConfig(){
    const {configuration, setConfiguration, reference} = useAuth();

    useEffect(()=>{
        try{
            let autoconfig = JSON?.parse(window?.localStorage?.getItem('autoconfig')) ?? '';
            if(autoconfig !== ''){
                reference.current.querySelector('#checkparticipantsWin').checked = autoconfig.participantsWin;
                reference.current.querySelector('#checklogWin').checked = autoconfig.logWin;
                reference.current.querySelector('#checkRecordWin').checked = autoconfig.recordWin;

                reference.current.querySelector('#checkparticipantsLin').checked = autoconfig.participantsLin;
                reference.current.querySelector('#checklogLin').checked = autoconfig.logLin;
                reference.current.querySelector('#checkRecordLin').checked = autoconfig.recordLin;

                reference.current.querySelector('#checkparticipantsPhone').checked = autoconfig.participantsPhone;
                reference.current.querySelector('#checklogPhone').checked = autoconfig.logPhone;
                reference.current.querySelector('#checkRecordPhone').checked = autoconfig.recordPhone;
            } else {
                
                reference.current.querySelector('#checkparticipantsWin').checked = configuration.participantsWin ?? false;
                reference.current.querySelector('#checklogWin').checked = configuration.logWin ?? false;
                reference.current.querySelector('#checkRecordWin').checked = configuration.recordWin ?? false;

                reference.current.querySelector('#checkparticipantsLin').checked = configuration.participantsLin ?? false;
                reference.current.querySelector('#checklogLin').checked = configuration.logLin ?? false;
                reference.current.querySelector('#checkRecordLin').checked = configuration.recordLin ?? false;

                reference.current.querySelector('#checkparticipantsPhone').checked = configuration.participantsPhone ?? false;
                reference.current.querySelector('#checklogPhone').checked = configuration.logPhone ?? false;
                reference.current.querySelector('#checkRecordPhone').checked = configuration.recordPhone ?? false;
            }; 
        }catch{};

    },[reference]);

    const handleSaveAutoConfig = async () => {
        try{
            // Element of the page lock password
            let elem_pagelockpass = reference.current.querySelector('#pagelockpass');
            let pagelockpassvalue = (elem_pagelockpass.value === ''|| elem_pagelockpass.value === configuration.pageLockPass)
                ? configuration.pageLockPass 
                : elem_pagelockpass.value

            // Elements of the Toggle Buttons
            let elem_participantsWin = reference.current.querySelector('#checkparticipantsWin');
            let elem_logWin = reference.current.querySelector('#checklogWin');
            let elem_recordWin = reference.current.querySelector('#checkRecordWin');

            let elem_participantsLin = reference.current.querySelector('#checkparticipantsLin');
            let elem_logLin = reference.current.querySelector('#checklogLin');
            let elem_recordLin = reference.current.querySelector('#checkRecordLin');

            let elem_participantsPhone = reference.current.querySelector('#checkparticipantsPhone');
            let elem_logPhone = reference.current.querySelector('#checklogPhone');
            let elem_recordPhone = reference.current.querySelector('#checkRecordPhone');
            
            // Create object with the toggle button state and pagelock password
            let objAutoConfig = {
                pageLockPass: pagelockpassvalue,
                
                participantsWin: elem_participantsWin.checked,
                logWin: elem_logWin.checked,
                recordWin: elem_recordWin.checked,

                participantsLin: elem_participantsLin.checked,
                logLin: elem_logLin.checked,
                recordLin: elem_recordLin.checked,

                participantsPhone:elem_participantsPhone.checked,
                logPhone: elem_logPhone.checked,
                recordPhone: elem_recordPhone.checked,
            };

            // Save to localStorage
            window?.localStorage?.setItem('autoconfig', JSON.stringify({...configuration, ...objAutoConfig}));

            // Save the object into autoconfig.txt
            var string_data = JSON.stringify(objAutoConfig);
            var file = new File([string_data],{type: 'text/csv;charset=utf-8'});
            let href_link = window.URL.createObjectURL(file);
            var anchor = window.document.createElement('a');
            anchor.setAttribute('href', href_link);
            anchor.setAttribute('download', 'autoconfig.txt')
            anchor.click();
            URL.revokeObjectURL(href_link);

            // Save to phone
            try{

                await Filesystem.writeFile({
                    path: 'autoconfig.txt',
                    data: JSON.stringify(objAutoConfig),
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                });
                
            }catch{}

            // Save to Electron Computer
            try{
                await window?.api?.saveAutoConfig(JSON.stringify(objAutoConfig));
            }catch{}

            func_snackbar(reference, 'Saved') // Notification
            
        }catch(err){console.log('handleSaveAutoConfig: ' + err)}
    };

    const handleToggleConf = e => {
        try{
            if(e.currentTarget.id === 'checkparticipantsWin'){
                setConfiguration({...configuration, participantsWin: e.currentTarget.checked})
            }else if(e.currentTarget.id === 'checklogWin'){
                setConfiguration({...configuration, logWin: e.currentTarget.checked})
            }else if(e.currentTarget.id === 'checkRecordWin'){
                setConfiguration({...configuration, recordWin: e.currentTarget.checked})

            }else if(e.currentTarget.id === 'checkparticipantsLin'){
                setConfiguration({...configuration, participantsLin: e.currentTarget.checked})
            }else if(e.currentTarget.id === 'checklogLin'){
                setConfiguration({...configuration, logLin: e.currentTarget.checked})
            }else if(e.currentTarget.id === 'checkRecordLin'){
                setConfiguration({...configuration, recordLin: e.currentTarget.checked})
            
            }else if(e.currentTarget.id === 'checkparticipantsPhone'){
                setConfiguration({...configuration, participantsPhone: e.currentTarget.checked})
            }else if(e.currentTarget.id === 'checklogPhone'){
                // If using a phone, get permission, then save to documents
                Filesystem.requestPermissions();
                setConfiguration({...configuration, logPhone: e.currentTarget.checked});
            }else if(e.currentTarget.id === 'checkRecordPhone'){
                setConfiguration({...configuration, recordPhone: e.currentTarget.checked});
            };
            
            window.localStorage.setItem('autoconfig', JSON.stringify(configuration));

        }catch(err){console.log('handleToggleConf: ' + err)}
    };

    return (
        <Layout>
            <data value='/autoconfig'></data>
            <div style={{display:'flex', flexDirection:'column', boxShadow:'1px 1px 4px 0px #8888', padding:'5px 5px', margin:'5px', borderRadius:'5px', height:'110%'}}>
            
                {/* Title */}
                <h3 className="textDesign1" style={{ marginLeft:'10px', fontSize:'23px'}}>AutoConfig: Offline-Automate</h3>
                
                <br/>

                <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <h3 style={{color:'grey', marginRight:'5px'}}> Page-Lock Password: <br/>(Default: trackerR324)</h3>
                    <InputBar ids='pagelockpass' placeholder={configuration.pageLockPass} func_onChange={()=>{}}/>
                </div>
                
                <br/> {/*========= Windows Computers ==================== */}
            
                <h2>Windows</h2>
                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
                
                    {/* C:\trackerR324\autoconfig.txt -- Exist Directory */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', fontSize:'15px'}}>C:\trackerR324\autoconfig.txt</h3>
                    </div>
            
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>

                    {/* C:\trackerR324\participants.txt -- Exist File */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>C:\trackerR324\participants.txt</h3>
                    </div>

                    {/* Toogle Button  ParticipantWin */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checkparticipantsWin" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autoload</span>
                    </div>
                    
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
                
                    {/* C:\trackerR324\participants.txt -- Exist File */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>C:\trackerR324\log.txt</h3>
                    </div>

                    {/* Toggle Button ProfileWin */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checklogWin" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autosave</span>
                    </div>
                    
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>

                    {/* C:\trackerR324\RecordData.json -- Exist File */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>C:\trackerR324\RecordData.json</h3>
                    </div>

                    {/* Toogle Button RecordData */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checkRecordWin" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autoload</span>
                    </div>
                    
                </div>

                <br/> {/*============= Linux Computers ================= */}

                <h2>Linux</h2>
                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
                
                    {/* /home/trackerR324/autoconfig.txt -- Exist Directory */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', fontSize:'15px'}}>/home/trackerR324/autoconfig.txt</h3>
                    </div>
            
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
      
                    {/* /home/trackerR324/participants.txt -- Exist File */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>/home/trackerR324/participants.txt</h3>
                    </div>

                    {/* Toggle Button ParticipantLin */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checkparticipantsLin" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autoload</span>
                    </div>
                    
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
                
                    {/* /home/trackerR324/participants.txt -- Exist File */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>/home/trackerR324/log.txt</h3>
                    </div>

                    {/* Toggle Button Autoload Linux */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checklogLin" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autosave</span>
                    </div>
                    
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
      
                    {/* /home/trackerR324/RecordData.json -- Exist File */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>/home/trackerR324/RecordData.json</h3>
                    </div>

                    {/* Toggle Button RecordLin */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checkRecordLin" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autoload</span>
                    </div>
                    
                </div>

                <br/>
                
                <h2>Android / IOS</h2>
                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
                
                    {/* /phone/document/autoconfig.txt -- Exist Directory */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', fontSize:'15px'}}>/phone/documents/autoconfig.txt</h3>
                    </div>
            
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
      
                    {/* /phone/document/participants.txt -- Exist File */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>/phone/documents/participants.txt</h3>
                    </div>

                    {/* Toggle Button ParticipantLin */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checkparticipantsPhone" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autoload</span>
                    </div>
                    
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>

                    {/* /Phone/document/log.txt */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>/phone/documents/log.txt</h3>
                    </div>

                    {/* Toggle Button Phone Autosave */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checklogPhone" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autosave</span>
                    </div>
                    
                </div>

                {/* Save AutoConfig Button */}
                <div onClick={()=>handleSaveAutoConfig()} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--tetradicGreen)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--analogousGreen)'}
                    style={{padding:'5px', boxShadow:"1px 1px 4px 0px #8888", borderRadius:'5px', border:'2px solid black', backgroundColor:'var(--analogousGreen)', cursor:'pointer', display:'flex', flexWrap:'nowrap', width:'300px', position:'fixed', bottom:'5%',left:'50%', transform:'translateX(-50%)', zIndex:1}}>
                    <h4 className="textDesign1" style={{ margin:'auto', color:'var(--sec-backgroundColor)', fontSize:'20px'}}>Save AutoConfig Settings</h4>
                </div>

                <div style={{display:'flex', width:'100%', alignItems:'center', padding:'2px 5px'}}>
      
                    {/* /phone/document/RecordData.json -- Exist File */}
                    <div style={{flexGrow:1, boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'5px', display:'flex'}}>
                        <h3 style={{color: 'var(--main-textColor)', marginLeft:'5px', overflowWrap:'anywhere', fontSize:'15px'}}>/phone/documents/participants.txt</h3>
                    </div>

                    {/* Toggle Button RecordPhone */}
                    <div style={{display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <ToggleBtn ids="checkRecordPhone" func_onToggle={e=>handleToggleConf(e)} />
                        <span style={{fontSize:'10px', fontWeight:'bold', color:'var(--main-textColor)'}}>Autoload</span>
                    </div>
                    
                </div>

                <br/>
                <br/>

            </div>
        </Layout>
    );
};

export default AutoConfig;