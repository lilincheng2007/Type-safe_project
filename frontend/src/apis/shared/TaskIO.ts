/**
 * 惰性异步任务，与后端 Cats Effect `IO` 的用法一致：先描述副作用，在 `runTask` 执行时才触发。
 * 所有 HTTP API 均返回 `TaskIO`，由页面或 hook 在适当时机 `runTask`。
 */
export type TaskIO<A> = () => Promise<A>

export function runTask<A>(t: TaskIO<A>): Promise<A> {
  return t()
}

export function mapTask<A, B>(t: TaskIO<A>, f: (a: A) => B): TaskIO<B> {
  return () => t().then(f)
}

export function flatMapTask<A, B>(t: TaskIO<A>, f: (a: A) => TaskIO<B>): TaskIO<B> {
  return () => t().then((a) => runTask(f(a)))
}

export function taskOf<A>(value: A): TaskIO<A> {
  return () => Promise.resolve(value)
}
