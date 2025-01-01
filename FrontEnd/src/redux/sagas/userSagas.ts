import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { userActionNames } from '../actions/userActions';
import { userApis } from '../apis/userApis';
import { setToken } from '../reducers/userReducers';

function* loginSaga(action: PayloadAction<{ username: string, password: string }>): any {
    try {
        const data = yield call(userApis.login, action.payload);
        yield put(setToken(data.data.token));
    } catch (error) {
        yield put(setToken(''));
    }
}

export function* watchUserLogin() {
    yield takeLatest(userActionNames.LOGIN, loginSaga);
}

const userSagas = [
    watchUserLogin,
];

export default userSagas;
