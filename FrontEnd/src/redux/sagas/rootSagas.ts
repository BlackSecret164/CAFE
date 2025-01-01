import { all, fork } from 'redux-saga/effects';
import userSagas from './userSagas';

const allSaga = [
	...userSagas,
];

function* rootSagas() {
	yield all(allSaga.map((saga) => fork(saga)))
}

export default rootSagas;
