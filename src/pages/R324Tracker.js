import React, { useEffect } from 'react';
import Layout from '../context/Layout';
import { useAuth } from '../context/AuthContext';
import { funcAuth_setData, funcAuth_loadData } from '../context/Functions_Auth';

function R324Tracker() {
  const { func_snackbar, reference } = useAuth();

  useEffect(()=>{
    // Load the previous code saved online
    let elem = reference.current.querySelector('#R324Tracker_textarea');
    let callback = data =>{
      elem.value = data.news;
    } ;; // Calback Host
    funcAuth_loadData('/NewForEveryone', callback)
  },[reference]);

  const handleNewsUpdate = () =>{
    try{
      let elem = reference.current.querySelector('#R324Tracker_textarea');
      funcAuth_setData('/NewForEveryone',{news: elem.value});

    }catch(err){console.log('handleNewsUpdate: ' + err)}

    func_snackbar(reference, 'Page Updated'); // Notification
  };

  const handleReflect = e =>{
    let elem = reference.current.querySelector('#R324Tracker_reflectTextarea');
    elem.innerHTML = e.currentTarget.value;
  };

  return (
    <Layout>
      <data value="/R324Tracker"></data>

      <div style={{height:'75vh'}}>

        <div style={{height:'100%', padding:'20px', display:'flex'}}>
          
          <textarea id="R324Tracker_textarea" placeholder='Type HTML here...' onChange={e=>handleReflect(e)}
            style={{width:'50%', height:'100%',borderRadius:'5px', margin:'5px', padding:'10px', overflow:'scroll'}}></textarea>

          <div id="R324Tracker_reflectTextarea" style={{width:'50%', boxShadow: '0 0 2px 1px #8888', margin:'5px', borderRadius:'5px', padding:'10px', height:'100%', overflow:'scroll'}}></div>
          
        </div>

        <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
            <input type='button' value='submit' onClick={()=>handleNewsUpdate()} style={{margin:'auto', width:'200px', height:'30px', borderRadius:'5px'}}/>
        </div>

      </div>
    
    </Layout>
  );
};

export default R324Tracker