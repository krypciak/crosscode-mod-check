import type { PackageDB, PkgCCMod } from 'ccmoddb/build/src/types'
import './style.css'
import './ui'
import { CCModChecker } from 'ccmoddb/build/tests/ccmod-check'
import { expect, test } from './test-functions'
import { appendConsole, clearConsole, getCodeInputString } from './ui'

async function fetchDatabase(owner: string, branch: string): Promise<PackageDB> {
    const res = await fetch(`https://raw.githubusercontent.com/${owner}/CCModDB/${branch}/npDatabase.json`)
    if (!res.ok) throw new Error(`Failed to fetch ${branch}: ${res.status}`)
    return (await res.json()) as PackageDB
}

async function getDatabases(): Promise<PackageDB[]> {
    return Promise.all([
        fetchDatabase('CCDirectLink', 'stable'),
        // fetchDatabase('CCDirectLink', 'testing')
    ])
}

const databases = await getDatabases()
const ccmodChecker = new CCModChecker(databases, test, expect)

export async function run() {
    const input = getCodeInputString()
    if (!input) {
        appendConsole('[ui] no input provided')
        return
    }

    let ccmod: PkgCCMod
    try {
        ccmod = JSON.parse(input) as PkgCCMod
    } catch (e) {
        appendConsole('[ui] invalid JSON:', (e as Error).message)
        return
    }
    clearConsole()
    appendConsole(`[ui] running (${new Date().toLocaleString()})...`)
    ccmodChecker.testMetadataCCMod(ccmod)
    appendConsole('[ui] done')
}
