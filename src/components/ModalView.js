import React from 'react';
import './ModalView.css';
import { useNavigate } from 'react-router-dom';

function ModalView({ids, header, styles, children}) {
    const navigate = useNavigate();
    
    const handleEditPerson = e =>{
        navigate('/editperson', { state:{ hash:e.currentTarget.dataset.hash } } )
    };

    const handleNavToRecords = e => {
        let hash = e.currentTarget.parentNode.querySelector('#editDetailButton').dataset.hash;
        navigate(`/records#recordName${hash}` );
    };

  return (
    
    <div id={ids} className="modal">

        <div className="modal-content" >
            
            <div className="modal-header" style={{backgroundColor:'var(--sec-backgroundColor)',boxShadow:'1px 1px 4px 0px #8888'}}>
                <span className="close" style={{color:'black'}}>&times;</span>
                <h2 style={{color:'var(--complimentYellow)',textAlign:'center',textShadow:'1px 0px black, -1px -0px black, 0px 1px black, 0px -1px black, 1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black'}}>{header}</h2>
            </div>
            
            <div className="modal-body">
                {children}
            </div>
            
            <div className="modal-footer" style={{display:'flex',justifyContent:'center', backgroundColor:'var(--sec-backgroundColor)',boxShadow:'1px 1px 4px 0px #8888',color:'var(--complimentYellow)',textAlign:'center',wordWrap:'break-word',textShadow:'1px 0px black, -1px -0px black, 0px 1px black, 0px -1px black, 1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black'}}>
                
                <input id='editDetailButton' data-hash='' type="button" value="Edit Details" onClick={e=>handleEditPerson(e)}
                    style={{fontSize:'15px', padding:'5px', width:'50%', boxShadow:'1px 1px 4px 0px #8888', margin:'5px',...styles}}/>

                <input type="button" value="Records" onClick={e=>handleNavToRecords(e)}
                    style={{fontSize:'15px', padding:'5px', width:'50%', boxShadow:'1px 1px 4px 0px #8888', margin:'5px',...styles}}/>

            </div>
        
        </div>

    </div>
  )
}

export default ModalView