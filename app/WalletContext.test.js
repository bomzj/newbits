import { assert, expect, test, it, describe } from 'vitest'
import { times, is } from 'ramda'
import { Either } from 'ramda-fantasy'
import { isError, isOk } from './result'
import { decryptFromLocalStorage } from './encryptedLocalStorage'


it('Test stub', () => {
})

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