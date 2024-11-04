import { createStore, combineReducers } from "redux";
import { userDataReducer } from "../../pages/loginPage/model/userDataReducer";

const rootReducer = combineReducers({
    user: userDataReducer
})

export const store = createStore(rootReducer)