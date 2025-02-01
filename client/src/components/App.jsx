import React from "react";
// import RegistrationForm from "./register";
import RegistrationForm from "./regupd";
import LoginForm from "./Login";
import { Router,Routes,Route } from 'react-router-dom'
import Dashboard from "./dashboard";

export default function App(){
return(
  <div>
  
      <Routes>
        <Route path="/" element={<LoginForm/>}/>
        <Route path="/reg" element={<RegistrationForm/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
     
  
    </div>
)
 

}