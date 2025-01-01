import { createSlice } from '@reduxjs/toolkit';
import { userSliceNamespace } from '../actions/userActions';
import { IUserState } from '../models/UserState';

const initialState: IUserState = {
    isLoggingIn: false,
    token: ''
};

export const userSlice = createSlice({
    name: userSliceNamespace,
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLoggingIn = true;
        },
        setToken: (state, action) => {
            state.isLoggingIn = false;
            state.token = action.payload
        },
        removeToken: (state, action) => {
            state.token = '';
        },
    },
});

export const { setToken, removeToken, login } = userSlice.actions;

export const getToken = (state: IUserState) => state.token;

export default userSlice.reducer;