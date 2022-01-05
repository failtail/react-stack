import { noop, remove } from './utils'

/**
 Used to track a parent task and its forks
 In the fork model, forked tasks are attached by default to their parent
 We model this using the concept of Parent task && main Task
 main task is the main flow of the current Generator, the parent tasks is the
 aggregation of the main tasks + all its forked tasks.
 Thus the whole model represents an execution tree with multiple branches (vs the
 linear execution tree in sequential (non parallel) programming)

 A parent tasks has the following semantics
 - It completes if all its forks either complete or all cancelled
 - If it's cancelled, all forks are cancelled as well
 - It aborts if any uncaught error bubbles up from forks
 - If it completes, the return value is the one returned by the main task
 **/
// 主要用于处理主任务和分支任务的关系的
// middleware.run(saga, ...args) 会创建一个主任务，saga 内部执行 fork 的时候又会创建一个任务，这个任务就是它的分支任务。  todo
export default function forkQueue(mainTask, onAbort, cont) {
  //  一个数组，里面会包含所有的任务
  let tasks = []
  //  主任务返回的结果
  let result
  // 表明任务是否已经执行完毕
  let completed = false
// 将主任务添加到任务队列里面
  addTask(mainTask)
  const getTasks = () => tasks

  function abort(err) {
    onAbort()
    cancelAll()
    cont(err, true)
  }

  function addTask(task) {
    tasks.push(task)
    task.cont = (res, isErr) => {
      if (completed) {
        return
      }

      remove(tasks, task)
      task.cont = noop
      if (isErr) {
        abort(res)
      } else {
        if (task === mainTask) {
          result = res
        }
        if (!tasks.length) {
          completed = true
          cont(result)
        }
      }
    }
  }

  function cancelAll() {
    if (completed) {
      return
    }
    completed = true
    tasks.forEach(t => {
      t.cont = noop
      t.cancel()
    })
    tasks = []
  }

  return {
    addTask,
    cancelAll,
    abort,
    getTasks,
  }
}
