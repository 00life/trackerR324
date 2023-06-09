import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputBar from '../components/inputBar';
import { useAuth } from '../context/AuthContext';
import Layout from '../context/Layout';

function Signup() {
    const { func_signup, func_snackbar, reference } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleSubmit = async e =>{
        e.preventDefault();
        try{
            if(password === confirm){
                await func_signup(email, password);
                navigate('/');
            }else{
                func_snackbar(reference,'Passwords do not match'); // Notification
            };
        }catch(error){console.log(error)}
    }

  return (
    <Layout>
        <data value='/signup'></data>
        <div style={{display:'flex', justifyContent:'center', backgroundColor:'#ffffff', padding:'20px 0px', margin:'10px 20px', boxShadow:'1px 1px 4px 0px #8888', borderRadius:"5px",caretColor: "rgba(0,0,0,0)"}}>
            <form onSubmit={e=>handleSubmit(e)}>
                <table>
                    <tbody>
                        <tr style={{boxShadow:"1px 1px 4px 0px #8888", borderRadius:'5px'}}>
                            <td>
                                <div style={{padding:"10px"}}>
                                    <InputBar type={"email"} placeholder={"Email *"} func_onChange={setEmail} required/>
                                    <InputBar type={"password"} placeholder={"Password *"} func_onChange={setPassword} required/>
                                    <InputBar type={"password"} placeholder={"Confirm Password *"} func_onChange={setConfirm} required/>
                                </div>
                            </td>
                            <td>
                                <button type="submit" style={{boxShadow:'1px 1px 4px 0px #8888', marginRight:"10px"}}>
                                    <svg width="60px" height="60px" viewBox="0 0 256 256" id="Flat">
                                    <path d="M224,56V200a7.99977,7.99977,0,0,1-8,8H40a7.99977,7.99977,0,0,1-8-8V56a7.99977,7.99977,0,0,1,8-8H216A7.99977,7.99977,0,0,1,224,56Z" opacity="0.1"/>
                                    <path d="M184,104v32a8.00039,8.00039,0,0,1-8,8H99.314l10.34327,10.34277a8.00053,8.00053,0,0,1-11.31446,11.31446l-24-24c-.05664-.05664-.10449-.11768-.15869-.17578-.12549-.13282-.251-.26514-.36719-.40625-.0913-.11084-.17138-.22706-.25537-.3418-.07031-.09522-.14453-.188-.21093-.28662-.085-.12647-.15918-.25782-.23584-.38819-.05567-.09423-.11524-.186-.167-.2832-.06933-.12891-.12841-.26172-.18994-.39355-.04931-.10547-.10205-.209-.147-.31641-.05225-.12695-.09522-.25586-.14063-.38477-.042-.11816-.0874-.23437-.124-.355-.03906-.1289-.06787-.25976-.10058-.39013-.03077-.12305-.06543-.24414-.09034-.36914-.02978-.15186-.04834-.30469-.06933-.45752-.01465-.106-.03516-.20948-.0459-.3169a8.02276,8.02276,0,0,1,0-1.584c.01074-.10742.03125-.21094.0459-.3169.021-.15283.03955-.30566.06933-.45752.02491-.125.05957-.24609.09034-.36914.03271-.13037.06152-.26123.10058-.39013.03662-.12061.082-.23682.124-.355.04541-.12891.08838-.25782.14063-.38477.04492-.10742.09766-.21094.147-.31641.06153-.13183.12061-.26464.18994-.39355.05176-.09717.11133-.189.167-.2832.07666-.13037.15087-.26172.23584-.38819.0664-.09863.14062-.1914.21093-.28662.084-.11474.16407-.231.25537-.3418.11622-.14111.2417-.27343.36719-.40625.0542-.0581.10205-.11914.15869-.17578l24-24a8.00053,8.00053,0,0,1,11.31446,11.31446L99.314,128H168V104a8,8,0,0,1,16,0Zm48-48V200a16.01833,16.01833,0,0,1-16,16H40a16.01833,16.01833,0,0,1-16-16V56A16.01833,16.01833,0,0,1,40,40H216A16.01833,16.01833,0,0,1,232,56ZM216.00977,200,216,56H40V200H216.00977Z"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </form>
        </div>
        
    </Layout>
  )
}

export default Signup