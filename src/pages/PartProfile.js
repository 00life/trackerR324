import React from 'react';

function PartProfile() {
  
  return (
   
    <div style={{display:'flex',flexDirection:'column', justifyContent:'center'}}>
      
      <div style={{height:'5px'}}>&nbsp;</div>
      
      <div id="schedule" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}></div>
      
      <div style={{height:'5px'}}>&nbsp;</div>
      
      <div style={{display:'flex', justifyContent:'center', backgroundColor:'white', padding:'5px'}}>
        <img id='partBar' alt='barcode' src='' style={{color:'black', maxWidth:'400px', width:'95%'}}/>
      </div>

      <div style={{height:'0px'}}>&nbsp;</div>

      <div style={{display:'flex', justifyContent:'center', backgroundColor:'white', padding:'5px'}}>
        <img id='partProfile' alt='qrcode' src='' style={{color:'black'}}/>
      </div>

    
    </div>
  )
}

export default PartProfile