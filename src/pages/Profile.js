import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../context/Layout';
import InputBar from "../components/inputBar";
import Avatar from '../components/Avatar';
import { func_convertFrom24To12Format, func_stringBase64File } from '../context/Functions_1';
import { func2_toDataURL} from '../context/Functions_2';
import { funcAuth_getUID, funcAuth_updateEmail, funcAuth_updateProfile } from '../context/Functions_Auth';
import { func4_saveDataOnline } from '../context/Functions_4';


function Profile() {//fix
  const { func_snackbar, profileData, setProfileData, authstatus, reference } = useAuth();
  const authuid = funcAuth_getUID(authstatus);

  const [firstname, setFirstname] = useState('First Name');
  const [lastname, setLastname] = useState('Last Name');
  const [email, setEmail] = useState('Email');
  const [onSchedule, setOnSchedule] = useState([]);
  const [starttime, setStarttime] = useState('');
  const [endtime, setEndtime] = useState('');
  const [details, setDetails] = useState('');
  const [holdtime, setHoldtime] = useState({starttime:'', endtime:''});

  useEffect(()=>{
    try{
      
      if(profileData !== '' || profileData !== undefined || profileData !== null){
        setFirstname(profileData?.firstname);
        setLastname(profileData?.lastname);
        setEmail(authstatus?.email);
        setOnSchedule(profileData?.schedule);
      };

    }catch(err){console.log('Profile - useEffect: ' + err)}
  },[reference, profileData])


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
        get_AMPM = (get_AMPM !== 'AM'||get_AMPM !== 'PM') ? '': get_AMPM;

        // Placing the time in the correct location
        if(id==='profile_hddn_start_time'){
          setHoldtime({...holdtime, starttime: `${get_hours}:${get_mins}${get_AMPM}`})
        }else if(id==='profile_hddn_end_time_edit'){
          setHoldtime({...holdtime, endtime: `${get_hours}:${get_mins}${get_AMPM}`})
        };
      
      }catch(err){console.log('handleTimeAlt: ' + err)}
      console.log('handleTime: '+ err)
    };
  };

  const handleSchedule = e => {
    // Guard-Claus if details is empty
    if(details.trim() === '' || details === null || details === undefined){
      func_snackbar(reference, 'Details must not be empty');
      return
    };

    // Add to list array of objects
    let obj = {
      details: details.trim(), 
      starttime: starttime, 
      endtime: endtime,
      date: new Date().getTime(),
    };


    let sortList = [];
    if(onSchedule === '' || onSchedule === undefined || onSchedule === null){
      sortList.push(obj);
    }else{
      sortList = [...onSchedule, obj].sort((a,b)=>parseFloat(a.starttime.replace(':','.'))-parseFloat(b.starttime.replace(':','.')));
    }
    
    setOnSchedule(sortList);

    // Clear inputs and confirmation message
    reference.current.querySelector('#profile_hddn_start_time').value = '';
    reference.current.querySelector('#profile_hddn_end_time').value = '';
    reference.current.querySelector('#profile_dtails').value = '';

    func_snackbar(reference,'Schedule Updated'); // Notification
  };

  const handleDeleteDetailSchedule = e => {
    // Getting the index on the item on the schedule list
    let dataIndex = e.currentTarget.dataset.index;
      
    // Getting the item's creation timestamp
    let date = onSchedule[dataIndex].date;
  
    // Filtering out the current creating timestamp
    let filterArraySchedule = onSchedule.filter(obj => obj.date !== date);
    
    // Setting new array with the filtered array
    setOnSchedule(filterArraySchedule);

    func_snackbar(reference, 'Schedule Updated'); // Notification
  };

  const handleUploadPicture = async e => {
    // Get user input
    const smalltalk = require('smalltalk'); // Electron app friendly prompt
    let httpLink = await new Promise(resolve=>{
        smalltalk
          .prompt('Enter a URL address:', '(Leave empty to choose from file)')
          .then(value => resolve(value ?? ''))
          .catch(() => resolve(''))
    });

    if(httpLink == null)return // Guard-Clause

    // Variables and Constants
    let MAX_SIZE_KB = 1000;

    try{

      // ======== From File =========
      if(httpLink.trim().length === 0){
        
        // Creating an input element
        let inputElem = document.createElement('input');
        inputElem.type = 'file';
        inputElem.click();

        inputElem.onchange = e => {
          
          // Callback for func_stringBase64File
          let callback = data => {

            // Set the variable to the base64 data
            setProfileData({...profileData, base64:data});
            
          };
          func_stringBase64File(e.target, callback);
        };

      // ========= From URL =========
      }else{

        // Callback for func2_toDataURL
        let callback = data => {

          // Convert the base64 data into KB
          let size = data?.length * 6 / 8 / 1000 * 1.33;
          
          // Check if the size of the base64 is less than MAX_SIZE_KB
          if(size < MAX_SIZE_KB){

            // Set the variable to the base64 data
            setProfileData({...profileData, base64:data});
            
          }else{
            // Notification that the image is too large
            func_snackbar(reference,`Upload must be < ${MAX_SIZE_KB/1000} MB`); // Notification
          };
        };
        // Converts the URL image into base64 data
        func2_toDataURL(httpLink, callback);
      };
      
    }catch(err){console.log('handleUploadPicture: ' + err)};
  };

  const handleSaveProfile = ()=>{
    try{
      let myFirstName = (firstname !== 'First Name') ? firstname.trim() : '';
      let myLastName = (lastname !== 'Last Name') ? lastname.trim() : '';
      
      let myDisplayName = '';
      if(myFirstName === '' && myLastName !== ''){
        myDisplayName = myLastName;
      }else if(myFirstName !== '' && myLastName === ''){
        myDisplayName = myFirstName;
      }else if(myFirstName === '' && myLastName === ''){
        myDisplayName = authstatus.email;
      }else{
        myDisplayName = myFirstName+'_'+myLastName;
      };
    
      // Updating profileData object
      setProfileData({...profileData, firstname: firstname, lastname: lastname, displayName: myDisplayName, email: email, uid: authuid, schedule: onSchedule});
      
      // Update Firebase displayName
      funcAuth_updateProfile({...authstatus, displayName: (myDisplayName !== '') ? myDisplayName : authstatus.email});

      // Creating the object to save to file
      let profileObj = {
        firstname: firstname !=='' ? firstname : profileData?.firstname,
        lastname: lastname !=='' ? lastname : profileData?.lastname,
        displayName: myDisplayName,
        uid: authuid,
        email: email === '' ? authstatus.email : funcAuth_updateEmail(email),
        schedule: profileData?.schedule ? profileData?.schedule : [],
        contactList: profileData?.contactList ? profileData?.contactList: [],
        base64: profileData?.base64 ? profileData?.base64 : '',
      };
      
      // Saving the file online
      func4_saveDataOnline(profileObj, '/profile', reference, authstatus);

      setTimeout(()=>func_snackbar(reference, 'Profile Updated'),0); // Notification
      
    }catch(err){console.log('handleSaveProfile: ' + err)}
  };

  const handleResetProfile = () =>{
    // Creating the object to save to file
      let profileObj = {
        firstname: 'First Name',
        lastname: 'Last Name',
        displayName: '',
        uid: authuid,
        email: authstatus.email,
        schedule: [],
        contactList: [],
        base64: '',
      };

      setProfileData(profileObj);
      setTimeout(()=>func_snackbar(reference,'Profile Reset'),0); // Notification
  };

  return (
    <Layout>
      <data value='/profile'></data>
      <div style={{display:'flex', justifyContent:'center', backgroundColor:'#ffffff', padding:'20px 0px', margin:'10px 20px', boxShadow:'1px 1px 4px 0px #8888', borderRadius:"5px", caretColor: "rgba(0,0,0,0)"}}>
        <form>
          <table width='100%'>
            <tbody>

              <tr style={{boxShadow:"1px 1px 4px 0px #8888", borderRadius:'5px', backgroundColor:'var(--sec-backgroundColor)'}}>
                <td colSpan={2}>
                  <div style={{display:'flex', alignItems:'center', padding:'5px'}}>

                    <div style={{display:'flex', justifyContent:'center', flexGrow:'1'}}>
                      <h3 style={{color:'var(--main-textColor)'}}>My Profile</h3>
                    </div>
                    
                    <div style={{display:'flex', alignItems:'center'}}>
                      
                      {/* Save Profile Button */}
                      <div onClick={()=>handleSaveProfile()} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--tetradicGreen)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--analogousGreen)'}
                        style={{padding:'5px', boxShadow:"1px 1px 4px 0px #8888", marginRight:'5px', borderRadius:'5px', border:'2px solid black', backgroundColor:'var(--analogousGreen)', display:'flex', flexWrap:'nowrap', width:'50%', cursor:'pointer'}}>
                        <h4 className="textDesign1" style={{ margin:'auto', color:'var(--sec-backgroundColor)', fontSize:'20px'}}>Save</h4>
                        <svg style={{filter:'drop-shadow(2px 2px 1px #8888)', margin:'0 5px'}} height="24" width="24"><path d="M22.15 6.525V18.75q0 1.425-.987 2.413-.988.987-2.413.987H5.25q-1.425 0-2.412-.987-.988-.988-.988-2.413V5.25q0-1.425.988-2.413.987-.987 2.412-.987h12.225Zm-3.4 1.425-2.7-2.7H5.25v13.5h13.5ZM12 17.825q1.3 0 2.213-.912.912-.913.912-2.213t-.912-2.213q-.913-.912-2.213-.912t-2.212.912q-.913.913-.913 2.213t.913 2.213q.912.912 2.212.912Zm-5.825-7.4h9.3v-4.25h-9.3ZM5.25 7.95v10.8-13.5Z"/></svg>
                      </div>

                      {/* Load Profile Button */}
                      <div onClick={()=>handleResetProfile()} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--analogousBlue)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--columbianBlue)'}
                        style={{padding:'5px', boxShadow:"1px 1px 4px 0px #8888", marginRight:'5px', borderRadius:'5px', border:'2px solid black', backgroundColor:'var(--columbianBlue)', display:'flex', flexWrap:'nowrap', width:'50%', cursor:'pointer'}}>
                        <h4 className="textDesign1" style={{ margin:'auto', color:'var(--sec-backgroundColor)', fontSize:'20px'}}>Reset</h4>
                        <svg style={{filter:'drop-shadow(2px 2px 1px #8888)', margin:'0 5px'}} height="24" width="24"><path d="M12.1 22.15q-3.975 0-6.887-2.612Q2.3 16.925 1.975 13h3.45q.35 2.5 2.238 4.125 1.887 1.625 4.412 1.625 2.8 0 4.775-1.962 1.975-1.963 1.975-4.788 0-2.8-1.962-4.775Q14.9 5.25 12.1 5.25q-1.5 0-2.862.625-1.363.625-2.288 1.8H9.1v2.675H1.95v-7.1h2.6v1.975q1.425-1.65 3.388-2.513Q9.9 1.85 12.1 1.85q2.075 0 3.925.8 1.85.8 3.213 2.175Q20.6 6.2 21.4 8.05q.8 1.85.8 3.95t-.8 3.95q-.8 1.85-2.162 3.225-1.363 1.375-3.213 2.175-1.85.8-3.925.8Zm2.45-5.55-3.975-3.95v-5.8H13.2v4.7l3.2 3.175Z"/></svg>
                      </div>

                    </div>

                  </div> 
                </td>
              </tr>

              <tr style={{boxShadow:"1px 1px 4px 0px #8888", borderRadius:'5px', backgroundColor:'var(--thir-backgroundColor)'}}>
                <td>
                  <div style={{padding:"5px"}}>
                    {/* Input new participant information */}
                    <InputBar ids="profile_lname" type={"text"} placeholder={lastname} func_onChange={setLastname} required={true} />
                    <InputBar ids="profile_fname" type={"text"} placeholder={firstname} func_onChange={setFirstname} required={true} />
                    <InputBar ids="profile_email" type={"email"} placeholder={(()=>{try{return authstatus.email}catch{return email}})()} func_onChange={setEmail} required={false} />
                  </div>
                </td>

                <td style={{padding:'10px'}}>
                
                {/* Upload profile picture for new participant */}
                <Avatar
                    hash='' lastname='' firstname='' base64={profileData?.base64} func_function={e => {handleUploadPicture(e)}} />
                </td>
              </tr>

              <tr style={{boxShadow:"1px 1px 4px 0px #8888", borderRadius:'5px', backgroundColor:'var(--sec-backgroundColor)'}}>

                {/* Details input for schedule array     */}
                <td>
                  <div style={{padding:"10px"}}>
                    <InputBar ids="profile_dtails" type={"text"} placeholder={"Details"} value={details} func_onChange={setDetails} required={false}/>
                  </div>
                </td>

                <td>
                  
                  <div style={{display:'flex', alignItems:'center', flexWrap:'nowrap'}}>

                    {/* Start-time button for the schedule array */}
                    <button data-time="profile_hddn_start_time" onClick={e=>handleTime(e)} type="button" style={{boxShadow:'1px 1px 4px 0px #8888', padding:'2px', marginRight:'5px', cursor:'pointer'}}>
                      <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M8.1 3.05V.025h7.8V3.05Zm2.4 11.975h3v-6.3h-3ZM12 24q-2.1 0-3.938-.788-1.837-.787-3.212-2.15-1.375-1.362-2.162-3.2-.788-1.837-.788-3.937 0-2.1.788-3.938.787-1.837 2.162-3.2 1.375-1.362 3.212-2.162 1.838-.8 3.938-.8 1.625 0 3.15.487 1.525.488 2.825 1.463l1.8-1.8 2.15 2.175-1.8 1.8q1.025 1.325 1.5 2.837.475 1.513.475 3.138 0 2.1-.788 3.937-.787 1.838-2.162 3.2-1.375 1.363-3.212 2.15Q14.1 24 12 24Zm0-3.4q2.8 0 4.75-1.937 1.95-1.938 1.95-4.738 0-2.775-1.95-4.738Q14.8 7.225 12 7.225T7.25 9.187Q5.3 11.15 5.3 13.925q0 2.8 1.95 4.738Q9.2 20.6 12 20.6Zm0-6.675Z"/></svg>
                      <input id="profile_hddn_start_time" type="time" style={{display:'none'}} onChange={e=>setStarttime(e.currentTarget.value)}/>
                    </button>
                    
                    {/* End-time button for the schedule array */}
                    <button data-time="profile_hddn_end_time" onClick={e=>handleTime(e)} type="button" style={{boxShadow:'1px 1px 4px 0px #8888',padding:'2px', marginRight:'5px', cursor:'pointer'}}>
                      <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M8.1 3.05V.025h7.8V3.05Zm2.4 11.975h3v-6.3h-3ZM12 24q-2.1 0-3.938-.788-1.837-.787-3.212-2.15-1.375-1.362-2.162-3.2-.788-1.837-.788-3.937 0-2.1.788-3.938.787-1.837 2.162-3.2 1.375-1.362 3.212-2.162 1.838-.8 3.938-.8 1.625 0 3.15.487 1.525.488 2.825 1.463l1.8-1.8 2.15 2.175-1.8 1.8q1.025 1.325 1.5 2.837.475 1.513.475 3.138 0 2.1-.788 3.937-.787 1.838-2.162 3.2-1.375 1.363-3.212 2.15Q14.1 24 12 24Z"/></svg>
                      <input id="profile_hddn_end_time" type="time" style={{display:'none'}} onChange={e=>setEndtime(e.currentTarget.value)}/>
                    </button>

                    {/* Add-to-schedule button for the schedule array */}
                    <button onClick={()=>handleSchedule()} type="button" style={{boxShadow:'1px 1px 4px 0px #8888',padding:'2px', marginRight:'5px', cursor:'pointer'}}>
                      <svg style={{filter:'drop-shadow(2px 2px 1px #8888)'}} height="24" width="24"><path d="M10.3 19.7v-6H4.275v-3.4H10.3V4.275h3.4V10.3h6.025v3.4H13.7v6Z"/></svg>
                    </button>

                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Schedule Chart */}
          <div style={{boxShadow:'1px 1px 4px 0px #8888', padding:'5px', margin:'5px', borderRadius:'10px', display:'flex', justifyContent:'center'}}>
            <table border="1">
              <tbody>
                <tr colSpan={4}>
                  <th style={{padding:'5px'}}>DETAILS</th>
                  <th style={{padding:'5px'}}>START-TIME</th>
                  <th style={{padding:'5px'}}>END-TIME</th>
                </tr>
                {onSchedule?.map((obj, i) => (
                  <tr key={i} style={{textAlign:'center'}}>
                    <th style={{color:'var(--main-textColor)', wordWrap:'breakWord'}}>{obj.details}</th>
                    <td>{(!obj?.starttime)?'':func_convertFrom24To12Format(obj.starttime)}</td>
                    <td>{(!obj?.endtime)?'':func_convertFrom24To12Format(obj.endtime)}</td>
                    <td style={{cursor:'pointer'}}>
                      <svg data-index={i} onClick={e=>handleDeleteDetailSchedule(e)} height="24" width="24"><path d="m12.025 14.375-4.45 4.45q-.5.5-1.2.5t-1.2-.5q-.5-.5-.5-1.188 0-.687.5-1.187l4.45-4.475-4.45-4.45q-.5-.5-.5-1.188 0-.687.5-1.187.475-.5 1.175-.5.7 0 1.2.5L12 9.6l4.425-4.45q.5-.5 1.2-.5t1.2.5q.5.5.5 1.2t-.5 1.2L14.375 12l4.45 4.45q.5.5.5 1.2t-.5 1.175q-.475.5-1.175.5-.7 0-1.175-.5Z"/></svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      </div>
    
    </Layout>
  )
}

export default Profile