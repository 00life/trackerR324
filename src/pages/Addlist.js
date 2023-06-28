import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../context/Layout';
import { useAuth } from '../context/AuthContext';
import { func_cleanArray } from '../context/Functions_1';

function Addlist() {
  const { reference, persons, setPersons} = useAuth();
  const navigate = useNavigate();

  const [studentCount, setStudentCount] = useState(0)

  const handleStudentCount = e=>{
  // Counts the number of participant on the list
  
    let array = e.currentTarget.value.split('\n');
    let cleanarray = func_cleanArray(array);
    setStudentCount(cleanarray.length);
  }

  const handleSubmit=()=>{
    let elem = reference.current.querySelector('#listAddParticipants')
    let array = elem.value.split('\n');
    let cleanarray = func_cleanArray(array);
    
    try{
      // Formatting the String
      let lastFirstNameArray = cleanarray.map(item=>[item.match('^.+? ')[0].trim(), item.match(' .+')[0].trim()]);

      lastFirstNameArray.forEach(e => {

        // Ensuring that all hashes are unique for each person
        let genHash = '';
        let hashArray = persons.map(obj=>obj.hash);

        while(true){
          genHash = require("blueimp-md5")(e[1]+e[0]+Date.now());

          // Break loop if the hash is not in the array
          if(!hashArray.includes(genHash))break
        };

        // Generating a person object to insert into the persons array
        let person = {
          firstname:e[1],
          lastname:e[0],
          schedule:[],
          hash: genHash,
          base64:'',
        };
        setPersons(prev=>[...prev,person]);
      });

    }catch{
      cleanarray.forEach(e=>{

        // Ensuring that all hashes are unique for each person
        let genHash = '';
        let hashArray = persons.map(obj=>(obj.hash));
        while(true){
          genHash = require("blueimp-md5")(e+Date.now());

          // Break loop if the hash is not in the array
          if(!hashArray.includes(genHash))break
        };

        // Generating a person object to insert into the persons array
        let person = {
          firstname: '',
          lastname: e,
          schedule: [],
          hash: genHash,
          base64: '',
        };
        setPersons(prev=>[...prev,person]);
      });
    };
    
    navigate('/participants');
  }

  return (
    <Layout>
        <data value='/addlist'></data>

        <div style={{display:'flex', flexDirection:"column", justifyContent:'center', width:'100%'}}>

          <div style={{display:'flex', justifyContent:'center', flexGrow:'1'}}>
            <h3 style={{color:'#414a4c'}}>Add Participant List ({studentCount})</h3>
          </div>

          <div style={{display:'flex', justifyContent:'center', flexGrow:'1'}}>
            <h3 style={{color:'#414a4c'}}>Lastname Firstname (Middlename)</h3>
          </div>

          <div style={{display:'flex', flexDirection:'column',justifyContent:'center', alignItems:'center', boxShadow:"1px 1px 4px 0px #8888", borderRadius:'5px', margin:'5px', flexGrow:1, padding:'10px'}}>
            
            {/* TextBox area where names are pasted in */}
            <textarea id="listAddParticipants" placeholder="Paste Names Here..." onChange={e=>handleStudentCount(e)}
              style={{fontSize:"20px", borderRadius:'5px', outlineColor:'var(--tetradicGreen)', padding:'5px', width:'100%', height:'50vh'}} />
            
            {/* Submit Button */}
            <input type="button" value="Submit" onClick={()=>handleSubmit()} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--tetradicGreen)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--analogousGreen)'}
              style={{fontSize:"24px", padding:'5px', margin:'10px', borderRadius:'5px', backgroundColor:'var(--analogousGreen)', cursor:'pointer', fontWeight:'bold'}}/>
          
          </div>
        </div>
    </Layout>

  )
}

export default Addlist