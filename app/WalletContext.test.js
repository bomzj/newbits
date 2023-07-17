import { assert, expect, test, it, describe } from 'vitest'
import { initWasm, WalletCore, TW, KeyStore } from '@trustwallet/wallet-core'


test('Create a new wallet', async () => {
  const { HDWallet } = await initWasm()
  
  const newWallet = HDWallet.create(256, '1')
  const importedWallet = HDWallet.createWithMnemonic(newWallet.mnemonic(), '1')

  expect(newWallet.seed().toString())
    .toBe(importedWallet.seed().toString())
})