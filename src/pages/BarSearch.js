import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import InputBar from "../components/inputBar";
import Avatar from "../components/Avatar";


function BarSearch(){
    const {persons, reference} = useAuth();
    const [filterArray, setFilterArray] = useState([]);
    const [boolFilter, setBoolFilter] = useState(false);
    
    const handleSearch = e => {
        // Turn on search
        e.length > 0 ? setBoolFilter(true) : setBoolFilter(false);

        // Activating the filter
        let lowercase = e.toLowerCase();
        let cleanLetter = lowercase.replace(/[^\w\s]/gi, '');
        let filterFirstnameArray = persons.filter(item=>item.firstname.toLowerCase().match('^'+cleanLetter));
        let filterLastnameArray = persons.filter(item=>item.lastname.toLowerCase().match('^'+cleanLetter));
        let filterFinal = [...new Set([...filterFirstnameArray,...filterLastnameArray])];
        setFilterArray([...filterFinal]);
    };

    const handleSelect = e => {
        // Setting the scanInput to the hash value
        let hash = e.currentTarget.dataset.hash;
        reference.current.querySelector('#scanInput').value = hash;
        
        // Closing the ModalView
        reference.current.querySelector('.close').click();

        // Clear the inputBar Search
        reference.current.querySelector('#BarSearch_InputBar').value = '';
        setBoolFilter(false);

        reference.current.querySelector('#scanInput').focus();
        
    };

    return(
        <div>
            <div style={{backgroundColor:'var(--sec-backgroundColor)', padding:'5px', borderRadius:'5px', boxShadow:'1px 1px 4px 0px #8888', marginBottom:'5px'}}>
                <InputBar ids='BarSearch_InputBar' placeholder="Search Name" func_onChange={handleSearch}/>
            </div>
            <div style={{backgroundColor:'var(--main-backgroundColor)', borderRadius:'5px', boxShadow:'1px 1px 4px 0px #8888', display:'flex', paddingBottom:'20px'}}>
                &nbsp;
                {boolFilter && filterArray.map((obj,i)=>(
                    <div key={i} style={{margin:'5px'}}>
                        <Avatar hash={obj.hash} firstname={obj.firstname} lastname={obj.lastname} base64={obj.base64} func_function={handleSelect}/>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BarSearch