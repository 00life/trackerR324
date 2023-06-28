import React from 'react'

function Avatar({ids, hash, lastname, firstname, base64, func_function, styles}) {
  return (
    <div>
      <div style={{paddingRight:'7px', paddingLeft:'7px'}}>

          <h4 className='textDesign1' style={{textAlign:'center', marginBottom:'-10px'}}>
              {lastname}
          </h4>
          
          <div style={{borderRadius:'50%', boxShadow:'0px 0px 0px 5px var(--columbianBlue)', cursor:'pointer'}}>
              <div id={ids} data-hash={hash} onClick={(e)=>func_function(e)} style={{backgroundImage: `url(${(base64)?base64:require('./../images/defaultPerson.png')})`, backgroundRepeat:'no-repeat', backgroundPosition:'center', backgroundSize:'cover' ,height:'100px', width:'100px', borderRadius:'50%', boxShadow:'1px 1px 4px 1px #8888', ...styles}} ></div>
          </div>
          
          <h4 className='textDesign1' style={{textAlign:'center', marginTop:'-15px'}}>
              {firstname}
          </h4>

      </div>
    </div>
  )
}

export default Avatar