import initialState from "./initialState"
import axios from "axios"
import apiClient from "../services/apiClient"

export const REQUEST_LOGIN = "@@auth/REQUEST_LOGIN"
export const REQUEST_LOGIN_FAILURE = "@@auth/REQUEST_LOGIN_FAILURE"
export const REQUEST_LOGIN_SUCCESS = "@@auth/REQUEST_LOGIN_SUCCESS"
export const REQUEST_LOG_USER_OUT = "@@auth/REQUEST_LOG_USER_OUT"
export const FETCHING_USER_FROM_TOKEN = "@@auth/FETCHING_USER_FROM_TOKEN"
export const FETCHING_USER_FROM_TOKEN_SUCCESS = "@@auth/FETCHING_USER_FROM_TOKEN_SUCCESS"
export const FETCHING_USER_FROM_TOKEN_FAILURE = "@@auth/FETCHING_USER_FROM_TOKEN_FAILURE"
export const REQUEST_USER_SIGN_UP = "@@auth/REQUEST_USER_SIGN_UP"
export const REQUEST_USER_SIGN_UP_SUCCESS = "@@auth/REQUEST_USER_SIGN_UP_SUCCESS"
export const REQUEST_USER_SIGN_UP_FAILURE = "@@auth/REQUEST_USER_SIGN_UP_FAILURE"

export default function authReducer(state = initialState.auth, action = {}) {
    switch (action.type) {
        case REQUEST_LOGIN:
            return {
                ...state,
                isLoading: true,
            }
        case REQUEST_LOGIN_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.error,
                user: {},
            }
        case REQUEST_LOGIN_SUCCESS:
            return {
                ...state,
                isLoading: false,
                error: null,
            }
        case REQUEST_LOG_USER_OUT:
            return {
                ...initialState.auth,
            }
        case FETCHING_USER_FROM_TOKEN:
            return {
                ...state,
                isLoading: true
            }
        case FETCHING_USER_FROM_TOKEN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                userLoaded: true,
                isLoading: false,
                user: action.data
            }
        case FETCHING_USER_FROM_TOKEN_FAILURE:
            return {
                ...state,
                isAuthenticated: false,
                userLoaded: true,
                isLoading: false,
                error: action.error,
                user: {}
            }
        case REQUEST_USER_SIGN_UP:
            return {
                ...state,
                isLoading: true,
            }
        case REQUEST_USER_SIGN_UP_SUCCESS:
            return {
                ...state,
                isLoading: false,
                error: null
            }
        case REQUEST_USER_SIGN_UP_FAILURE:
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                error: action.error
            }
        default:
            return state
    }
}

export const Actions = {}

Actions.requestUserLogin = ({ email, password }) => {
    return async (dispatch) => {
        // set redux state to loading while we wait for server response
        dispatch({ type: REQUEST_LOGIN })
        // create the url-encoded form data
        const formData = new FormData()
        formData.set("username", email)
        formData.set("password", password)
        // set the request headers
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        }
        try {
            // make the actual HTTP request to our API
            const res = await axios({
                method: `POST`,
                url: `http://localhost:8000/api/users/login/token/`,
                data: formData,
                headers,
            })
            console.log(res)
            // stash the access_token our server returns
            const access_token = res?.data?.access_token
            localStorage.setItem("access_token", access_token)
            // dispatch the success action
            dispatch({ type: REQUEST_LOGIN_SUCCESS })
            // dispatch the fetch user from token action creator instead
            return dispatch(Actions.fetchUserFromToken(access_token))
        } catch (error) {
            console.log(error)
            // dispatch the failure action
            return dispatch({ type: REQUEST_LOGIN_FAILURE, error: error?.message })
        }
    }
}

Actions.fetchUserFromToken = (access_token) => {
    return async (dispatch) => {
        dispatch({ type: FETCHING_USER_FROM_TOKEN })
        const token = access_token ? access_token : localStorage.getItem("access_token")
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
        try {
            const res = await axios({
                method: `GET`,
                url: `http://localhost:8000/api/users/me/`,
                headers
            })
            console.log(res)
            return dispatch({ type: FETCHING_USER_FROM_TOKEN_SUCCESS, data: res.data })
        } catch (error) {
            console.log(error)
            return dispatch({ type: FETCHING_USER_FROM_TOKEN_FAILURE, error })
        }
    }
}

Actions.logUserOut = () => {
    localStorage.removeItem("access_token")
    return {
        type: REQUEST_LOG_USER_OUT
    }
}

Actions.registerNewUser = ({ username, email, password }) => {
    return (dispatch) =>
        dispatch(
            apiClient({
                url: `/users/`,
                method: `POST`,
                types: {
                    REQUEST: REQUEST_USER_SIGN_UP,
                    SUCCESS: REQUEST_USER_SIGN_UP_SUCCESS,
                    FAILURE: REQUEST_USER_SIGN_UP_FAILURE
                },
                options: {
                    data: { new_user: { username, email, password } },
                    params: {}
                },
                onSuccess: (res) => {
                    // stash the access_token our server returns
                    const access_token = res?.data?.access_token?.access_token
                    localStorage.setItem("access_token", access_token)
                    return dispatch(Actions.fetchUserFromToken(access_token))
                },
                onFailure: (res) => ({ type: res.type, success: false, status: res.status, error: res.error })
            })
        )
}

