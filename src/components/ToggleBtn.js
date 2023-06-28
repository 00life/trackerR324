import React from 'react';
import './ToggleBtn.css';

function ToggleBtn({func_onToggle, check, ids}) {


  return (
    <div>
        <label className="switch">
            <input id={ids} type="checkbox" onChange={e=>func_onToggle(e)} checked={check} />
            <span className="slider round"></span>
        </label>
    </div>
  )
}

export default ToggleBtn