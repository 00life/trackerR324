import { funcAuth_loadData, funcAuth_setData, funcAuth_getUID } from './Functions_Auth'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


export function func_snackbar(reference, message) {
// Shows an 3 sec animated notification at the bottom
  try{
    var x = reference?.current?.querySelector('#snackbar') ?? '';
    if(x === '')return // Guard-Clause

    x.innerHTML = message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  }catch(err){console.log('func_snackbar: ' + err)}
};

export async function func_savedata(data, name, path, reference, authstatus){
  
  try{
    // If ans is yes, it will save online
    let ans = window.confirm('Save online?');
    if(ans){

      // Guard-Clause if the user is not online
      if(!authstatus){
        func_snackbar(reference, 'Please sign-in to save online');
        return
      };
      // Saving Online to firebase
      let uid = funcAuth_getUID(authstatus);
      funcAuth_setData(`users/${uid}${path}`, data);
      return true;

    }else{

        // Check if the user is using a android or ios phone
        let browserArray = [];
        let findAgent = window.navigator.userAgent.toLowerCase();

        browserArray.push(findAgent?.match(/android/g) === null ? false : true);
        browserArray.push(findAgent?.match(/ios/g) === null ? false : true);
        let detectPhone = browserArray.some(val=>val);

      if(detectPhone){
        let ans = window.confirm('Save to Phone Documents?');
        
        if(ans){
          // If using a phone, get permission, then save to documents folder
          Filesystem.requestPermissions();

          // Saving data in Documents folder
          await Filesystem.writeFile({
            path: name,
            data: JSON.stringify(data),
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
            recursive: true
          });

          func_snackbar(reference, 'Saved in Documents'); 
          return false
        };
        

      }else{

        // If phone is not detected, it will save to the computer
        var string_data = JSON.stringify(data);
        var file = new File([string_data], {type:'text/csv;charset=utf-8'});
        let href_link = window.URL.createObjectURL(file);
        var anchor = window.document.createElement('a');
        anchor.setAttribute('href', href_link);
        anchor.setAttribute('download', name);
        anchor.click();
        URL.revokeObjectURL(href_link);
        return false
      }
  
    };
  
  }catch(err){
    func_snackbar(window.document,'Error Saving')
    console.log('func_savedata: ' + err)
  };
};


export function func_loaddata(path, callback, reference, authstatus){
  
  try{
    // If answer is yes, it will load from online
    let ans = window.confirm('Load from online?');

    if(ans){

      // Guard-Clause if the user is not online
      if(!authstatus){
        func_snackbar(reference, 'Please sign-in to load from online');
        return
      };

      // Loading from online firebase
      let authuid = funcAuth_getUID(authstatus);

      let callback2 = data => {
        callback(data)
      } ;; // Callback2 Host
      funcAuth_loadData(`users/${authuid}${path}`, callback2)

    }else{

       // If the answer is no, it will load from your computer
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
    }
  }catch(err){console.log('func_loaddata: ' + err)}
};


export function func_convertFrom24To12Format(time24){
// Converts 24:00 format into 12:00 AM/PM format
  try{

    const [sHours, minutes] = time24?.match(/([0-9]{1,2}):([0-9]{2})/)?.slice(1);
    const period = +sHours < 12 ? 'AM' : 'PM';
    const hours = +sHours % 12 || 12;
    return `${hours}:${minutes} ${period}`;

  }catch(err){console.log('func_convertFrom24To12Format: ' + err)};
};


export function func_cleanArray(array){
// Removes excess spaces from an array and capitalize the first letter
  try{

    let cleanArray = array.map(item=>item.trim());
    let filterArray = cleanArray.filter(item=>item!=='');
    let rmSpacesArray = filterArray
        .map(item=>item.split(' ')
          .map(item=>item.trim())
          .map(item=>item[0].toUpperCase()+item.slice(1,).toLowerCase())
          .filter(item=>item!=='')
          .join(' ')
        );
    return rmSpacesArray

  }catch(err){console.log('func_cleanArray: ' + err)}
};


export function func_stringBase64File(elem, callback){
// Converts an input file into base 64 data from your computer
  try{

    let file = elem.files[0];
    let reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result)
    }
    reader?.readAsDataURL(file);

  }catch(err){console.log('func_stringBase64File: ' + err)}
};


export const func_getBase64FromUrl = async url => {
// Converts URL data into base64 data
  try{

    const data = await fetch(url,{mode:'no-cors'});
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => {
        const base64data = reader.result;   
        resolve(base64data ?? '');
      }
    });

  }catch(err){console.log('func_getBase64FromUrl: ' + err)}
};


export function func_modalview(reference, id){
  try{

    let modal = reference.current.querySelector(id);
    let span = reference.current.querySelectorAll(".close")[0];
    modal.style.display = "block"

    span.onclick = function() {modal.style.display = "none"};

    window.onclick = function(event) {
      if (event.target === modal) {modal.style.display = "none"}
    };

  }catch(err){console.log('func_modelview: ' + err)}
};


export async function func_generateQR(data, type='svg'){
  var resp = '';
  try{

    if(type === 'svg'){    
      resp = await require('qrcode').toString(data);
    }else if(type === 'base64'){
      resp = await require('qrcode').toDataURL(data);
    }else if(type === 'canvas'){
      resp = await require('qrcode').toCanvas(data);
    };
    return resp

  }catch(err){console.error('func_generateQR: ' + err)};
};

export async function func1_saveLogCSV(logArray, saveName, reference){
  try{
    
    // Creating the String Array
    let string_entry = 'ACTION,DURATION,TIME,DATE,LASTNAME,FIRSTNAME\n' ;
    
    logArray.forEach(obj=>{
        let check = obj.duration !== '~' ? 'Checkin' : 'Checkout';
        string_entry += `${check},${obj.duration},${obj.time},${obj.date},${obj.lastname},${obj.firstname}\n`;
    });

    // Checking if using is using a phone
    let browserArray = [];
    let findAgent = window.navigator.userAgent.toLowerCase();

    browserArray.push(findAgent?.match(/android/g) === null ? false : true);
    browserArray.push(findAgent?.match(/ios/g) === null ? false : true);
    let detectPhone = browserArray.some(val=>val);

    if(detectPhone){
      // If using a phone, get permission, then save to documents folder
      Filesystem.requestPermissions();

      // Saving data in Documents folder
      await Filesystem.writeFile({
        path: saveName,
        data: string_entry,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true
      });

      func_snackbar(reference, 'Saved in Documents'); // Notification
      return false

    }else{

      let file = new File([string_entry], {type:'data:text/csv;charset=utf-8'});
      let href_link = URL.createObjectURL(file);
      let anchor = document.createElement('a');
      anchor.setAttribute('href', href_link);
      anchor.setAttribute('target','_blank');
      anchor.setAttribute('rel','noreferrer');
      anchor.setAttribute('download', saveName);
      anchor.click();
      URL.revokeObjectURL(href_link);

      return false

    };

  }catch(err){console.log('func1_saveLogCSV: ' + err)}
};