import { put, all } from "./redux-saga/core/src/internal/io";
import { takeEvery } from "./redux-saga/core/src/internal/io-helpers";

export function* helloSaga() {
  console.log("Hello Sagas!");
}

export function* incrementAsync() {
  yield put({ type: "INCREMENT" });
}

// Our watcher Saga: 在每个 INCREMENT_ASYNC action spawn 一个新的 incrementAsync 任务
export function* watchIncrementAsync() {
  yield takeEvery("INCREMENT_ASYNC", incrementAsync);
}

export default function* rootSaga() {
  yield all([helloSaga(), watchIncrementAsync()]);
}
