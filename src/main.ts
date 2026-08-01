import type { PackageDB, PkgCCMod } from 'ccmoddb/build/src/types'
import './style.css'
import multiCCMod from './ccmod.json'
import xenonsCCMod from './ccmod1.json'

import { CCModChecker } from 'ccmoddb/build/tests/ccmod-check'
import { expect, test } from './test-functions'

async function getDatabases(): Promise<PackageDB[]> {
    const stable = (await import('./stable.json')).default as unknown as PackageDB
    return [stable]
}

const databases = await getDatabases()
const ccmodChecker = new CCModChecker(databases, test, expect)

ccmodChecker.testMetadataCCMod(xenonsCCMod as PkgCCMod)
ccmodChecker.testMetadataCCMod(multiCCMod as PkgCCMod)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = ` `
