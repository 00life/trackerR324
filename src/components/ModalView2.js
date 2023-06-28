import React from 'react';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';

function ModalView2({ids}) {
    const { reference } = useAuth();
    
    const handleDisplayModal = e => {
        let elem_checkbox = e.currentTarget;
    
        // Checkbox Conditions
        if(elem_checkbox.checked){
            e.currentTarget.parentNode.style.display = 'flex';
            reference.current.querySelector('#smallAvatar').style.opacity = 0;
        }else{
            e.currentTarget.parentNode.style.display = 'none';
            reference.current.querySelector('#smallAvatar').style.opacity = 1;
        };   
    };

  return (
    
    <div id='ModalView2_main' style={{display:'none', justifyContent:'center'}}>
        <style>
            {`
                #ModalView2_main{
                    animation-name: mainBody;
                    animation-duration: 0.3s; 
                }

                @keyframes mainBody{
                    0%{opacity:0}
                    100%{opacity:1}
                }
            `}
        </style>

        <input id={ids} onChange={e=>handleDisplayModal(e)} type='checkbox' style={{display:'none'}} />
        <label htmlFor={ids} style={{position:'absolute', backgroundColor:'rgba(0,0,0,.3)', width:'100%', height:'150%', top:'-10vh', left:0}}>&nbsp;</label>
        <div style={{position:'absolute', top:'80%', left:'50%', transform:'translate(-50%,-100%)'}}>
           
           <div style={{display:'flex', flexDirection:'column', alignItems:'center', position:'relative', boxShadow: '1px 1px 4px 0px #8888', borderRadius:'5px', padding:'5px', backgroundColor:'var(--main-backgroundColor)'}}>
                
                <div style={{backgroundColor:'var(--sec-backgroundColor)',boxShadow:'1px 1px 4px 0px #8888', padding:'5px', borderRadius:'5px', display:'flex'}}>
                    
                    {/* Title Header */}
                    <h2 className="textDesign1" id="ModalView2_header">&nbsp;</h2>
                    
                    {/* Close Button */}
                    <label htmlFor={ids} style={{cursor:'pointer', marginLeft:'10px'}}>
                        <svg height="40" width="40"><path d="m14 28.375 6-6 6 6L28.375 26l-6-6 6-6L26 11.625l-6 6-6-6L11.625 14l6 6-6 6Zm-5.792 7.833q-1.833 0-3.125-1.291-1.291-1.292-1.291-3.125V8.208q0-1.833 1.291-3.146Q6.375 3.75 8.208 3.75h23.584q1.833 0 3.146 1.312 1.312 1.313 1.312 3.146v23.584q0 1.833-1.312 3.125-1.313 1.291-3.146 1.291Zm0-4.416h23.584V8.208H8.208v23.584Zm0-23.584v23.584V8.208Z"/></svg>
                    </label>
                </div>
                
                <div id="ModalView2_schedule" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'5px'}}></div>
                
                <div style={{margin:'20px'}}>
                    <Avatar ids='ModalView2_Avatar' func_function={()=>{}} styles={{height:'200px', width:'200px'}}/>
                </div>

            </div>
        
        </div>

    </div>
  )
}

export default ModalView2