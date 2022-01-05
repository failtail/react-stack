import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from './redux'
import rootReducer from './reducers'
import App from './components/App'
import createSagaMiddleware from './redux-saga/index'

import rootSaga from './rootSaga.js'
// 最终返回的dispatch：
// (action) => {
//   // debugger
//   console.group(action.type);
//   console.info('dispatching', action)
//   // next 是logger02的： // (action) => {
//   //   console.group(action.type);
//   //   console.info('dispatching', action)
//   //   // next 是 (...args) => dispatch(...args)
//   //   let result = next(action);
//   //   console.log('next state', store.getState())
//   //   console.groupEnd(action.type)
//   //   return result
//   // }
//   let result = next(action);
//   console.log('next state', store.getState())
//   console.groupEnd(action.type)
//   return result
// }

// middleware
const logger = (store) => (next) => (action) => {
  // debugger
  console.group(action.type);
  console.info('dispatching', action)
  // next 是logger02的： // (action) => {
  //   console.group(action.type);
  //   console.info('dispatching', action)
  //   // next 是 (...args) => dispatch(...args)
  //   let result = next(action);
  //   console.log('next state', store.getState())
  //   console.groupEnd(action.type)
  //   return result
  // }
  let result = next(action);
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}
const logger02 = (store) => (next) => (action) => {
  console.group(action.type);
  console.info('dispatching', action)
  // next 是 store.dispatch(...args)
  let result = next(action);
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}
debugger;
const sagaMiddleware = createSagaMiddleware ();


let store = createStore(rootReducer, applyMiddleware(logger, sagaMiddleware));

sagaMiddleware.run (rootSaga);

const storeTest = createStore(rootReducer);

render(
  // reacr-redux test root app
  <Provider store={store}>
    <App changeStore={() => { store = storeTest; console.log(store.getState());  }}/>
  </Provider>,
  // redux test root element
  // <div></div>,
  document.getElementById('root')
)
// redux test
// let unsubscribe = store.subscribe(() => {
//   console.log('subscribe getState: ', store.getState())
// })
// unsubscribe();
// function Compose(...funcs){
//   if (funcs.length === 0) {
//     return args => args;
//   }
//   if (funcs.length === 1) {
//     return funcs[0]
//   }
//   const arr = funcs;
//   let firstFun = arr[0];
//   let len = arr.length;
//   let i = 1;
//   while(i !== len) {
//     firstFun = firstFun(arr[i]);
//     i++;
//   }
//   return firstFun;
// }
// const a = function(a){return a};
// const b = function(b){return b*2};
// console.log('compose==', compose(a,b)(1));
// console.log('compose==', Compose(a,b)(1));

// store.dispatch({
//   type: 'ADD_TODO',
//   id: 111,
//   text: 'asd'});


// store.dispatch({
//   type: 'ADD_TODO',
//   id: 123,
//   text: 'asd'});
// redux test code