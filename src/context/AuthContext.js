import React, { useContext, useRef, useState, useEffect } from "react";
import { func_signup, func_signin, func_logout, useAuthStatus, funcAuth_loadData, funcAuth_getUID} from "./Functions_Auth";
import { func_snackbar} from "./Functions_1";
import { func2_autoLoadOnlinePersons, func2_autoLoadFilePerson, func2_autoLoadRecords} from "./Functions_2";
import { funcAuto_localStorageAutoConfig, funcAuto_cleanYesterdaysRequests, funcAuto_profileLoadOnline, funcAuto_electronLoadAutoConfig, funcAuto_capacitorLoadAutoConfig } from "./Functions_Autoload";
import { func3_requestNotify } from "./Functions_3";
import { func4_acceptAllRequests, func4_phoneBackHandler} from "./Functions_4";

const AuthContext = React.createContext();
export function useAuth(){return useContext(AuthContext)};

export function AuthProvider({children}){
  const reference = useRef();
  const authstatus = useAuthStatus();
  const authuid = funcAuth_getUID(authstatus);

  const [persons, setPersons] = useState([]);
  const [logArray, setLogArray] = useState([]);
  const [outPeople, setOutPeople] = useState([]);
  const [backPeople, setBackPeople] = useState([]);
  const [profileData, setProfileData] = useState({lastname:'', firstname:'', email:'', base64:'', schedule:[], contactList:[]});
  const [requestNotify, setRequestNotify] = useState(false);
  const [watchUpdate, setWatchUpdate] = useState('');
  const [watchListen, setWatchListen] = useState(0);
  const [watchList, setWatchList] = useState([]);
  const [records, setRecords] = useState({});

  const [configuration, setConfiguration] = useState({
    onlineLoadParticipant: false, rateLimit: 0, timeLimit: 0, toggleAccept: true, 
    pageLock: false, pageLockPass: 'trackerR324',
    participantsWin: false, logWin: false, recordWin: false,
    participantsLin: false, logLin: false, recordLin: false,
    participantsPhone: false, logPhone: false, recordPhone: false,
  });
  
  useEffect(()=>{
    try{

      funcAuto_cleanYesterdaysRequests(authstatus); // Clear all requests yesterday
      func4_phoneBackHandler(); // Android Back Button Handler
      
    }catch{}
  },[]);

  useEffect(()=>{
    try{

      funcAuto_localStorageAutoConfig(configuration, setConfiguration); // Load from localStorage Memory
      funcAuto_electronLoadAutoConfig(configuration, setConfiguration); // Electon Load from Computer
      funcAuto_capacitorLoadAutoConfig(configuration, setConfiguration); // Capacitor Load from Phone
      
      func2_autoLoadOnlinePersons(persons, setPersons, authstatus, configuration); // Setting the Auto-Loading Online Participants
      func2_autoLoadFilePerson(persons, setPersons, configuration) // Load participants from phone, computer, or server
      func2_autoLoadRecords(setRecords, configuration) // Loading records from phone, computer or server
       
    }catch{}
  },[JSON.stringify(configuration)]);

  useEffect(()=>{
    try{

      funcAuto_profileLoadOnline(authstatus, setProfileData) // Loading Profile from online

    }catch{}
  },[authstatus]);

  useEffect(()=>{
    try{

      // Listening for changes in the number of requests
      let callback = data =>{
        if(data === '' || data === null || data === undefined)return // Guard-Clause
        let dataVal = Object?.values(data);
        
        setWatchUpdate(dataVal.length)
      } ;; // Callback Host
      funcAuth_loadData(`users/${authuid}/requests`, callback)

      //functions to run after the request number changes
      func4_acceptAllRequests(authstatus, configuration, setRequestNotify); // Enable autoaccept requests 
      func3_requestNotify(setRequestNotify, authstatus); // Enables notification on new requests

    }catch{}
  
  },[authstatus, watchUpdate]);

  useEffect(()=>{
    try{

      // Listening on the watchList
      let callback = data =>{
        if(data === undefined || data === null)return // Guard-Clause
        let dataVal = Object?.values(data);
        setWatchListen(dataVal.length)
        setWatchList(dataVal)
      } ;; // Callback Host
      funcAuth_loadData(`users/${authuid}/watch`, callback)

      // Check if 'watchlist person' is in the 'participants array'
      if(watchListen > 1){
        let person = watchList.at(-1);
        let findPerson = persons.find(obj=>obj.hash === person.hash) ?? '';
        if(findPerson === '' || findPerson === undefined || findPerson === null){
          func_snackbar(reference, 'Adding to Participants');
          setPersons([...persons, person]);
        };
      };

    }catch{}
  },[authstatus, watchListen]);
  
  return (
    <AuthContext.Provider value={{
      func_signup,
      func_signin,
      func_logout,
      func_snackbar,
      reference,
      authstatus,
      persons,
      setPersons,
      logArray,
      setLogArray,
      configuration,
      setConfiguration,
      outPeople, 
      setOutPeople,
      backPeople,
      setBackPeople,
      profileData,
      setProfileData,
      requestNotify,
      setRequestNotify,
      watchUpdate,
      setWatchUpdate,
      records,
      setRecords,
    }}>
      
      {children}

    </AuthContext.Provider>
  );

};