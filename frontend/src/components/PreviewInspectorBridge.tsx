import { useEffect, useRef } from 'react'
import {
  addEventListenerIO,
  currentPagePathIO,
  documentBodyIO,
  parentWindowIO,
  postMessageIO,
  removeEventListenerIO,
  setBodyCursorIO,
} from '@/delivery/io/browser'
import { runTask } from '@/delivery/io/TaskIO'

type InspectorSelectionPayload = {
  tagName: string
  text: string
  className: string
  id: string
  role: string
  ariaLabel: string
  testId: string
  name: string
  placeholder: string
  href: string
  selector: string
  pagePath: string
  summary: string
}

const WORKBENCH_SOURCE = 'editor3-workbench'
const PREVIEW_SOURCE = 'editor3-preview'

function normalizeText(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function buildSelector(element: HTMLElement, body: HTMLBodyElement) {
  const parts: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== body && parts.length < 5) {
    let part = current.tagName.toLowerCase()
    const id = current.id.trim()
    const testId = current.getAttribute('data-testid')?.trim()
    const classes = Array.from(current.classList).filter(Boolean).slice(0, 2)

    if (id) {
      part += '#' + id
      parts.unshift(part)
      break
    }

    if (testId) {
      part += '[data-testid="' + testId + '"]'
    } else if (classes.length > 0) {
      part += '.' + classes.join('.')
    }

    parts.unshift(part)
    current = current.parentElement
  }

  return parts.join(' > ')
}

function buildSummary(payload: Omit<InspectorSelectionPayload, 'summary'>) {
  const details = [payload.tagName]

  if (payload.role) {
    details.push('role=' + payload.role)
  }

  if (payload.id) {
    details.push('#' + payload.id)
  }

  if (payload.testId) {
    details.push('testid=' + payload.testId)
  }

  const textSource = payload.text || payload.ariaLabel || payload.placeholder || payload.name
  if (textSource) {
    details.push(textSource.slice(0, 48))
  }

  return details.join(' · ')
}

function buildSelectionPayload(element: HTMLElement, body: HTMLBodyElement, pagePath: string): InspectorSelectionPayload {
  const tagName = element.tagName.toLowerCase()
  const text = normalizeText(element.innerText || element.textContent).slice(0, 180)
  const className = Array.from(element.classList).join(' ')
  const id = element.id.trim()
  const role = element.getAttribute('role')?.trim() ?? ''
  const ariaLabel = element.getAttribute('aria-label')?.trim() ?? ''
  const testId = element.getAttribute('data-testid')?.trim() ?? ''
  const name = element.getAttribute('name')?.trim() ?? ''
  const placeholder = element.getAttribute('placeholder')?.trim() ?? ''
  const href = element instanceof HTMLAnchorElement ? element.href : ''
  const selector = buildSelector(element, body)

  const payloadWithoutSummary = {
    tagName,
    text,
    className,
    id,
    role,
    ariaLabel,
    testId,
    name,
    placeholder,
    href,
    selector,
    pagePath,
  }

  return {
    ...payloadWithoutSummary,
    summary: buildSummary(payloadWithoutSummary),
  }
}

export function PreviewInspectorBridge() {
  const enabledRef = useRef(false)
  const activeElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    function clearHighlight() {
      const activeElement = activeElementRef.current
      if (!activeElement) {
        return
      }

      activeElement.style.outline = activeElement.dataset.previewInspectorOutline ?? ''
      activeElement.style.outlineOffset = activeElement.dataset.previewInspectorOutlineOffset ?? ''
      delete activeElement.dataset.previewInspectorOutline
      delete activeElement.dataset.previewInspectorOutlineOffset
      activeElementRef.current = null
    }

    function applyHighlight(element: HTMLElement) {
      clearHighlight()
      element.dataset.previewInspectorOutline = element.style.outline
      element.dataset.previewInspectorOutlineOffset = element.style.outlineOffset
      element.style.outline = '2px solid rgba(201, 92, 31, 0.95)'
      element.style.outlineOffset = '2px'
      activeElementRef.current = element
    }

    function handlePointerMove(event: MouseEvent) {
      if (!enabledRef.current) {
        return
      }

      const target = event.target
      if (!(target instanceof HTMLElement)) {
        return
      }

      applyHighlight(target)
    }

    function handleMessage(event: MessageEvent) {
      const data = event.data
      if (!data || typeof data !== 'object') {
        return
      }

      if (data.source !== WORKBENCH_SOURCE) {
        return
      }

      if (data.type === 'preview-inspector:set-mode' && typeof data.enabled === 'boolean') {
        enabledRef.current = data.enabled
        void runTask(setBodyCursorIO(data.enabled ? 'crosshair' : ''))
        if (!data.enabled) {
          clearHighlight()
        }
      }
    }

    function handleClick(event: MouseEvent) {
      if (!enabledRef.current) {
        return
      }

      const target = event.target
      if (!(target instanceof HTMLElement)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      applyHighlight(target)
      void Promise.all([runTask(documentBodyIO()), runTask(currentPagePathIO()), runTask(parentWindowIO())]).then(
        ([body, pagePath, parentWindow]) =>
          runTask(
            postMessageIO(parentWindow, {
              source: PREVIEW_SOURCE,
              type: 'preview-inspector:selection',
              payload: buildSelectionPayload(target, body, pagePath),
            }),
          ),
      )
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey && event.key.toLowerCase() === 't') {
        event.preventDefault()
        event.stopPropagation()
        void runTask(parentWindowIO())
          .then((parentWindow) =>
            runTask(
              postMessageIO(parentWindow, {
                source: PREVIEW_SOURCE,
                type: 'preview-inspector:toggle-mode',
              }),
            ),
          )
        return
      }

      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      void runTask(parentWindowIO())
        .then((parentWindow) =>
          runTask(
            postMessageIO(parentWindow, {
              source: PREVIEW_SOURCE,
              type: 'preview-inspector:undo',
            }),
          ),
        )
    }

    const messageListener: EventListener = handleMessage as EventListener
    const keydownListener: EventListener = handleKeyDown as EventListener
    const pointerMoveListener: EventListener = handlePointerMove as EventListener
    const clickListener: EventListener = handleClick as EventListener

    void runTask(parentWindowIO())
      .then((parentWindow) =>
        runTask(
          postMessageIO(parentWindow, {
            source: PREVIEW_SOURCE,
            type: 'preview-inspector:ready',
          }),
        ),
      )
    void Promise.all([
      runTask(addEventListenerIO(window, 'message', messageListener)),
      runTask(addEventListenerIO(document, 'keydown', keydownListener, true)),
      runTask(addEventListenerIO(document, 'mousemove', pointerMoveListener, true)),
      runTask(addEventListenerIO(document, 'click', clickListener, true)),
    ])

    return () => {
      void runTask(setBodyCursorIO(''))
      clearHighlight()
      void Promise.all([
        runTask(removeEventListenerIO(window, 'message', messageListener)),
        runTask(removeEventListenerIO(document, 'keydown', keydownListener, true)),
        runTask(removeEventListenerIO(document, 'mousemove', pointerMoveListener, true)),
        runTask(removeEventListenerIO(document, 'click', clickListener, true)),
      ])
    }
  }, [])

  return null
}
