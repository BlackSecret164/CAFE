import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userReducers";

export default combineReducers({
    user: userReducer,
});