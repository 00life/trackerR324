import React, {useEffect, useState} from 'react';
import Layout from "../context/Layout";
import { useAuth } from '../context/AuthContext';
import InputBar from "../components/inputBar";
import { printRecordContent } from '../context/Functions_3';

function Records(){
    const {persons, records, setRecords, reference} = useAuth();
    const [personSearchList, setPersonSearchList] = useState([]);

    var dataKeys = Object.keys(records);

    useEffect(()=>{
        (function inputRecords(){
            for(let i=0; i < dataKeys.length; i++){
                try{
                    let hash = dataKeys[i];
                    reference.current.querySelector(`#recordInfo${hash}`).value = records[hash]['info'];
                    reference.current.querySelector(`#recordTextarea${hash}`).value = records[hash]['textarea'];
                }catch{};
            };
        })();

        // Scroll to based on url 
        try{
            let hash = window.location.hash.split('#')[2];
            let elem = reference.current.querySelector(`#${hash}`);
            elem.scrollIntoView(true);
        }catch{}

    },[dataKeys])

    // Sorting the persons array into alphabetical order
    const persons_sort = persons.sort(function(a, b) {
        var textA = a.lastname.toLowerCase();
        var textB = b.lastname.toLowerCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });


    const handleHeight = e => {
        // Making the textarea boxes automatically adjust their size
        e.currentTarget.style.height = '';
        let elemScrollHeight = e.currentTarget.scrollHeight+1;
        e.currentTarget.style.height = elemScrollHeight+'px';
    };

    const handleEditTextarea = e => {
        
        // Highlighing the Edit button if the the textarea is editable
        let elemTextarea = e.currentTarget.parentNode.querySelector('textarea');
        let elemEditButton = e.currentTarget.parentNode.querySelector('label');
        let elemInput = e.currentTarget.parentNode.querySelector('input');
        elemEditButton.style.borderRadius= '5px';

        if(e.currentTarget.checked){
            elemInput.disabled = false;
            elemTextarea.disabled = false;
            elemEditButton.style.backgroundColor = 'var(--analogousGreen)';
            elemTextarea.style.height = '50vh';
        }else{
            elemInput.disabled = true;
            elemTextarea.disabled = true;
            elemEditButton.style.backgroundColor = '';
            elemEditButton.style.borderRadius= '';
            elemTextarea.style.height = '';
        };
    };

    const handleSearchNotes = e => {

        // Searching for person and opening a dropdown window

        let lowercase = e.toLowerCase();
        let cleanLetter = lowercase.replace(/[^\w\s]/gi, '')
        let filterFirstnameArray = persons.filter(item=>item.firstname.toLowerCase().match('^'+cleanLetter));
        let filterLastnameArray = persons.filter(item=>item.lastname.toLowerCase().match('^'+cleanLetter));
        let filterFinal = [...new Set([...filterFirstnameArray,...filterLastnameArray])];
       
        if(filterFinal.length !== persons.length && filterFinal.length < 10){
            setPersonSearchList(filterFinal);
            reference.current.querySelector('#record_searchOptions').style.display = 'block';
        }else{
            setPersonSearchList([]);
            reference.current.querySelector('#record_searchOptions').style.display = 'none';
        };
    };

    const handleScrollSearch = e => {

        // Scrolling to the correct element
        let hash = e.currentTarget.dataset.hash;
        let elemPersonBox = reference.current.querySelector(`#Note${hash}`);
        elemPersonBox.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        
        // Clicking on the search results
        let fullname = e.currentTarget.innerHTML;
        reference.current.querySelector('#record_searchBar').value = fullname;
        reference.current.querySelector('#record_searchOptions').style.display = 'none';
    };

    const handleSaveRecords = () =>{
        let records = {};
        
        // Collecting data and putting it into records variable
        for(let i=0; i < persons.length; i++){
            try{
                let infoData = reference.current.querySelector(`#recordInfo${persons[i].hash}`).value;
                let noteData = reference.current.querySelector(`#recordTextarea${persons[i].hash}`).value;
                records[persons[i].hash] = {
                    'info': infoData,
                    'textarea': noteData,
                };
            }catch{};
        };

        // Save in global useState()
        setRecords(records);

        // Creating a link with the data stored in it
        let file = new File([JSON.stringify(records)],{type:'text/csv;charset=utf-8'})
        let href_link = window.URL.createObjectURL(file);
        var anchor = window.document.createElement('a');
        anchor.setAttribute('href', href_link);
        anchor.setAttribute('download', 'RecordData.json');
        anchor.click();
        URL.revokeObjectURL(href_link);
    };

    const handleLoadRecords = () => {
        try{
            // Filling in elements with the data
            let callback = data => {
                let dataKeys = Object.keys(data);
                for(let i=0; i < dataKeys.length; i++ ){
                    try{
                        let hash = dataKeys[i];
                        reference.current.querySelector(`#recordInfo${hash}`).value = data[hash]['info'];
                        reference.current.querySelector(`#recordTextarea${hash}`).value = data[hash]['textarea'];
                    }catch{};
                };
                setRecords(data);
            };

            // Creating a file input element, so you can choose files
            const elem_input = document.createElement('input');
            elem_input.setAttribute('type', 'file');
            elem_input.click();
            elem_input.onchange = function(e){
                var file = e.currentTarget.files[0];
                var reader = new FileReader();
                reader.onloadend = function(){
                    var load = JSON.parse(reader.result);
                    callback(load);
                };
                reader.readAsText(file);
            };

        }catch(err){console.log('handleLoadRecords: ' + err)}
    };

    const handleSaveRecordInfo = (e, hash) =>{
        // Updating info records as the user types
        let newRecord = {};
        newRecord[hash] = {...records[hash],'info':e}
        setRecords({...records, ...newRecord});
        
    };

    const handleSaveRecordTextarea = (e, hash) => {
        // Updating textarea records as the user types
        let newRecord = {};
        newRecord[hash] = {...records[hash],'textarea': e.currentTarget.value};
        setRecords({...records, ...newRecord})
    };

    const handleWholePrint = () => {
        let dataKeys = Object.keys(records);
        let listHtml = [];
        for(let i=0; i < dataKeys.length; i++){
            try{
                let hash = dataKeys[i];
                let info = reference.current.querySelector(`#recordInfo${hash}`).value;
                let textarea = reference.current.querySelector(`#recordTextarea${hash}`).value;
                let name = reference.current.querySelector(`#recordName${hash}`).innerHTML;
                let addHtml = `<div>${name}&nbsp;(${info})</div><div>======</div><pre>${textarea}</pre></br></br>`;
                listHtml.push(addHtml);
            }catch{}
        };

        printRecordContent(listHtml.join(''))
    };

    const handlePartialPrint = hash => {
        
        let name = reference.current.querySelector(`#recordName${hash}`).innerHTML;
        let info = reference.current.querySelector(`#recordInfo${hash}`).value;
        let textarea = reference.current.querySelector(`#recordTextarea${hash}`).value;
        let addHtml = `<div>${name}&nbsp;(${info})</div><div>======</div><pre>${textarea}</pre></br></br>`;
        printRecordContent(addHtml);
    };


    return(
        <Layout>
            <data value='/record'></data>
            <div style={{display:'flex', height:'75vh',flexDirection:'column', alignItems:'center', backgroundColor:'var(--monochromaticWhite)', padding:'5px 5px', margin:'5px 5px', boxShadow:'1px 1px 4px 0px #8888', borderRadius:"5px",caretColor: "rgba(0,0,0,0)"}}>
                
                <div style={{display:'flex', alignItems:'center', justifyContent:'flex-start', width:'100%'}}>
                    
                    {/* Title */}
                    <h2 style={{color:'var(--main-textColor)'}}>Records</h2>
                    
                    {/* Spacer */}
                    <div style={{flexGrow:1}}>&nbsp;</div>
                    
                    {/* SearchBar */}
                    <div style={{flexGrow:.25, position:'relative'}}>
                        <InputBar placeholder="Search Person" ids="record_searchBar" func_onChange={handleSearchNotes}/>
                        
                        <div id="record_searchOptions" style={{display:'none', position:'absolute', backgroundColor:'white', boxShadow:'var(--main-boxShadow)', borderRadius:'5px', margin:'0 10px', padding:'5px'}}>
                        
                            {personSearchList.map((p,i)=>{return (
                                <div key={i} style={{cursor:'pointer'}}>
                                    <span data-hash={p.hash} onClick={e=>handleScrollSearch(e)} onMouseOver={e=>e.currentTarget.setAttribute('style','background-color:var(--triadicGreen)')} onMouseOut={e=>e.currentTarget.setAttribute('style','background-color:white')}>
                                        {[p.lastname, p.firstname].filter(elm=>elm).join(', ')}
                                    </span>
                                </div>
                            )})}
                        
                        </div>
                    </div>
                    
                    {/* Upload Records */}
                    <div onClick={()=>handleLoadRecords()} style={{display:'flex', flexDirection:'column', justifyContent:'center', fontSize:'x-small', fontWeight:'bold', cursor:'pointer'}}>
                        <div style={{textAlign:'center'}}>Load</div>
                        <svg height="40" viewBox="0 -960 960 960" width="40"><path d="M447.667-206h67.666v-195.334l78 78 47-47.666-160.666-156.666-158 157.999L369-322l78.667-79.334V-206ZM236-50.667q-42.425 0-74.212-31.087Q130-112.842 130-156.666v-646.668q0-44.099 31.788-75.382Q193.575-910 236-910h349l245.666 243.666v509.668q0 43.824-31.983 74.912Q766.7-50.667 724-50.667H236Zm293.668-561.334v-191.333H236v646.668h488v-455.335H529.668ZM236-803.334v191.333-191.333 646.668-646.668Z"/></svg>
                    </div>

                    {/* Save Records */}
                    <div onClick={()=>handleSaveRecords()} style={{display:'flex', flexDirection:'column', justifyContent:'center', fontSize:'x-small', fontWeight:'bold', cursor:'pointer'}}>
                        <div style={{textAlign:'center'}}>Save</div>
                        <svg height="40" viewBox="0 -960 960 960" width="40"><path d="M196.666-90.667q-44.574 0-75.287-30.712-30.712-30.713-30.712-75.287v-566.668q0-44.849 30.712-75.757Q152.092-870 196.666-870h497.667L870-694.333v199.001L763.334-388.666v-260.065l-114.72-114.603H196.666v566.668h376.001L466.002-90.667H196.666ZM479.745-253q45.588 0 77.755-31.912 32.166-31.911 32.166-77.499 0-45.589-31.911-77.755-31.912-32.167-77.5-32.167T402.5-440.421q-32.166 31.912-32.166 77.5t31.911 77.754Q434.157-253 479.745-253ZM245-565.667h360V-715H245v149.333Zm321 553V-98l236.334-235.333 84.332 83.666-235.333 237H566Zm348.333-263L830.667-361l36-37q10.972-10.666 23.848-10.666T914-398l36 36q10.666 10.8 10.666 25.424 0 14.623-10.666 25.242l-35.667 35.667Zm-717.667 79.001v-566.668 566.668Z"/></svg>
                    </div>

                    {/* Print Records */}
                    <div onClick={()=>handleWholePrint()} style={{display:'flex', flexDirection:'column', justifyContent:'center', fontSize:'x-small', fontWeight:'bold', cursor:'pointer'}}>
                        <div style={{textAlign:'center'}}>Print</div>
                        <svg height="40" viewBox="0 -960 960 960" width="40"><path d="M642.667-674.667v-89H317.333v89H211.334v-195.666h537.999v195.666H642.667ZM155.333-568.001H804.667 155.333Zm557.334 123.666q20.334 0 33.667-12.812 13.333-12.812 13.333-33.187 0-20-13.062-33.833Q733.542-538 712.501-538q-20.167 0-33.333 13.749-13.167 13.75-13.167 34.083 0 19.834 13.167 32.834 13.166 12.999 33.499 12.999Zm-70 268.002v-114.002H317.333v114.002h325.334ZM749.333-76.001H211.334v-188.667h-162v-269.333q0-58.433 39.958-99.549Q129.25-674.667 187-674.667h586q58.891 0 98.612 41.117 39.721 41.116 39.721 99.549v269.333h-162v188.667Zm55.334-295.332v-164.693q0-13.028-9.533-22.501-9.534-9.474-22.721-9.474H187.234q-12.226 0-22.063 9.792-9.838 9.792-9.838 23.542v163.334h56.001V-397h537.999v25.667h55.334Z"/></svg>
                    </div>

                </div>

                <hr style={{width:'100%'}}/>
                
                <div id="record_scrollWindow" style={{flexGrow:1, width:'100%', overflowY:'scroll'}}>
                

                    {persons_sort.map((p,i)=>{return(
                    
                        <div key={i} style={{border:'1px solid #8888', borderRadius:'5px', padding:'5px', marginBottom:'5px', backgroundColor: i%2 ? 'var(--sec-backgroundColor)':'var(--main-backgroundColor)'}}>

                            <div id={`Note${p.hash}`} style={{display:'flex', alignItems:'center'}}>
                                <span><b>Name:</b>&nbsp;</span>
                                <span id={`recordName${p.hash}`}>{[p.lastname, p.firstname].filter(elm=>elm).join(', ')}</span>

                                &nbsp;&nbsp;
                                <InputBar ids={`recordInfo${p.hash}`} placeholder="Info..." func_onChange={e=>handleSaveRecordInfo(e, p.hash)} disabled={true}/>
                                
                                <div style={{flexGrow:1}}>&nbsp;</div>
                                
                                {/* Edit Button icon */}
                                <label htmlFor={`input_textarea${p.hash}`}>
                                    <div style={{border:'1px solid #8888', borderRadius:'5px', padding:'5px', cursor:'pointer'}}>
                                        <svg height="24" viewBox="0 -960 960 960" width="24"><path d="M203-193h47l333-334-47-47-333 334v47Zm586-391L593-779l28-29q40-41 96-41.5t96 39.5l28 29q34 32 31.5 74T840-635l-51 51Zm-57 57L294-88H97v-196l439-438 196 195Zm-171-23-25-24 47 47-22-23Z"/></svg>
                                    </div>
                                </label>

                                {/* Print Participant Button Icon */}
                                <div onClick={()=>handlePartialPrint(p.hash)} style={{border:'1px solid #8888', borderRadius:'5px', padding:'5px', cursor:'pointer', marginLeft:'5px'}}>
                                    <svg height="24" viewBox="0 -960 960 960" width="24"><path d="M630-678v-75H330v75H194v-211h572v211H630ZM164-542h632-632Zm526 139q25 0 42-16.812 17-16.813 17-42.188 0-25-16.688-42.5Q715.625-522 689.5-522q-24.5 0-42 17.375T630-461.5q0 24.5 17.5 41.5t42.5 17Zm-60 220v-64H330v64h300ZM766-54H194v-180H28v-280q0-68 47.042-116Q122.083-678 189-678h582q68.175 0 114.588 48Q932-582 932-514v280H766v180Zm30-316v-145.616q0-10.434-7.475-18.409T770-542H189.234q-9.859 0-17.546 8.385Q164-525.23 164-514.4V-370h30v-13h572v13h30Z"/></svg>
                                </div>

                            </div>

                            <input id={`input_textarea${p.hash}`} type='checkbox' onChange={(e)=>handleEditTextarea(e)} style={{display:'none', caretColor:'black'}}/>
                            <textarea id={`recordTextarea${p.hash}`} style={{width:'100%', marginTop:'5px', overflowY:'hidden', fontSize:'1rem', caretColor:'black'}} onChange={e=>{handleHeight(e); handleSaveRecordTextarea(e, p.hash)}} placeholder='Enter Notes Here...' disabled></textarea>
                        </div>
                    )})}
                    
                </div>

            </div>
        </Layout>
    );
};

export default Records