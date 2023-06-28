import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../context/Layout';
import { useAuth } from '../context/AuthContext';
import { func_savedata, func_loaddata, func_modalview, func_generateQR, func_convertFrom24To12Format, func_snackbar } from '../context/Functions_1';
import ToggleBtn from '../components/ToggleBtn';
import ModalView from '../components/ModalView';
import Avatar from '../components/Avatar';
import PartProfile from './PartProfile';
import InputBar from '../components/inputBar';


function Participants() {

  const navigate = useNavigate();
  const { persons, setPersons, configuration, setConfiguration, authstatus, reference } = useAuth();
  const [filterArray, setFilterArray] = useState([]);


  const func_onToggle = e => {
  // Setting the toggle button configuration  
    setConfiguration({...configuration, onlineLoadParticipant: e.currentTarget.checked});
    window.localStorage.setItem('autoconfig', JSON.stringify({...configuration, onlineLoadParticipant: e.currentTarget.checked}));
    (e.currentTarget.checked)
      ? func_snackbar(reference, 'Auto-loading Online Enabled')
      : func_snackbar(reference, 'Auto-Loading Online Disabled')
  };

  const handlePartProfile = async e => {
    // Calling the ModuleView popup
    func_modalview(reference, '#myModal')

    // Getting the person data
    let hash = e.currentTarget.dataset.hash;
    let personData = persons.find(person => person.hash === hash) ?? '';
    let showEmail = (personData.email.trim() === '' || !personData.email) ? '': '('+personData.email+')';

    // Inserting the person data (header and footer) into ModuleView popup
    reference.current.querySelector('.modal-header').children[1].innerHTML = personData?.lastname+', '+personData?.firstname+' '+showEmail;
    reference.current.querySelector('.modal-footer').children[0].dataset.hash = hash;

    // Generating QR code image and inserting to ModuleView popup
    let partProfile = reference.current.querySelector('#partProfile');
    partProfile.src = await func_generateQR(hash, 'base64');

    // Creating the html table to insert into ModuleView popup
    let html_schedule = `
      <table border="1">
        <tr>
          <th style="padding:5px">DETAILS</th>
          <th style="padding:5px">START-TIME</th>
          <th style="padding:5px">END-TIME</th>
        </tr>
        ${personData.schedule.map(item=>(`
          <tr style="text-align:center">
            <th style="color:var(--main-textColor); word-wrap: break-word">${item.details}</th>
            <td>${(!item?.starttime)?'':func_convertFrom24To12Format(item.starttime)}</td>
            <td>${(!item?.endtime)?'':func_convertFrom24To12Format(item.endtime)}</td>
          </tr>
        `)).join('')}
        
      <table>
    `
    // Inserting the html code into the ModuleView popup
    reference.current.querySelector('#schedule').innerHTML = html_schedule;
   
    // Creating the barcode base64 data to insert into ModuleView popup
    let JsBarcode = require('jsbarcode');
    let { createCanvas } = require("canvas");
    let canvas = createCanvas();
    JsBarcode(canvas, hash);
    let base64 = canvas.toDataURL('image/jpeg',1);

    // Inserting the barcode base64 data into the ModuleView popup
    reference.current.querySelector('#partBar').src = base64
  };

  const handleSearch = e=>{
    let lowercase = e.toLowerCase();
    let cleanLetter = lowercase.replace(/[^\w\s]/gi, '')
    let filterFirstnameArray = persons.filter(item=>item.firstname.toLowerCase().match('^'+cleanLetter));
    let filterLastnameArray = persons.filter(item=>item.lastname.toLowerCase().match('^'+cleanLetter));
    let filterFinal = [...new Set([...filterFirstnameArray,...filterLastnameArray])];
    setFilterArray([...filterFinal]);
   
  };

  const handleSavePersons = () =>{
  // Save persons array either online or on the computer
    func_savedata(persons, 'participants.txt', "/participants", reference, authstatus)
  };

  const handleLoadPersons = () => {
  // Load persons array either from online or from the computer
    func_loaddata('/participants', setPersons, reference, authstatus);
  };

  return (
    <Layout>
        <data value='/participants'></data>

        <div>

          {/* Popup Menu with Participant Info */}
          <ModalView ids={"myModal"} header={'Your Name'} footer={'Edit'} >
            <PartProfile />
          </ModalView>
          
          <div style={{boxShadow:'1px 1px 4px 0px #8888', margin:'5px', borderRadius:'5px', padding:'5px', display:'flex', justifyContent:"space-evenly", alignItems:'center', backgroundColor:'var(--sec-backgroundColor)'}}>

            {/* Participant Searchbar */}
            <div style={{display:'flex', justifyContent:'center', flexGrow:'1'}}>
              <div style={{width:'100%'}}>
                <InputBar ids="searchParticipant" type={"text"} placeholder={"Search Participant"} func_onChange={handleSearch} required={false}/>
              </div>
            </div>

            <div style={{display:'flex', flexWrap:'nowrap'}}>

              {/* Go to AddPerson Page */}
              <button onClick={()=>navigate('/addperson')} type="button" style={{boxShadow:'1px 1px 4px 0px #8888', padding:'2px', marginLeft:'5px'}}>
                <svg  style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M18.45 13v-2.825h-2.825v-2.65h2.825v-2.8h2.65v2.8h2.8v2.65h-2.8V13Zm-9.375-1.55q-2.125 0-3.587-1.475-1.463-1.475-1.463-3.6 0-2.1 1.463-3.55 1.462-1.45 3.587-1.45t3.588 1.45q1.462 1.45 1.462 3.575 0 2.1-1.462 3.575Q11.2 11.45 9.075 11.45Zm-9.15 10.4v-3.975q0-1.175.6-2.113.6-.937 1.575-1.437 1.65-.85 3.4-1.275 1.75-.425 3.575-.425 1.85 0 3.6.425t3.375 1.25q.975.5 1.575 1.438.6.937.6 2.137v3.975Zm3.4-3.4h11.5V18q0-.25-.125-.45t-.325-.275q-1.2-.6-2.55-.925-1.35-.325-2.75-.325-1.375 0-2.763.325-1.387.325-2.537.925-.2.075-.325.275t-.125.45Zm5.75-10.4q.675 0 1.163-.488.487-.487.487-1.162 0-.675-.487-1.163-.488-.487-1.163-.487t-1.162.487q-.488.488-.488 1.163t.488 1.162q.487.488 1.162.488Zm0-1.65Zm0 12.05Z"/></svg>
              </button>

              {/* Save Data Button */}
              <button onClick={()=>handleSavePersons()} type="button" style={{boxShadow:'1px 1px 4px 0px #8888', padding:'2px', marginLeft:'5px'}}>
                <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M22.15 6.525V18.75q0 1.425-.987 2.413-.988.987-2.413.987H5.25q-1.425 0-2.412-.987-.988-.988-.988-2.413V5.25q0-1.425.988-2.413.987-.987 2.412-.987h12.225Zm-3.4 1.425-2.7-2.7H5.25v13.5h13.5ZM12 17.825q1.3 0 2.213-.912.912-.913.912-2.213t-.912-2.213q-.913-.912-2.213-.912t-2.212.912q-.913.913-.913 2.213t.913 2.213q.912.912 2.212.912Zm-5.825-7.4h9.3v-4.25h-9.3ZM5.25 7.95v10.8-13.5Z"/></svg>
              </button>

              {/* Load Data Button */}
              <button onClick={()=>handleLoadPersons()} type="button" style={{boxShadow:'1px 1px 4px 0px #8888', padding:'2px', marginLeft:'5px'}}>
                <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M10.875 19.1H13.1v-4.35l1.6 1.6 1.525-1.525-4.25-4.25-4.25 4.25 1.55 1.525 1.6-1.6ZM6.25 23.15q-1.4 0-2.4-.987-1-.988-1-2.413V4.25q0-1.425 1-2.413 1-.987 2.4-.987h7.975l6.925 6.875V19.75q0 1.425-1 2.413-1 .987-2.4.987ZM12.475 9.5V4.25H6.25v15.5h11.5V9.5ZM6.25 4.25V9.5 4.25v15.5-15.5Z"/></svg>
              </button>

              <div style={{marginLeft:'5px', display:"flex", flexDirection:"column", alignItems:"center"}}>
                <ToggleBtn func_onToggle={func_onToggle} check={configuration.onlineLoadParticipant}/>
                <h6 style={{color:'var(--main-textColor:)'}}>🖧 Auto</h6>
              </div>
              
            </div>

          </div>

          <div style={{display:'flex', alignContent:'flex-start', justifyContent:'space-evenly', flexWrap:'wrap',caretColor:'rgba(0,0,0,0)', margin:'5px', boxShadow:'1px 1px 4px 0px #8888', borderRadius:'5px', paddingBottom:'20px'}}>
        
            {persons.length > 0 && 
              (()=>
                filterArray.length === 0 ? persons : filterArray
              )().map((p,i)=>{return(
              
              <Avatar key={i} 
                hash={p.hash} lastname={p.lastname} firstname={p.firstname} base64={p.base64}
                func_function={handlePartProfile} 
              />

            )})}

          </div>

        </div>
    </Layout>
  )
}

export default Participants