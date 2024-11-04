import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import Login from '../../pages/loginPage/ui/login';
import '../styles/index.css'

function AppRoutes() {
  const userIsRemembered = useSelector(state => state.user.isRemembered)
  const dispatch = useDispatch();
  if (userIsRemembered) {
    dispatch({
      type: "LOGOUT"
    });
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;