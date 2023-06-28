import React from 'react';
import { funcAuth_loadData } from '../context/Functions_Auth';
import { useAuth } from '../context/AuthContext';

function Copyright() {
    const {configuration} = useAuth();
    

    let handleSocialClick = async e => {
        if(configuration.pageLock)return // Guard-Clause lockpage
        
        let browserArray = [];
        let findAgent = window.navigator.userAgent.toLowerCase();
        
        // Check what browser version is being used
        browserArray.push(findAgent?.match(/electron/g) === null ? false : true);
        browserArray.push(findAgent?.match(/android/g) === null ? false : true);
        browserArray.push(findAgent?.match(/ios/g) === null ? false : true);
        
        let exitFunction = browserArray.some(val=>val);
        if(exitFunction)return // Guard-Clause 

        // If website, then links will be provided
        let myHrefLink = '#';
        let linkName = e.currentTarget.dataset.link;

        let promHrefLinks = await new Promise(resolve => {
            let callback = data => {
                if(data === '' || data === undefined || data === null)return // Guard-Clause
                resolve(data);
            } ;; // Callback Host
            funcAuth_loadData(`hrefLinks`, callback)
        });
        
        if(linkName === 'facebook'){
            myHrefLink = promHrefLinks.facebook
        }else if(linkName === 'twitter'){
            myHrefLink = promHrefLinks.twitter
        };

        let elem = document.createElement('a');
        elem.setAttribute('rel','noopener');
        elem.setAttribute('href', myHrefLink);
        elem.click();
    };

  return (
    <div style={{display:'flex', justifyContent:'center'}}>
        <div className="copyright" style={{
            width:'120%', 
            position: 'fixed', 
            bottom:'0', 
            outline: '1px solid black',
            zIndex:'3',
        }}>

            <div className="shareSocial" style={{
                display: 'flex',
                backgroundColor: 'var(--monochromaticWhite)',
                justifyContent: 'center',
                alignItems: 'center',
                height:'1rem',
            }}>

                {/* 'https://www.facebook.com/sharer.php?u='+link */}
                <span  data-link='facebook' onClick={e=>handleSocialClick(e)} style={{cursor:'pointer'}}>
                    <img alt='facebookIcon' src={require('./../images/iconFacebook.png')} style={{maxHeight:'15px', width:'auto', margin:'0 5px'}} />
                </span>
                
                &nbsp;

                {/* `https://twitter.com/share?url=${link}&text=${title}&via=${via}&hashtags=${hash}` */}
                <span  data-link='twitter' onClick={e=>handleSocialClick(e)} style={{cursor:'pointer'}}>
                    <img alt='twitterIcon' src={require('./../images/iconTwitter.png')} style={{maxHeight:'15px', width:'auto', margin:'0 5px'}}/>
                </span>
            
            </div>

            <div style={{
                color: 'white',
                backgroundColor:'black',
                fontSize: 'xx-small',
                border: '1 px solid rgba(255, 255, 255, 1)',
                textAlign:'center'
            }}>

                Copyright © <span id="year">{new Date().getFullYear()}</span> Tracker-R324 Reza Tahirkheli.  All Rights Reserved. 
            
            </div>

        </div>
    </div>
  )
}

export default Copyright