import React, { useState, useLayoutEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../context/Layout';
import InputBar from '../components/inputBar';
import ToggleBtn from '../components/ToggleBtn';
import ModalView from '../components/ModalView';
import {funcAuth_loadData, funcAuth_getUID, funcAuth_setData} from '../context/Functions_Auth';
import { func_modalview, func_snackbar } from '../context/Functions_1';
import RequestOptions from './RequestOptions';
import ReceivingParticipant from '../components/ReceivingParticipant';
import SentParticipant from '../components/SentParticipant';


function Request() {
  const { profileData, setProfileData, configuration, setConfiguration, authstatus, reference } = useAuth();
  const authuid = funcAuth_getUID(authstatus) ?? '';

  const [toggleSearch, setToggleSearch] = useState(false);
  const [toggleAccept, setToggleAccept] = useState(true);
  const [uidEmailArray, setUidEmailArray] = useState([]);
  const [filterEmails, setFilterEmails] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [randomNum, setRandomNum] = useState(0);
  

  const handleSearchToggle = e => {
    try{
      // Switch the toggle button
      setToggleSearch(!toggleSearch);

      if(toggleSearch)return // Guard-Clause
      
      // Get an array of users of the app
      let uidArrayPromise = new Promise(resolve=>{
        if(e.currentTarget.checked){
          let callback = data =>{
            if(data === '' || data === undefined || data === null)return // Guard-Clause

            resolve(Object?.keys(data))
          } ;; // Callback Host
          funcAuth_loadData('/users', callback);
        };
      });

      // Get an array of objects with UID and Email
      let uidEmailPromise = data => {
        return new Promise(resolve => {

          let uidEmailArray = [];
        
          for(let i=0; i < data.length; i++){
            let callback2 = data2 => {
              if(data2 !== undefined || data2 !== null){
    
                try{
                  let userEmail = data2.toLowerCase();
                  let userUID = data[i];
                  uidEmailArray.push({email: userEmail , uid: userUID})
                }catch{};

              };
            } ;; // Callback2 Host
            funcAuth_loadData(`/users/${data[i]}/profile/email`, callback2)
          };

          // return the results
          resolve(uidEmailArray);
        })
      };

      // Calling the Promise / Functions
      (async()=>{
        let uidArray = await uidArrayPromise;
        setUidEmailArray([...await uidEmailPromise(uidArray)]);
      })();
      
    }catch(err){console.log('handleSearchToggle: ' + err)}
  };

  const handleAcceptAllToggle = () => {
  // Toggle button to accept all incoming requests
    try{

      setToggleAccept(!toggleAccept);
      
      // The setTimout is to ensure smooth animation of the toggle before it is executed
      setTimeout(()=>setConfiguration({...configuration, toggleAccept:!toggleAccept}),300);

      // Save configuration to localStorage
      window.localStorage.setItem('autoconfig',JSON.stringify({...configuration, toggleAccept: !toggleAccept}))

    }catch(err){console.log('handleAcceptAllToggle: ' + err)}
    
  };
 
  const handleContactSearch = e =>{
  // Toggle button that searches other users emails

    try{
      // Put lower case and remove whitespaces
      let cleanLetterLower = e.replace(/[^\w\s]/gi, '').toLowerCase();

      if(e === ''){
        setFilterEmails([]);
      }else{
        let filterArray = uidEmailArray.filter(obj=>obj.email.match(`^${cleanLetterLower}`));
        let excludeArray = filterArray.filter(obj=>obj.uid !== authuid);
        setFilterEmails([...excludeArray]);
      }
    }catch(err){console.log('handleContactSearch: ' + err)};
  };

  const handleAddContact = () => {
  // Button to add the email to the contact list

    try{
      // Nodelist of checkbox elements
      let checkboxArray = reference.current.querySelectorAll('.checkbox_contact');
      
      // Adding checked checkbox data to contactArray
      let contactArray = [];
      for(let i=0; i < checkboxArray.length;i++){
        if(checkboxArray[i].checked){
          let selectUid = String(checkboxArray[i].id.slice(9,));
          let selectEmail = String(checkboxArray[i].dataset.email);
          contactArray.push({email: selectEmail, uid: selectUid, contactName: selectEmail});
        };
      };
      
      if(profileData.contactList === '' || profileData.contactList === undefined || profileData.contactList === null){

        // Adding selectArray to the profileData
        setProfileData({...profileData, contactList: [...contactArray]});
        funcAuth_setData(`users/${authuid}/profile`, {...profileData, contactList: [...contactArray]});

      }else{

        // Ensuring that there are not repeats in selectArray (all unique)
        let selectSet = new Set();
        let combineArray = profileData.contactList.concat(contactArray)
        combineArray.forEach(obj=>selectSet.add(obj.uid));
        let uidArray = Array.from(selectSet);
        
        let newContactArray = [];
        for(let i=0; i<uidArray.length;i++){
          let findObj = combineArray.find(obj=>(obj.uid===uidArray[i]));
          newContactArray.push(findObj);
        };
        
        // Adding selectArray to the profileData and Online
        setProfileData({...profileData, contactList:[...newContactArray]});
        funcAuth_setData(`users/${authuid}/profile`, {...profileData, contactList: [...newContactArray]});
      };

      setTimeout(()=>func_snackbar(reference, 'Profile Updated'),0)

    }catch(err){console.log('handleAddContact: ' + err)}
  };

  const handleContactOptions = e => {
    try{

      let selectUid = e.currentTarget.dataset.uid;
      let contactName = e.currentTarget.innerHTML

      let elem_requestOptions_rename = reference.current.querySelector('#requestOptions_rename');
      let elem_requestOptions_delete = reference.current.querySelector('#requestOptions_delete');

      elem_requestOptions_delete.dataset.uid = selectUid;
      elem_requestOptions_rename.placeholder = contactName;
      elem_requestOptions_rename.setAttribute('data-uid', selectUid);

      func_modalview(reference, '#myModal');

    }catch(err){console.log('handleContactOptions: ' + err)}
  };

  const handleCheckbox = e => {
    try{
      let selectUid = e.currentTarget.id.slice(9,);
      let elem = reference.current.querySelector('#label_' + selectUid);

      // Change backgroundColor when element is checked
      (e.currentTarget.checked)
        ? elem.style.backgroundColor = 'var(--columbianBlue)'
        : elem.style.backgroundColor = 'var(--monochromaticWhite)';
    }catch(err){console.log('handleCheckbox: ' + err)};
  };

  const handleRefresh = () =>{
    setTimeout(()=>func_snackbar(reference, 'Page Refresh'),300); // notification
    setRandomNum(Math.random());
  };

  useLayoutEffect(()=>{
    try{

      // Load Toggle Configuration
      setToggleAccept(configuration.toggleAccept);
      if(authuid === '' || authuid === undefined || authuid === null)return // Guard-Clause
      
      // Get all incoming Requests
      let callback = data => {
        let dataValues = Object.values(data);
        
        // Renaming senderName with the name on the contactList 
        let newDataValues = [];
        dataValues.forEach(obj=>{
          profileData.contactList.forEach(obj2=>{
            (obj.uid === obj2.sender) 
            ? newDataValues.push({...obj, senderName: obj2.contactName})
            : newDataValues.push({...obj})
          });
        });

        // Putting the new array the useState variable
        setAllRequests([...newDataValues])
      } ;; // Callback Host
      funcAuth_loadData(`users/${authuid}/requests`, callback);

    }catch(err){console.log('Request_useEffect: ' + err)}
    
  },[authstatus, randomNum])

  return (
    <Layout>
      <data value='/request'></data>
      <div style={{height:'100%', display:'flex', flexDirection:'column'}}>

        <ModalView ids={"myModal"} styles={{ display: 'none' }} header={'Request Options'}>
          <RequestOptions />
        </ModalView>

        <div style={{display:'flex', alignItems:'center', padding:'3px 5px', borderRadius:'5px', backgroundColor:'var(--sec-backgroundColor)', flexWrap:'wrap'}}>
          
          <div style={{display:'flex', boxShadow: '1px 1px 4px 0px #8888', borderRadius:'5px', width:'50%', justifyContent:'center', padding:'10px'}}>
            {/* Title: Search Email Contacts */}
            <h3 style={{color:'var(--main-textColor)', overflow:'clip'}}>Search Contacts</h3>

            <div style={{flexGrow:1}}>&nbsp;</div>

            {/* Search Toggle Button   */}
            <ToggleBtn func_onToggle={handleSearchToggle} check={toggleSearch}/>
          </div>

          <div style={{display:'flex', boxShadow: '1px 1px 4px 0px #8888', borderRadius:'5px', width:'50%', justifyContent:'center', padding:'10px'}}>
            {/* Title: Search Email Contacts */}
            <h3 style={{color:'var(--main-textColor)'}}>Accept All Requests</h3>

            <div style={{flexGrow:1}}>&nbsp;</div>

            {/* Accept Toggle Button   */}
            <ToggleBtn func_onToggle={handleAcceptAllToggle} check={toggleAccept}/>
          </div>


        </div>

        {toggleSearch && 
          <div style={{display:'flex', boxShadow:"1px 1px 4px 0px #8888", margin:'5px', borderRadius:'5px', padding:'5px', alignContent:'center'}}>
            
            {/* Contact Search-bar Input */}
            <div style={{flexGrow:1, position:'relative'}}>
              <InputBar placeholder='Search contact by email' func_onChange={handleContactSearch}/>
            </div>
            
            {/* Add Contact Button */}
            <div onClick={()=>handleAddContact()} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--tetradicGreen)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--analogousGreen)'}
              style={{boxShadow:"1px 1px 4px 0px #8888", borderRadius:'5px', border:'2px solid black', backgroundColor:'var(--analogousGreen)', display:'flex', alignItems:'center', width:'5rem', margin:'5px', cursor:'pointer'}}>
              <h4 className="textDesign1" style={{ margin:'auto', color:'var(--thir-backgroundColor)', fontSize:'20px'}}>Add</h4>
            </div>

          </div>
        }

        {toggleSearch &&
          <div style={{boxShadow:"1px 1px 4px 0px #8888", borderRadius:'5px', display:'flex', alignItems:'center', margin:'0px 5px 5px 5px', padding:'5px'}}>
            
            {/* List of Email Contacts that Match */}
            {filterEmails.map((obj,i)=>(
              
              <div key={i} style={{padding:'5px'}}>

                {/* Contact Search Result Email */}
                <label id={'label_'+ obj.uid} htmlFor={'checkbox_'+obj.uid}
                  style={{cursor:'pointer', boxShadow:"1px 1px 4px 0px #8888", backgroundColor:'var(--monochromaticWhite)', padding:'5px', borderRadius:'5px', border:'1px solid blue', margin:'5px'}}>
                  {obj.email}  
                </label>

                {/* Contact Search Item Hidden Checkbox */}
                <input className="checkbox_contact" data-email={obj.email} id={'checkbox_'+obj.uid} type='checkbox' onChange={e=>handleCheckbox(e)} style={{display:'none'}}/>
             
              </div>

            ))}

          </div>
        }

        <div style={{display:'flex', flexGrow:1, marginBottom:'35px'}}>
          
          <div style={{boxShadow:'1px 1px 4px 0px #8888', margin:'0 2px 0 5px', padding:'5px', width:'25%', borderRadius:'5px', height:'100%'}}>
          
            {/* Contact Title */}
            <h4 style={{color:'var(--main-textColor)', width:'fit-content', margin:'auto'}}>Contacts</h4>
            
            <hr/>

            {/* List of Saved Contacts */}
            {profileData?.contactList?.map((obj,i)=>(

              <div key={i}>

                {authstatus?.uid !== obj?.uid &&
                  <div data-uid={obj?.uid} onClick={e=>handleContactOptions(e)}
                    style={{border:'1px solid #8888', borderRadius:'5px', margin:'2px', overflow:'clip', wordWrap:'break-word', cursor:'pointer',padding:'7px', backgroundColor: (i%2===0)?'':'var(--thir-backgroundColor)'}}>
                    {obj?.contactName}
                  </div>
                }

              </div>
              
            ))}

          </div>
          
          <div style={{boxShadow:'1px 1px 4px 0px #8888', margin:'0 5px 0 2px', padding:'5px', width:'75%', borderRadius:'5px'}}>
            
            {/* Log-List Title  */}
            <div style={{display:'flex', alignItems:'center', width:'fit-content', margin:'auto'}}>
              <h4 style={{color:'var(--main-textColor)'}}>Requests</h4>
              <svg id="refresh" height="20" viewBox="0 96 960 960" width="20" onClick={()=>handleRefresh()}
                style={{filter:'drop-shadow(2px 2px 1px #8888)', cursor:'pointer'}}><path d="M439 959q-123-18-208-110.5T146 628q0-63 21-118t57-102l91 90q-18 27-29.5 61T274 628q0 76 47.5 131T439 829v130Zm82 0V829q72-13 118.5-69T686 628q0-79-51.5-138T506 423h-10l47 47-69 69-186-187 186-188 69 70-60 60h10q134 0 227.5 98.5T814 628q0 129-84.5 221.5T521 959Z"/></svg>
            </div>

            <hr/>

            <div id="requestDisplay">
              {/* Log-List of Requests */}
              {allRequests.map((obj,i)=>(
                <div key={i}>
                
                  {authstatus?.uid !== obj.sender && obj.type === 'receive' &&
                    <ReceivingParticipant firstname={obj.firstname} lastname={obj.lastname} timestamp={obj.timestamp} sender={obj.sender} hash={obj.hash} schedule={obj.schedule} email={obj.email} base64={obj.base64} arriveTime={obj.arriveTime} leaveTime={obj.leaveTime} senderName={obj.senderName} dataConfirm={obj.confirm} confirmSet={obj.confirmSet} note={obj.note}/>
                  }
                  
                  {authstatus?.uid === obj.sender && obj.type === 'sent' &&
                    <SentParticipant firstname={obj.firstname} lastname={obj.lastname} timestamp={obj.timestamp} arriveTime={obj.arriveTime} leaveTime={obj.leaveTime} receiverName={obj.receiverName} dataConfirm={obj.confirm} confirmSet={obj.confirmSet}/>
                  }
                  
                </div>
              ))}
            </div>

          </div>

        </div>
    
      </div>
    </Layout>
  )
}

export default Request