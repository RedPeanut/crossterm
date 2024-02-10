import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import { createBrowserHistory } from 'history';
import reducers from '../reducers';
import rootSaga from '../sagas/rootSaga';

export default function configureStore(preloadedState = {}) {
  const reducer = combineReducers({
    ...reducers,
    routing: routerReducer,
  });

  const sagaMiddleWare = createSagaMiddleware();
  const routerMiddleWare = routerMiddleware(createBrowserHistory());

  const store = createStore(reducer, preloadedState, compose(applyMiddleware(sagaMiddleWare, routerMiddleWare)));
  sagaMiddleWare.run(rootSaga);

  return store;
}
