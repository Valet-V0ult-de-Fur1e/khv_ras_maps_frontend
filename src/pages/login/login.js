import React, { useState } from 'react'
import "./login.css"
import { useLocalStorage } from "../../elements/useLocalStorage.js"
import axios from 'axios';
import getServerAPIURL from "../../elements/serverAPI.js"
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [userLogin, setUserLogin] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const [authKey, setAuthKey] = useLocalStorage("auth_key", "");
    const [rememberUserFlag, setRememberUserFlag] = useLocalStorage("user_is_remembered_flag", false);
    const [userIsLoginedFlag, setUserIsLoginedFlag] = useLocalStorage("user_is_logined", false);
    const [loginedUserName, setLoginedUserName] = useLocalStorage("user_login", "");

    const navigate = useNavigate();

    const loginUser = () => {
        axios.post(getServerAPIURL() + "/api/auth/login/", {
            "username": userLogin,
            "password": userPassword
        })
            .then((response) => {
                if (rememberUserFlag) {
                    setLoginedUserName(userLogin);
                }
                setUserIsLoginedFlag(true);
                console.log(response.data.key)
                setAuthKey(response.data.key);
                navigate('/');
            })
            .catch((error) => {
                console.log(error)
                alert("Пользователь не найден! Проверьте логин и пароль!")
            })
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
                        <input type="checkbox" checked={rememberUserFlag} onChange={(e) => { setRememberUserFlag(e.target.checked) }} />{" "}запомнить меня
                    </label>
                    <button type="submit" className="btn btn-secondary" onClick={loginUser}>Вход</button>
                </div>
            </div>
        </div>

    )
}

export default Login