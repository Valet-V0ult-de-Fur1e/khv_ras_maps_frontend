import axios from 'axios';
import getServerAPIURL from '../../../app/api/serverAPI';

export const TryAutorizate = (login, password) => {
  axios.post(
    getServerAPIURL() + "/auth/login/", {
    "username": login,
    "password": password
  }
  ).then(
    (response) => {
      return true;
    }
  ).catch((error) => {
    console.log(error)
  })
  return false;
}