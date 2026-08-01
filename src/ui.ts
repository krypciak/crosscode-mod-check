import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { unzipSync } from 'fflate'
import { run } from './main'

const consoleMount = document.querySelector<HTMLDivElement>('#console-output')!
const inputMount = document.querySelector<HTMLDivElement>('#input-code')!
const uploadBtn = document.querySelector<HTMLButtonElement>('#upload-btn')!
const fileInput = document.querySelector<HTMLInputElement>('#file-input')!
export const runBtn = document.querySelector<HTMLButtonElement>('#run-btn')!

function createEditor(parent: HTMLElement, editable: boolean, doc: string = ''): EditorView {
    return new EditorView({
        state: EditorState.create({
            doc,
            extensions: [
                basicSetup,
                json(),
                oneDark,
                EditorState.readOnly.of(!editable),
                EditorView.theme({
                    '&': { height: '100%' },
                    '.cm-scroller': { overflow: 'auto' },
                }),
            ],
        }),
        parent,
    })
}

const consoleEditor = createEditor(consoleMount, false)
const inputEditor = createEditor(inputMount, true)

const ANSI_RE = /\x1b\[[0-9;]*m/g

export function appendConsole(...args: any[]) {
    const line = args
        .map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).replace(ANSI_RE, ''))
        .join(' ') + '\n'
    consoleEditor.dispatch({
        changes: { from: consoleEditor.state.doc.length, insert: line },
    })
    const scroller = consoleEditor.dom.querySelector('.cm-scroller')
    if (scroller) scroller.scrollTop = scroller.scrollHeight
}

const origLog = console.log
const origWarn = console.warn
const origError = console.error
console.log = (...args: any[]) => {
    origLog(...args)
    appendConsole('[log]', ...args)
}
console.warn = (...args: any[]) => {
    origWarn(...args)
    appendConsole('[warn]', ...args)
}
console.error = (...args: any[]) => {
    origError(...args)
    appendConsole('[error]', ...args)
}

window.addEventListener('error', e => appendConsole('[exception]', e.message))
window.addEventListener('unhandledrejection', e => appendConsole('[unhandled promise]', String(e.reason)))

function setInputText(text: string) {
    inputEditor.dispatch({
        changes: { from: 0, to: inputEditor.state.doc.length, insert: text },
    })
}

uploadBtn.addEventListener('click', () => fileInput.click())
fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0]
    if (!file) return
    fileInput.value = ''
    const data = new Uint8Array(await file.arrayBuffer())

    if (file.name.endsWith('.zip') || file.name.endsWith('.ccmod')) {
        const unzipped = unzipSync(data)
        const ccmodPath = Object.keys(unzipped).find(path => path.replace(/\\/g, '/').split('/').pop() === 'ccmod.json')
        if (!ccmodPath) {
            appendConsole(`[ui] no ccmod.json found in ${file.name}`)
            return
        }
        setInputText(new TextDecoder().decode(unzipped[ccmodPath]))
        appendConsole(`[ui] loaded ${file.name} (${file.size} bytes): ${ccmodPath}`)
    } else {
        setInputText(new TextDecoder().decode(data))
        appendConsole(`[ui] loaded ${file.name} (${file.size} bytes)`)
    }
})

export function getCodeInputString() {
    return inputEditor.state.doc.toString().trim()
}

runBtn.addEventListener('click', () => run())
