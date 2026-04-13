import type { TaskIO } from '@/delivery/io/TaskIO'

export function nowIO(): TaskIO<number> {
  return () => Promise.resolve(Date.now())
}

export function localStorageGetItemIO(key: string): TaskIO<string | null> {
  return () => Promise.resolve(window.localStorage.getItem(key))
}

export function localStorageSetItemIO(key: string, value: string): TaskIO<void> {
  return () => Promise.resolve(window.localStorage.setItem(key, value))
}

export function localStorageRemoveItemIO(key: string): TaskIO<void> {
  return () => Promise.resolve(window.localStorage.removeItem(key))
}

export function fetchIO(input: RequestInfo | URL, init?: RequestInit): TaskIO<Response> {
  return () => fetch(input, init)
}

export function setTimeoutIO(callback: () => void, ms: number): TaskIO<number> {
  return () => Promise.resolve(window.setTimeout(callback, ms))
}

export function clearTimeoutIO(timer: number): TaskIO<void> {
  return () => Promise.resolve(window.clearTimeout(timer))
}

export function currentPagePathIO(): TaskIO<string> {
  return () => Promise.resolve(window.location.pathname + window.location.search + window.location.hash)
}

export function documentBodyIO(): TaskIO<HTMLBodyElement> {
  return () => Promise.resolve(document.body as HTMLBodyElement)
}

export function setBodyCursorIO(cursor: string): TaskIO<void> {
  return () =>
    Promise.resolve().then(() => {
      document.body.style.cursor = cursor
    })
}

export function postMessageIO(target: Window, message: unknown, targetOrigin = '*'): TaskIO<void> {
  return () => Promise.resolve(target.postMessage(message, targetOrigin))
}

export function parentWindowIO(): TaskIO<Window> {
  return () => Promise.resolve(window.parent)
}

export function addEventListenerIO(
  target: Window | Document,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
): TaskIO<void> {
  return () => Promise.resolve(target.addEventListener(type, listener, options))
}

export function removeEventListenerIO(
  target: Window | Document,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: EventListenerOptions | boolean,
): TaskIO<void> {
  return () => Promise.resolve(target.removeEventListener(type, listener, options))
}

export function rootElementByIdIO(id: string): TaskIO<HTMLElement> {
  return () => {
    const element = document.getElementById(id)
    if (!element) {
      return Promise.reject(new Error(`Missing root element #${id}`))
    }
    return Promise.resolve(element)
  }
}
