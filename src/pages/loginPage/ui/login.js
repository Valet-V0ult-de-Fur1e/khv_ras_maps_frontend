import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TryAutorizate } from '../api/login';
import "./login.css"

const Login = () => {
  const [userLogin, setUserLogin] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [toRememberFlag, setToRememberFlag] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const Autorizate = () => {
    if (TryAutorizate(userLogin, userPassword)) {
      if (toRememberFlag) {
        dispatch(
          {
            type: "AUTORIZATION_COMPLETED",
            newLogin: userLogin
          }
        )
        dispatch({
          type: "USER_REMEMBORED"
        });
      }
      navigate('/');
    }
    else {
      alert("Пользователь не найден! Проверьте логин и пароль!");
    }
  }

  return (
    <div className='login-form'>
      <div className="login-container">
        <h2>Авторизация</h2>
        <div className="error-message" id="errorMessage">Данные для входа неверные</div>
        <div id="loginForm">
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Логин/Почта" onChange={(e) => { setUserLogin(e.target.value) }} />
          </div>
          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Пароль" onChange={(e) => { setUserPassword(e.target.value) }} />
          </div>
          <label>
            <input type="checkbox" checked={toRememberFlag} onChange={(e) => { setToRememberFlag(e.target.checked) }} />{" "}запомнить меня
          </label>
          <button type="submit" className="btn btn-secondary" onClick={Autorizate}>Вход</button>
        </div>
      </div>
    </div>

  )
}

export default Login