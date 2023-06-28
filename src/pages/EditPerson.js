import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../context/Layout';
import InputBar from '../components/inputBar';
import Avatar from '../components/Avatar';
import { func_convertFrom24To12Format, func_stringBase64File } from '../context/Functions_1';
import { func2_toDataURL } from '../context/Functions_2';


function EditPerson() {
    const {persons, setPersons, func_snackbar, reference} = useAuth();
    const {state} = useLocation();
    const navigate = useNavigate();

    const sentHash = state?.hash ?? '';
    const filterPerson = persons.filter(person => person.hash === sentHash);
    const person = (filterPerson.length === 1) ? filterPerson[0] : {firstname: '', lastname: '', email: '', schedule: [], hash: '', base64: ''}
    
    const [onSchedule, setOnSchedule] = useState([...person.schedule]);
    const [onBase64, setOnBase64] = useState(person.base64);
    const [holdtime, setHoldtime] = useState({starttime:'', endtime:''});

  
    const handleDeletePerson = () => {
      try{
        // Finding the participant object
        let filterPersons = persons.filter(obj=>obj.hash !== sentHash);

        // seting a new array
        setPersons(filterPersons)

        // Navigating to the previous page
        navigate('/participants');

      }catch(err){console.log('handleDeletePerson:' + err)}
    };

    const handleChangePicture = async e => {
      const smalltalk = require('smalltalk'); // Electron app friendly prompt
      
      // Prompt user for input
      let httpLink = await new Promise(resolve=>{
        smalltalk
          .prompt('Enter a URL address:', '(Leave empty to choose from file)')
          .then(value => resolve(value ?? ''))
          .catch(() => resolve(''))
      });
      if(httpLink === '' || httpLink === null)return // Guard-Clause
      
      // Variables and Constants
      let MAX_SIZE_KB = 1000;
      let DEFAULT_PERSON_IMAGE = './../images/defaultPerson.png';

      try{

        // ======== From File =========
        if(httpLink.trim().length === 0){

          // Create an input element
          let inputElem = document.createElement('input');
          inputElem.type = 'file';
          inputElem.click();
      
          inputElem.onchange = e => {

            // Callback for func_stringBase64File
            let callback = data => {

              // Set the base64 data to the image
              setOnBase64(data);
            };
            func_stringBase64File(e.target, callback);
          };

        // ======== From URL ========
        }else{
          let callback = data => {

            // Convert the base64 data into KB
            let size = data?.length * 6 / 8 / 1000 * 1.33;
            
            // Check if the size of the base64 data is less than MAX_SIZE_KB
            if(size < MAX_SIZE_KB){

              // Set the image to the base64 data
              setOnBase64(data);
      
            }else{

              // Notification message if the size is too big
              func_snackbar(reference,`Upload must be < ${MAX_SIZE_KB/1000} MB`)
            };
          };
          func2_toDataURL(httpLink, callback);
        };
        
      }catch{
        // Use default image if an error occurs anywhere
        setOnBase64(DEFAULT_PERSON_IMAGE);
      };
    };

    const handleDeleteDetail = e =>{
      // Getting the index on the item on the schedule list
      let dataIndex = e.currentTarget.dataset.index;
      
      // Getting the item's creation timestamp
      let date = onSchedule[dataIndex].date;
    
      // Filtering out the current creating timestamp
      let filterArraySchedule = onSchedule.filter(obj => obj.date !== date);
      
      // Setting new array with the filtered array
      setOnSchedule(filterArraySchedule);

      // Confirmation message
      func_snackbar(reference, 'Schedule Updated')
    };

    const handleTime = e => {
      try{
        // Clicking on the time-picker
        let ids = e.currentTarget.dataset.time;
        e.currentTarget.querySelector('#'+ids).showPicker();
      }catch(err){
        
        // If the showPicker fails
        try{
          let mytime = prompt('Enter time (format 00:00AM):')??'';
          
          let id = e.currentTarget.dataset.time;
          
          //Filtering prompt
          let filter_trim = mytime.trim();
          let filter_lowercase = filter_trim.toUpperCase();
          let filter_replaceChar = filter_lowercase.replace(':','').replace(' ','');
          let get_hours = filter_replaceChar.slice(0,2) ?? '';
          let get_mins = filter_replaceChar.slice(2,4) ?? '';
          let get_AMPM = filter_replaceChar.slice(-2,) ?? '';

          //Confirm get_AMPM
          get_AMPM = (get_AMPM !== 'AM' || get_AMPM !== 'PM') ? '': get_AMPM;

          // Placing the time in the correct location
          if(id === 'hddn_start_time_edit'){
            setHoldtime({...holdtime, starttime: `${get_hours}:${get_mins}${get_AMPM}`})
          }else if(id==='hddn_end_time_edit'){
            setHoldtime({...holdtime, endtime: `${get_hours}:${get_mins}${get_AMPM}`})
          };
        
        }catch(err){console.log('handleTimeAlt: ' + err)}
        console.log('handleTime: ' + err)}
    };

    const handleSchedule = ()=>{
      // Grab inputs
      let editStarttime = reference?.current?.querySelector('#hddn_start_time_edit')?.value ?? '';
      let editEndtime = reference?.current?.querySelector('#hddn_end_time_edit')?.value ?? '';
      let editDetails = reference?.current?.querySelector('#editDetails')?.value?.trim() ?? '';
      
      // Guard-Claus if details is empty
      if(editDetails === '' || editDetails === undefined || editDetails === null){
        func_snackbar(reference, 'Details must not be empty'); // Notification
        return
      };

      // Add to list array of objects
      let item = {
        details: editDetails, 
        starttime: editStarttime, 
        endtime: editEndtime,
        date: new Date().getTime(),
      };

      // Sort the entries before put it into setOnSchedule
      const sortList = [...onSchedule, item].sort((a,b)=>parseFloat(a.starttime.replace(':','.'))-parseFloat(b.starttime.replace(':','.')));
      setOnSchedule(sortList);

      // Clear inputs and confirmation message
      reference.current.querySelector('#hddn_start_time_edit').value = '';
      reference.current.querySelector('#hddn_end_time_edit').value = '';
      reference.current.querySelector('#editDetails').value = '';
      func_snackbar(reference, ' Schedule updated'); // Notification
    };

    const handleSavePerson = ()=>{
      // Grab participant details
      let firstname = reference?.current?.querySelector('#editFirstname')?.value?.trim() ?? '';
      let lastname = reference?.current?.querySelector('#editLastname')?.value?.trim() ?? '';
      let email = reference?.current?.querySelector('#editEmail')?.value?.trim() ?? '';
      
      // Changing the data
      if(firstname === ''){firstname = person.firstname};
      if(lastname === ''){lastname = person.lastname};
      if(email === ''){email = person.email};

      let firstnameLetter = (firstname === '' || firstname === undefined) ? '' : firstname[0].toUpperCase();
      let firstnameBody = (firstname === '' || firstname === undefined) ? '' : firstname.slice(1,).toLocaleLowerCase();
      let lastnameLetter = (lastname === '' || lastname === undefined) ? '' : lastname[0].toUpperCase();
      let lastnameBody = (lastname === '' || lastname === undefined) ? '' : lastname.slice(1,).toLocaleLowerCase();
      let mySchedule = onSchedule?.sort((a,b)=>parseFloat(a?.starttime?.replace(':','.'))-parseFloat(b?.starttime?.replace(':','.')));

      let newPersonObj = {
        hash: (sentHash === '' || sentHash === undefined) ? '' : sentHash,
        firstname: firstnameLetter + firstnameBody,
        lastname: lastnameLetter + lastnameBody,
        email: (email === '' || email === undefined) ? 'Email' : email?.toLowerCase(),
        base64: (onBase64 === '' || onBase64 === undefined) ? '' : onBase64,
        schedule: (mySchedule === '' || mySchedule === undefined) ? [] : mySchedule,
      };

      let filterPersons = persons.filter(obj=>obj.hash !== sentHash);
      setPersons([...filterPersons, newPersonObj]);

      // Clearing input data
      reference.current.querySelector('#editFirstname').value = '';
      reference.current.querySelector('#editLastname').value = '';
      reference.current.querySelector('#editEmail').value = '';
      reference.current.querySelector('#editDetails').value = '';

      func_snackbar(reference, 'Participant Updated'); // Notification

    };

  return (
    <Layout>
        <data value='/editperson'></data>
        <div style={{boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'10px', backgroundColor:'var(--thir-backgroundColor)'}}>
          
          <div style={{display:'flex'}}>

            {/* Save Button */}
            <div onClick={()=>handleSavePerson()} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--tetradicGreen)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--analogousGreen)'}
              style={{padding:'5px', boxShadow:"1px 1px 4px 0px #8888", marginRight:'5px', borderRadius:'5px', border:'2px solid black', backgroundColor:'var(--analogousGreen)', cursor:'pointer', display:'flex', flexWrap:'nowrap', marginBottom:'10px', width:'50%'}}>
              <h4 className="textDesign1" style={{ margin:'auto', color:'var(--sec-backgroundColor)', fontSize:'20px'}}>Save</h4>
            </div>

            {/* Delete Button */}
            <div onClick={()=>handleDeletePerson()} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--complimentRed)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--triadicRed)'}
              style={{padding:'5px', boxShadow:"1px 1px 4px 0px #8888", marginRight:'5px', borderRadius:'5px', border:'2px solid black', backgroundColor:'var(--triadicRed)', cursor:'pointer', display:'flex', flexWrap:'nowrap', marginBottom:'10px', width:'50%'}}>
              <h4 className="textDesign1" style={{ margin:'auto', color:'var(--sec-backgroundColor)', fontSize:'20px'}}>Delete</h4>
            </div>

          </div>
      
          <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
            <table>
              <tbody>

                {/* First name input prompt */}
                <tr>
                  <td><h4>First Name:</h4></td>
                  <td><InputBar placeholder={person?.firstname} ids='editFirstname' func_onChange={()=>{}} /></td>
                </tr>

                {/* Last name input prompt */}
                <tr>
                  <td><h4>Last Name:</h4></td>
                  <td><InputBar placeholder={person?.lastname} ids='editLastname' func_onChange={()=>{}}/></td>
                </tr>

                {/* Email input prompt */}
                <tr>
                  <td><h4>Email:</h4></td>
                  <td><InputBar placeholder={person?.email} ids='editEmail' func_onChange={()=>{}}/></td>
                </tr>
                
              </tbody>
            </table>
            
            {/* Avatar picture of the participant */}
            <Avatar
                ids={'#editAvatar'} hash={sentHash} lastname={person.lastname} firstname={person.firstname} base64={onBase64}
                func_function={handleChangePicture}
            />
          </div>

        </div>

        {/* Schedule Add */}
        <div style={{boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'10px', display:'flex', justifyContent:'center', backgroundColor:'var(--sec-backgroundColor)'}}>
          <table>
            <tbody>
              <tr>
                    
                <td>
                  <div>
                    {/* Details input prompt */}
                    <InputBar ids="editDetails" type={"text"} placeholder={"Details"} value='' func_onChange={()=>{}} required={false}/>
                  </div>
                </td>
    
                <td>     
                  <div style={{display:'flex', alignItems:'center', flexWrap:'nowrap'}}>

                    {/* time-start schedule button */}
                    <button data-time="hddn_start_time_edit" onClick={e=>handleTime(e)} type="button" style={{boxShadow:'1px 1px 4px 0px #8888', padding:'2px', marginRight:'5px', cursor:'pointer'}}>
                      <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M8.1 3.05V.025h7.8V3.05Zm2.4 11.975h3v-6.3h-3ZM12 24q-2.1 0-3.938-.788-1.837-.787-3.212-2.15-1.375-1.362-2.162-3.2-.788-1.837-.788-3.937 0-2.1.788-3.938.787-1.837 2.162-3.2 1.375-1.362 3.212-2.162 1.838-.8 3.938-.8 1.625 0 3.15.487 1.525.488 2.825 1.463l1.8-1.8 2.15 2.175-1.8 1.8q1.025 1.325 1.5 2.837.475 1.513.475 3.138 0 2.1-.788 3.937-.787 1.838-2.162 3.2-1.375 1.363-3.212 2.15Q14.1 24 12 24Zm0-3.4q2.8 0 4.75-1.937 1.95-1.938 1.95-4.738 0-2.775-1.95-4.738Q14.8 7.225 12 7.225T7.25 9.187Q5.3 11.15 5.3 13.925q0 2.8 1.95 4.738Q9.2 20.6 12 20.6Zm0-6.675Z"/></svg>
                      <input id="hddn_start_time_edit" type="time" style={{display:'none'}} />
                    </button>

                    {/* time-end schedule button */}
                    <button data-time="hddn_end_time_edit" onClick={e=>handleTime(e)} type="button" style={{boxShadow:'1px 1px 4px 0px #8888',padding:'2px', marginRight:'5px', cursor:'pointer'}}>
                      <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M8.1 3.05V.025h7.8V3.05Zm2.4 11.975h3v-6.3h-3ZM12 24q-2.1 0-3.938-.788-1.837-.787-3.212-2.15-1.375-1.362-2.162-3.2-.788-1.837-.788-3.937 0-2.1.788-3.938.787-1.837 2.162-3.2 1.375-1.362 3.212-2.162 1.838-.8 3.938-.8 1.625 0 3.15.487 1.525.488 2.825 1.463l1.8-1.8 2.15 2.175-1.8 1.8q1.025 1.325 1.5 2.837.475 1.513.475 3.138 0 2.1-.788 3.937-.787 1.838-2.162 3.2-1.375 1.363-3.212 2.15Q14.1 24 12 24Z"/></svg>
                      <input id="hddn_end_time_edit" type="time" style={{display:'none'}}/>
                    </button>

                    {/* add-item to schedule button */}
                    <button type="button" onClick={()=>handleSchedule()} style={{boxShadow:'1px 1px 4px 0px #8888',padding:'2px', marginRight:'5px', cursor:'pointer'}}>
                      <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M10.3 19.7v-6H4.275v-3.4H10.3V4.275h3.4V10.3h6.025v3.4H13.7v6Z"/></svg>
                    </button>

                  </div>
                </td>
    
              </tr>
            </tbody>
          </table>
        </div>

        {/* Schedule Chart */}
        <div style={{boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'10px', display:'flex', justifyContent:'center'}}>
          <table border="1">
            <tbody>
              <tr colSpan={4}>
                <th style={{padding:'5px'}}>DETAILS</th>
                <th style={{padding:'5px'}}>START-TIME</th>
                <th style={{padding:'5px'}}>END-TIME</th>
              </tr>
              {onSchedule.map((item, i) => (
                <tr key={i} style={{textAlign:'center'}}>
                  <th style={{color:'var(--main-textColor)', wordWrap:'breakWord'}}>{item.details}</th>
                  
                  {/* Start-time and end-time entry */}
                  <td>{(!item?.starttime)?'':func_convertFrom24To12Format(item.starttime)}</td>
                  <td>{(!item?.endtime)?'':func_convertFrom24To12Format(item.endtime)}</td>
                  
                  {/* Delete schedule entry button */}
                  <td style={{cursor:'pointer'}}>
                    <svg data-index={i} onClick={e=>handleDeleteDetail(e)} height="24" width="24"><path d="m12.025 14.375-4.45 4.45q-.5.5-1.2.5t-1.2-.5q-.5-.5-.5-1.188 0-.687.5-1.187l4.45-4.475-4.45-4.45q-.5-.5-.5-1.188 0-.687.5-1.187.475-.5 1.175-.5.7 0 1.2.5L12 9.6l4.425-4.45q.5-.5 1.2-.5t1.2.5q.5.5.5 1.2t-.5 1.2L14.375 12l4.45 4.45q.5.5.5 1.2t-.5 1.175q-.475.5-1.175.5-.7 0-1.175-.5Z"/></svg>
                  </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
        
    </Layout>
    
  )
}

export default EditPerson