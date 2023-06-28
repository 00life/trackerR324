import { useState, useEffect } from "react";
import { auth } from "./Firebase";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    updateEmail,
    updateProfile

} from "firebase/auth";

import {set, ref, onValue, update, child, push} from 'firebase/database';
import {db} from './Firebase';


export async function func_signup(email, password){
    try{await createUserWithEmailAndPassword(auth, email, password);
    }catch(error){console.log('Functions_Auth - func_signup: '+error)}
};

export async function func_signin(email, password){
    try{return await signInWithEmailAndPassword(auth, email, password);
    }catch(error){console.log('Functions_Auth - func_signin: '+ error)}
};

export async function func_logout(){
    try{return await signOut(auth);
    }catch(error){console.log('Functions_Auth - func_logout: '+error);}
};

export function useAuthStatus(){
  
    const [currentUser, setCurrentUser] = useState({});
    useEffect(()=>{
        try{
            
            const unsubscribe = onAuthStateChanged(auth, user=>setCurrentUser(user));
            return unsubscribe

        }catch(err){console.log('func_logout: ' + err)}
    },[])
    
    if (currentUser === undefined || currentUser === null){
        return ''
    }else{
        return currentUser
    }
};


export function func_reset(email){
    try{

        return sendPasswordResetEmail(auth, email);
    
    }catch(err){console.log('func_reset: ' + err)}
};

// export function updatePassword(password){
//     return currentUser.updatePassword(password);
// };

// function updateProfile(displayName, photoURL){
//     return currentUser.updateProfile({displayName, photoURL});
// };

// function emailLink(email, code){
//     return auth.signInWithEmailLink(email, code);
// };

export function funcAuth_setData(path, obj){
    try{
        return set(ref(db, path), obj)
    }catch(err){console.log('funcAuth_setData: ' + err)}
};

export function funcAuth_updateData(path, obj){
    try{
        const newPostKey = push(child(ref(db), 'posts')).key;
        const myUpdate = {};
        myUpdate[newPostKey] = {...obj, key: newPostKey};
        return update(ref(db, path), myUpdate)
    }catch(err){console.log('funcAuth_setData: ' + err)}
};

export function funcAuth_loadData(path, callback){
    try{
        const myref = ref(db, path);
        onValue(myref, snapshot=>
            // Ternary Operator to return the data through a callback
            (snapshot.val() === undefined || snapshot.val() === null) 
                ? callback('')
                : callback(snapshot.val())
        );
    }catch(err){console.log('funcAuth_loadData: ' + err)}
};

export function funcAuth_updateEmail(myEmail){
    try{
        updateEmail(auth.currentUser, myEmail);
        return myEmail
    }catch(err){console.log('funcAuth_updateEmail: ' + err)}
};

export function funcAuth_updateProfile(obj){
    try{
        updateProfile(auth.currentUser, {...obj});
        return obj
    }catch(err){console.log('funcAuth_updateProfile: ' + err)}
};

export function funcAuth_getUID(authstatus){
    try{
        // Check LocalStorage first
        let uidLS = window?.localStorage?.getItem('uid') ?? '';
        if(uidLS !== '' || uidLS !== undefined ){return uidLS}

        // If LocalStorage fails, then check authstatus
        let newUidLS = authstatus?.uid ?? '';
        if(newUidLS !== '' || newUidLS !==undefined){
            // Set uid to LocalStorage
            window.localStorage.setItem('uid', JSON.parse(JSON.stringify(newUidLS))); 
            return newUidLS
        
        // If authstatus fails then check auth 
        }else{
            let TRIES = 10;
            let DELAY = 100;
            let time = 100

            for(let i=0; i < TRIES; i++){
                let callback = uid => {
                    if(uid){
                        clearTimeout(timeout);
                        // Set uid to LocalStorage
                        window.localStorage.setItem('uid', JSON.parse(JSON.stringify(uid)));
                        return uid
                    }else{
                        clearTimeout(timeout);
                        return ''
                    }
                } ;; // Callback Host
                let timeout = setTimeout(()=>callback(auth?.currentUser?.uid), time);
                time += DELAY;
            };
            return ''
        };
    }catch(err){console.log('funcAuth_getUID: ' + err)}
};