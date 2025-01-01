import { Tuple, configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import allReducer from './reducers/allReducers';
import rootSagas from './sagas/rootSagas';
import localStorage from 'redux-persist/es/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
    key: 'root',
    storage: localStorage,
    safelist: ['users']
}

const sagaMiddleware = createSagaMiddleware();
const persistedReducer = persistReducer(persistConfig, allReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: () => new Tuple(sagaMiddleware, logger),
});
sagaMiddleware.run(rootSagas);

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>