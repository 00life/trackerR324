import {HashRouter,Routes, Route, Navigate} from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Signup from './pages/Signup.js';
import Forgot from './pages/Forgot.js';
import Request from './pages/Request.js';
import Barcode from './pages/Barcode.js';
import Profile from './pages/Profile.js';
import Addperson from './pages/Addperson.js';
import Participants from './pages/Participants.js';
import Addlist from './pages/Addlist.js';
import EditPerson from './pages/EditPerson.js';
import R324Tracker from './pages/R324Tracker.js';
import AutoConfig from './pages/AutoConfig.js';
import Records from './pages/Records.js';

function App(){

  const { authstatus } = useAuth()
  const RequireAuth = ({children})=>{return (authstatus?.uid) ? children : <Navigate to="/login" />}

  return (
    <div>
      <HashRouter>
        <Routes>
          <Route exact path="/" element={<Home />}/>
          <Route exact path="/profile" element={<RequireAuth><Profile /></RequireAuth>}/>
          <Route exact path="/barcode" element={<Barcode />}/>
          <Route exact path="/login" element={<Login />}/>
          <Route exact path="/signup" element={<Signup />}/>
          <Route exact path="/addperson" element={<Addperson />}/>
          <Route exact path="/forgot" element={<Forgot />}/>
          <Route exact path="/participants" element={<Participants />}/>
          <Route exact path="/addlist" element={<Addlist />}/>
          <Route exact path="/editperson" element={<EditPerson />}/>
          <Route exact path="/request" element={<RequireAuth><Request /></RequireAuth>}/>
          <Route exact path="/R324Tracker" element={<R324Tracker />}/>
          <Route exact path="/autoconfig" element={<AutoConfig />}/>
          <Route exact path="/records" element={<Records />}/>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
