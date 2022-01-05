import * as is from "@redux-saga/is";
import { check, assignWithSymbols, createSetContextWarning } from "./utils";
import { stdChannel } from "./channel";
import { runSaga } from "./runSaga";

export default function sagaMiddlewareFactory({
  context = {},
  channel = stdChannel(),
  sagaMonitor,
  ...options
} = {}) {
  let boundRunSaga;

  if (process.env.NODE_ENV !== "production") {
    check(
      channel,
      is.channel,
      "options.channel passed to the Saga middleware is not a channel"
    );
  }

//  所以它接收 getState 和 dispatch 两个参数 返回一个高阶方法，这个也是 redux 的 middleware 的要求，
  function sagaMiddleware({ getState, dispatch }) {
    boundRunSaga = runSaga.bind(null, {
      ...options,
      context,
      channel,
      dispatch,
      getState,
      sagaMonitor,
    });

    return (next) => (action) => {
      if (sagaMonitor && sagaMonitor.actionDispatched) {
        sagaMonitor.actionDispatched(action);
      }
      const result = next(action); // hit reducers
      // todo 为什么在next(action)之后调用put， 因为此时已经改变了currentState了，然后在进行异步操作，感觉不太对
      //  主要的逻辑就在 channel.put(action) 这里面 todo
      channel.put(action);
      return result;
    };
  }
  debugger;
  sagaMiddleware.run = (...args) => {
    if (process.env.NODE_ENV !== "production" && !boundRunSaga) {
      throw new Error(
        "Before running a Saga, you must mount the Saga middleware on the Store using applyMiddleware"
      );
    }
    return boundRunSaga(...args);
  };

  sagaMiddleware.setContext = (props) => {
    if (process.env.NODE_ENV !== "production") {
      check(props, is.object, createSetContextWarning("sagaMiddleware", props));
    }

    assignWithSymbols(context, props);
  };

  return sagaMiddleware;
}
