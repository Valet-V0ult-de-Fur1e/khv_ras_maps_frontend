import React, {useEffect, useState} from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/home.js";
import Login from "./pages/login/login";
import {useLocalStorage} from "./elements/useLocalStorage.js"

function App() {
  const [rememberUserFlag, setRememberUserFlag] = useLocalStorage("user_is_remembered_flag", false);
  const [userIsLoginedFlag, setUserIsLoginedFlag] = useLocalStorage("user_is_logined", false);
  const [loginedUserName, setLoginedUserName] = useLocalStorage("user_login", "");

  useEffect(
    () => {
      if (!userIsLoginedFlag && !rememberUserFlag) {
        setUserIsLoginedFlag("")
      }
    },
    [userIsLoginedFlag, rememberUserFlag, setUserIsLoginedFlag]
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;