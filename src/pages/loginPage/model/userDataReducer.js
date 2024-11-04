const defaultState = {
    login: "",
    isLogined: false,
    role: "",
    isRemembered: false
}

export const userDataReducer = (state = defaultState, action) => {
    switch (action.type) {
        case "AUTORIZATION_COMPLETED":
            return {...state, login: action.newLogin, isLogined: true, role: "unknown_user"}
        case "LOGOUT":
            return defaultState
        case "USER_REMEMBORED":
            return {...state, isRemembered: action.toRememberFlag}
        default:
            return state
    }
}