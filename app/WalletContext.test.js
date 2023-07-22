import { assert, expect, test, it, describe } from 'vitest'
import { initWasm, WalletCore, TW, KeyStore } from '@trustwallet/wallet-core'
import { times, is } from 'ramda'
import { Either } from 'ramda-fantasy'
import { isError, isOk } from './result'
import { parseEncryptedLocalStorage } from './WalletContext'

describe('Encrypted Local Storage', () => {
  
  it.each([
    ['with correct password', '1', Either.isRight],
    ['with wrong password', 'haha', Either.isLeft],
    ['without password', '', Either.isLeft],
  ])('Parse encrypted data %s', async (_, password, expectedPredicate) => {
    localStorage.setItem(
      'data', 
      'Q30a49y9eKyC2m/HrHlP8Woup+qPzfxC9CTNLOVvMcMnEbQvZZJeOXWXT8nNhA=='
    )
    
    await parseEncryptedLocalStorage('data', password)
      .then(expectedPredicate)
      .then(assert.isTrue)
  })

  it.each([
    ['empty', null, Either.isRight],
    ['unencrypted', '{}', Either.isRight],
  ])('Parse %s data', async (_, value, expectedPredicate) => {
    localStorage.setItem('data', value)

    await parseEncryptedLocalStorage('data')
      .then(expectedPredicate)
      .then(assert.isTrue)
  })
})


// it('Create a new wallet', async () => {
//   const { HDWallet, CoinType } = await initWasm()
  
//   const newWallet = HDWallet.create(256, '1')
//   newWallet.getAddressForCoin(CoinType.bitcoin)
//   console.log(newWallet.mnemonic())
//   const importedWallet = HDWallet.createWithMnemonic(newWallet.mnemonic(), '1')

//   expect(newWallet.seed().toString())
//     .toBe(importedWallet.seed().toString())
// })

// test('Generate a bitcoin address', async () => {
//   const mnemonic = 
//     'regular indicate minor unaware quality ceiling hurry media yellow repair urban ' +
//     'come dance talent mad guard brick slam middle accident oil walnut bird purpose'
  
//   const { HDWallet, CoinType, BitcoinAddress,CoinTypeExt,Derivation,DerivationPathIndex, DerivationPath  } = await initWasm()
  
//   const wallet = HDWallet.createWithMnemonic(mnemonic, '')
//   wallet.
//   const log = (i) => console.log(wallet.getAddressForCoin(CoinType.bitcoin))
//   times(log, 5)
//   const importedWallet = HDWallet.createWithMnemonic(newWallet.mnemonic(), '1')

//   expect(newWallet.seed().toString())
//     .toBe(importedWallet.seed().toString())
// })