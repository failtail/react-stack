// 它的作用是在 redux-saga 内部实现了一个调度程序，控制各个任务的执行顺序。 它暴露了两个 api：

const queue = [];
/**
  Variable to hold a counting semaphore
  - Incrementing adds a lock and puts the scheduler in a `suspended` state (if it's not
    already suspended)
  - Decrementing releases a lock. Zero locks puts the scheduler in a `released` state. This
    triggers flushing the queued tasks.
**/
// semaphore 是一个信号标识，当它的值大于0时，表示有任务在执行，此时调度程序处于挂起的状态；当它的值小于0时，表示任务调度程序处于释放的状态，这时可以执行任务队列里面排队的所有任务
let semaphore = 0;

/**
  Executes a task 'atomically'. Tasks scheduled during this execution will be queued
  and flushed after this task has finished (assuming the scheduler endup in a released
  state).
**/
// 调用 suspend 将调度程序挂起，然后执行传入进来的任务，执行完毕之后释放调度程序
function exec(task) {
  try {
    suspend();
    task();
  } finally {
    release();
  }
}

/**
  Executes or queues a task depending on the state of the scheduler (`suspended` or `released`)
**/

// 根据调度程序的状态执行或对任务排队(“挂起”或“释放”)
//   我们可以发现 asap 将传入进来的 task 先缓存进了队列，只有当 semaphore 为0时也就是调度程序处于释放状态时才会立即执行所有的排队任务。
export function asap(task) {
  // 将传入进来的 task 先缓存进了队列，
  queue.push(task);

  if (!semaphore) {
    suspend();
    flush();
  }
}

/**
 * Puts the scheduler in a `suspended` state and executes a task immediately.
 */
export function immediately(task) {
  try {
    suspend();
    return task();
  } finally {
    flush();
  }
}

/**
  Puts the scheduler in a `suspended` state. Scheduled tasks will be queued until the
  scheduler is released.
**/
// 表示调度程序此时有任务正在执行，处于挂起的状态
function suspend() {
  semaphore++;
}

/**
  Puts the scheduler in a `released` state.
**/
// : 将 semaphore-- 将调度程序置为释放的状态
function release() {
  semaphore--;
}

/**
  Releases the current lock. Executes all queued tasks if the scheduler is in the released state.
**/
// : 调用 release 将调度程序释放，然后执行所有任务队列里面的任务
function flush() {
  release();

  let task;
  while (!semaphore && (task = queue.shift()) !== undefined) {
    exec(task);
  }
}
