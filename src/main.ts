import type { PackageDB, PkgCCMod } from 'ccmoddb/build/src/types'
import { CCModChecker } from 'ccmoddb/build/tests/ccmod-check'
import { expect, test } from './test-functions'
import { appendConsole, clearConsole, getCodeInputString, getDatabaseMode } from './ui'
import { stable, testing } from './branch'
import './style.css'

async function getDatabases(mode: 'stable' | 'testing'): Promise<PackageDB[]> {
    if (mode == 'stable') return stable.getDbs()
    if (mode == 'testing') return testing.getDbs()
    throw new Error()
}

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
    const databases = await getDatabases(getDatabaseMode())
    const ccmodChecker = new CCModChecker(databases, test, expect)
    appendConsole(`[ui] running (${new Date().toLocaleString()})...`)
    ccmodChecker.testMetadataCCMod(ccmod)
    appendConsole('[ui] done')
}
