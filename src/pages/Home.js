import React, { useEffect } from 'react';
import Layout from '../context/Layout';
import { useAuth } from '../context/AuthContext';
import { funcAuth_loadData } from '../context/Functions_Auth';


function Home() {

  const {reference } = useAuth();

  useEffect(()=>{
    try{

      let callback = data => {
        if(data === '' || data === undefined || data === null)return // Guard-Clause
        const elem = reference.current.querySelector('#Home_insertHTML') ?? '';

        try{elem.innerHTML = data.news ?? ''}catch{};
        
      } ;; // Callback Host
      funcAuth_loadData('/NewForEveryone', callback);

    }catch{}
  },[reference]);


  return (
    <Layout>
      <data value='/'></data>
      <div id="Home_insertHTML"></div>
    </Layout>
  );
};

export default Home