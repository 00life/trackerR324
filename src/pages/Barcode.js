import React, { useEffect, useState } from 'react';
import Layout from '../context/Layout';
import { useAuth } from '../context/AuthContext';
import InputBar from '../components/inputBar';
import ModalView from '../components/ModalView';
import { func_modalview, func_snackbar } from '../context/Functions_1';
import { func2_playAudio, func2_visualEffect } from '../context/Functions_2';
import { func3_dateFormat, func3_handleHashWatch, func3_timeFormatAMPM } from '../context/Functions_3';
import BarSearch from './BarSearch';
import BarTrack from './BarTrack';
import { funcAuto_desktopAutosave } from '../context/Functions_Autoload';
import { func4_appendPhoneSave } from '../context/Functions_4';



function Barcode() {
  const { persons, logArray, setLogArray, outPeople, setOutPeople, backPeople, setBackPeople, configuration, authstatus, reference } = useAuth();
  const [modalSwitch, setModalSwitch] = useState('');

  useEffect(() => {
    try{

      // Setting the inputbar to focus and the configurations
      reference.current.querySelector('#scanInput').focus();

      if(configuration.rateLimit !==0 && outPeople.length > configuration.rateLimit){
        setLogArray([...logArray.slice(0,-1)]);
        setOutPeople([...outPeople.slice(0,-1)]);

        func2_playAudio('stop');
        func2_visualEffect(reference, 'rateLimitVisual', 'tomato');
      };
      
  }catch{}
    
  }, [reference, logArray]);


  const handleScan = () => {
    // test hash: 73e20606cb1ee1325585ae4235364c20
    // test hash: e7a8a30c1d18ba15481d407b6c9fa0fc

    try {
      // Collecting and refining the input
      let hash = reference.current.querySelector('#scanInput').value;
      hash = hash.trim(); // Trim space from the beginning and end
      hash = hash.replace(/\s/g, ''); // Remove spaces
      hash = hash.replace(/\n/g, ''); // Remove newline
      hash = hash.slice(0, 32); // Slice the first 32 characters

      // Activating the function
      if (hash.length >= 32) {

        // Collecting data to pass
        let date = new Date();
        let person = persons.filter(obj => obj.hash === hash)[0];
        let filterPerson = logArray.filter(obj => obj?.hash === person?.hash);
        let LogNumber = filterPerson.length;
        let duration;

        // Tracking who is out and who came back
        if (LogNumber % 2 !== 0) {
          
          duration = Math.round((date.getTime() - filterPerson.filter(obj => obj.number === LogNumber - 1)[0].timestamp) / 1000 / 60);
          let filterPeople = outPeople.filter(obj => obj.hash !== hash);
          setBackPeople([...backPeople, { hash: hash, base64: person.base64, firstname: person.firstname, lastname: person.lastname, duration: duration }]);
          setOutPeople([...filterPeople]);
          
          // Play audio back beep
          func2_playAudio('back');

          // Add hash to the watchlist when participant leaves
          func3_handleHashWatch('leave', hash, authstatus);

        } else {

          duration = '~';
          let filterPeople = backPeople.filter(obj => obj.hash !== hash);
          setOutPeople([...outPeople, { hash: hash, base64: person.base64, firstname: person.firstname, lastname: person.lastname, timestamp: date.getTime() }]);
          setBackPeople([...filterPeople]);
         
          // Play audio go beep
          func2_playAudio('go');

          // Add hash to the watchlist when the participant arrives
          func3_handleHashWatch('arrive', hash, authstatus);
        };

        // Creating the log Array
        if (person !== undefined) {
          let obj = {
            hash: person.hash,
            firstname: person.firstname,
            lastname: person.lastname,
            number: LogNumber,
            time: func3_timeFormatAMPM(date),
            date: func3_dateFormat(date),
            timestamp: date.getTime(),
            duration: duration,
          };
          setLogArray(prev => [...prev, obj]);
        };

        // Clear inputs
        reference.current.querySelector('#scanInput').value = '';

        //Desktop autosave
        let string_entry = `${duration === '~' ? 'checkin':'checkout'},${duration}min,${func3_dateFormat(date)},${func3_timeFormatAMPM(date)},${person.lastname},${person.firstname}\n`;
        funcAuto_desktopAutosave(configuration, string_entry);

        //Phone autosave
        func4_appendPhoneSave(configuration, string_entry, reference);
      };

    } catch (err) {
      func_snackbar(reference, 'Person does not exist'); // Notification

      // Clear Input
      reference.current.querySelector('#scanInput').value = '';
      console.log('handleScan: ' + err)
    };
  };

  const handleRateLimit = () => {
  // opening modal for Time and Rate Limit

    setModalSwitch('BarTrack');
    func_modalview(reference, '#myModal');
  };

  const handleSearchName = () => {
  // Opening modal for searching for participants

    try {
      setModalSwitch('BarSearch');
      func_modalview(reference, '#myModal');
      setTimeout(() => {reference.current.querySelector('#BarSearch_InputBar').focus() }, 100);
    } catch (err) { console.log('handSearchName: ' + err) }
  };

  const handleDeleteLogEntry = e =>{
  // Search and delete Log entry by timestamp
  
    try{
      if(configuration.pageLock)return // Guard-Clause lockpage

      let timestamp = e.currentTarget.dataset.timestamp;

      let filterLogArray = logArray.filter(obj=>(String(obj.timestamp) !== String(timestamp)));
      let filterBackPeople = backPeople.filter(obj=>(String(obj.timestamp) !== String(timestamp)));
      let filterOutPeople = outPeople.filter(obj=>(String(obj.timestamp) !== String(timestamp)));
      setLogArray([...filterLogArray]);
      setBackPeople([...filterBackPeople]);
      setOutPeople([...filterOutPeople]);

    }catch(err){console.log('handleDeleteLogEntry: ' + err)}
  };

  return (
    <Layout>
      <data value='/barcode'></data>

      {/* Visual Confirmation of the rateLimit */}
      <div id='rateLimitVisual' style={{ display: 'none', position: 'absolute', backgroundColor: '', opacity: 0.25, width: '100%', height: '100%' }}></div>

      <div>

        <ModalView ids={"myModal"} footer={'Edit'} styles={{ display: 'none' }}
          header={
            (modalSwitch === 'BarSearch') ? 'Search by Name' :
              (modalSwitch === 'BarTrack') ? 'Tracking' : ''
          }>

          {
            (modalSwitch === 'BarSearch') ? <BarSearch /> :
              (modalSwitch === 'BarTrack') ? <BarTrack /> : ''
          }
        </ModalView>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2px', boxShadow: "1px 1px 4px 0px #8888", backgroundColor: 'var(--sec-backgroundColor)', marginBottom: '2px' }}>

          <div style={{ flexGrow: 1, display: 'flex', flexWrap: 'nowrap' }}>

            {/* Scan code input */}
            <div style={{ flexGrow: 1 }}>
              <InputBar ids='scanInput' placeholder='Scan code here' func_onChange={handleScan} />
            </div>

            {/* Clear input button */}
            <svg onClick={() => reference.current.querySelector('#scanInput').value = ''}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', transform: 'translate(-600%,50%)', right: 0, cursor: 'pointer' }}
              height="24" width="24"><path d="m12.025 14.375-4.45 4.45q-.5.5-1.2.5t-1.2-.5q-.5-.5-.5-1.188 0-.687.5-1.187l4.45-4.475-4.45-4.45q-.5-.5-.5-1.188 0-.687.5-1.187.475-.5 1.175-.5.7 0 1.2.5L12 9.6l4.425-4.45q.5-.5 1.2-.5t1.2.5q.5.5.5 1.2t-.5 1.2L14.375 12l4.45 4.45q.5.5.5 1.2t-.5 1.175q-.475.5-1.175.5-.7 0-1.175-.5Z" /></svg>

          </div>


          {/* Search Name Button */}
          <button onClick={() => handleSearchName()} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--tetradicGreen)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--analogousGreen)'}
            style={{ cursor: 'pointer', backgroundColor: 'var(--analogousGreen)', borderRadius: '5px', padding: '5px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <svg height="24" width="24"><path d="m18.45 21.025-5.3-5.325q-.725.475-1.725.775-1 .3-2.15.3-3.05 0-5.175-2.125T1.975 9.475q0-3.05 2.125-5.175t5.175-2.125q3.05 0 5.175 2.125t2.125 5.175q0 1.175-.287 2.125-.288.95-.788 1.675l5.375 5.4q.475.475.463 1.162-.013.688-.488 1.188-.5.475-1.2.475t-1.2-.475Zm-9.175-7.65q1.65 0 2.775-1.113 1.125-1.112 1.125-2.787 0-1.65-1.125-2.775T9.275 5.575Q7.6 5.575 6.488 6.7 5.375 7.825 5.375 9.475q0 1.675 1.113 2.787 1.112 1.113 2.787 1.113Z" /></svg>
            Name
          </button>

          {/* Tracking Button */}
          <button onClick={() => handleRateLimit()} style={{ margin: '5px', padding: '4px', cursor: 'pointer' }}>
            <svg height="24" width="24"><path d="M13.6 5.075q-1.05 0-1.775-.725-.725-.725-.725-1.75 0-1.05.725-1.763Q12.55.125 13.6.125q1.025 0 1.738.712.712.713.712 1.763 0 1.025-.712 1.75-.713.725-1.738.725Zm.425 18.45q-.625 0-1.062-.438-.438-.437-.438-1.062V17.25L11.2 15.975l-.175.775q-.3 1.35-1.45 2.113-1.15.762-2.525.462l-3.25-.65q-.625-.125-.95-.65-.325-.525-.2-1.15.15-.6.65-.95t1.1-.2l3.4.7L9.15 9.55l-.9.35V12q0 .625-.438 1.062-.437.438-1.062.438t-1.075-.438q-.45-.437-.45-1.062v-1.8q0-1.025.587-1.888Q6.4 7.45 7.35 7.05l2.325-.925q1-.4 1.475-.538.475-.137.875-.137.675 0 1.213.35.537.35.887.925l1.05 1.625q.475.725 1.25 1.262.775.538 1.825.763.575.1.95.512.375.413.375.963 0 .7-.5 1.162-.5.463-1.15.363-1.275-.225-2.3-.725t-1.8-1.2l-.35 1.9 1 .95q.5.5.775 1.138.275.637.275 1.312v5.275q0 .625-.437 1.062-.438.438-1.063.438Z" /></svg>
            {/* Number of outPeople */}
            {outPeople.length}
          </button>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column-reverse', flexWrap:'wrap'}}>
          {logArray.map((obj, i) => (
            <div key={i} style={{ boxShadow: '1px 1px 4px 0px #8888', margin: '2px 5px', borderRadius: '5px', backgroundColor: (i % 2 === 0) ? 'var(--monochromaticWhite)' : 'var(--main-backgroundColor)' }}>

              {obj.number % 2 === 0
                ? <span style={{ color: 'black', fontSize: '20px' }}>»</span>
                : <span style={{ color: 'blue', fontSize: '20px' }}>«</span>
              }

              <span>&nbsp;</span>

              <span style={configuration.timeLimit === 0
                ? { color: 'black', fontWeight:'normal' }
                : obj.duration > configuration.timeLimit
                  ? { color: 'red', fontWeight: 'bold' }
                  : { color: 'black', fontWeight:'normal' }}>
                {obj.duration}
              </span>

              <span style={{fontSize:'10px'}}>&nbsp;min&nbsp;::&nbsp;</span>
              <span>{obj.time}</span>
              <span>&nbsp;::&nbsp;</span>
              <span>{obj.date}</span>
              <span>&nbsp;::&nbsp;</span>
              <span>{obj.lastname}&nbsp;{obj.firstname}</span>
              <span style={{float:'right', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center'}}>
                <svg data-timestamp={obj.timestamp} onClick={(e)=>handleDeleteLogEntry(e)} height="24" width="24"><path d="M7.2 21.3q-1.05 0-1.75-.7t-.7-1.75V5.9h-1V3.75h5.2V2.675h6.15V3.75h5.2V5.9h-1v12.95q0 1.025-.713 1.737-.712.713-1.737.713Zm9.95-15.4H6.9v12.95q0 .125.088.212.087.088.212.088h9.65q.1 0 .2-.1t.1-.2ZM8.875 17.125h2.15v-9.2h-2.15Zm4.15 0h2.15v-9.2h-2.15ZM6.9 5.9V19.15v-.3Z"/></svg>
              </span>

            </div>
          ))}
        </div>
      </div>

    </Layout>
  )
}

export default Barcode