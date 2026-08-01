import type { PackageDB, PkgCCMod } from 'ccmoddb/build/src/types'
import './style.css'
import multiCCMod from './ccmod.json'
import xenonsCCMod from './ccmod1.json'

import { CCModChecker } from 'ccmoddb/build/tests/ccmod-check'
import { expect, test } from './test-functions'

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

ccmodChecker.testMetadataCCMod(xenonsCCMod as PkgCCMod)
ccmodChecker.testMetadataCCMod(multiCCMod as PkgCCMod)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = ` `
