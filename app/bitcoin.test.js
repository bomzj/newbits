/* eslint-disable max-lines */
/* eslint-disable complexity */
import { assert, expect, test, it, describe } from 'vitest'
import { times, is, pipe, tryCatch, always, pipeWith, cond, F } from 'ramda'
import { Either } from 'ramda-fantasy'
import {
  generatePrivateKey, getAddress, validateAddress,
  createTx, validateTx, getNetworkFee, signTx, sendTx
} from './bitcoin'
import { Networks, Transaction, Script, Input, crypto, Message, PrivateKey } from 'bitcore-lib'

it('Can generate a random bitcoin segwit address', async () => {
  const newAddress = pipe(
    generatePrivateKey,
    getAddress,
  )()

  assert.strictEqual(newAddress.startsWith('bc1'), true)

  const result =
    await fetch('https://blockchain.info/rawaddr/' + newAddress)
      .then((res) => res.json())

  // random private keys [probably!] have no transactions
  assert.strictEqual(result.n_tx, 0)
  assert.strictEqual(result.total_received, 0)
  assert.strictEqual(result.total_sent, 0)
})

it('Can generate a Testnet address', () => {
  const pk = generatePrivateKey(true)
  const address = getAddress(pk, true)

  assert.strictEqual(
    address.startsWith('tb1'),
    true,
  )
})

it('Can validate an addresses', () => {
  const addresses = [
    //'n1s2ufETs6XaWemggpEa2NmZoU8DDgvhkT', // Testnet address
    '1HNuzRs6Veax9aUoFDg3kkfFvZcjKx2aBV', // Legacy or p2pkh
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // Script/Legacy Segwit or p2sh
    'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', // Native Segwit or bech32
    //'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', // Taproot or bc1p
  ]

  addresses.forEach(i => {
    const isValid = validateAddress(i)
    assert.isTrue(isValid)
  })
})

it('Can validate a tx', async () => {
  const expectedTxData = {
    from: 'n1s2ufETs6XaWemggpEa2NmZoU8DDgvhkT',
    to: 'n1cTdpKJHb9922eFTCnncui3KGVU6Fvw43',
    amount: 0.01,
    change: 0.02275045,
    fee: 0.00009900
  }

  const tx = {
    "tx": {
      "block_height": -1,
      "block_index": -1,
      "hash": "b8f021c098b22ff0746bfd61a5c8ec04cbc2b8c51012d0fa7453161df11bab32",
      "addresses": [
        "n1s2ufETs6XaWemggpEa2NmZoU8DDgvhkT",
        "n1cTdpKJHb9922eFTCnncui3KGVU6Fvw43"
      ],
      "total": 3275045,
      "fees": 9900,
      "size": 226,
      "vsize": 226,
      "preference": "low",
      "relayed_by": "178.235.245.81",
      "received": "2023-08-27T06:36:34.986162763Z",
      "ver": 1,
      "double_spend": false,
      "vin_sz": 1,
      "vout_sz": 2,
      "confirmations": 0,
      "inputs": [
        {
          "prev_hash": "97fc2aa56d052bb34d62f7ce283691d28a30b4601abb663437f04c2af1548ee8",
          "output_index": 14,
          "output_value": 3284945,
          "sequence": 4294967295,
          "addresses": [
            "n1s2ufETs6XaWemggpEa2NmZoU8DDgvhkT"
          ],
          "script_type": "pay-to-pubkey-hash",
          "age": 2471480
        }
      ],
      "outputs": [
        {
          "value": 1000000,
          "script": "76a914dc6d168058ed071b429864c530aef320c3974cea88ac",
          "addresses": [
            "n1cTdpKJHb9922eFTCnncui3KGVU6Fvw43"
          ],
          "script_type": "pay-to-pubkey-hash"
        },
        {
          "value": 2275045,
          "script": "76a914df2eafb7c3fdbf0488bd8fefaecf9eca441efdf188ac",
          "addresses": [
            "n1s2ufETs6XaWemggpEa2NmZoU8DDgvhkT"
          ],
          "script_type": "pay-to-pubkey-hash"
        }
      ]
    },
    "tosign_tx": [
      "0100000001e88e54f12a4cf0373466bb1a60b4308ad2913628cef7624db32b056da52afc970e0000001976a914df2eafb7c3fdbf0488bd8fefaecf9eca441efdf188acffffffff0240420f00000000001976a914dc6d168058ed071b429864c530aef320c3974cea88ace5b62200000000001976a914df2eafb7c3fdbf0488bd8fefaecf9eca441efdf188ac0000000001000000"
    ],
    "tosign": [
      "3891c3f38a9491511b1cea030036dfa6b86f27a9049ecad830adf180472984b9"
    ]
  }

  const validateResult = await validateTx(tx, expectedTxData, true)
  assert(validateResult.isRight)
})

// it('Can calculate network fee for a transaction', () => {
//   const tx = new Transaction()

//   const input = new Transaction.Input()
//   // eslint-disable-next-line fp/no-mutation
//   input.prevTxId = Buffer.from('97fc2aa56d052bb34d62f7ce283691d28a30b4601abb663437f04c2af1548ee8', 'hex')
//   tx.addInput(input)

//   assert.strictEqual(
//     address.startsWith('tb1'),
//     true,
//   )
// })


it('Can sign a transaction', async () => {
  const tx = {
    "tx": {
      "block_height": -1,
      "block_index": -1,
      "hash": "b8f021c098b22ff0746bfd61a5c8ec04cbc2b8c51012d0fa7453161df11bab32",
      "addresses": [
        "n1s2ufETs6XaWemggpEa2NmZoU8DDgvhkT",
        "n1cTdpKJHb9922eFTCnncui3KGVU6Fvw43"
      ],
      "total": 3275045,
      "fees": 9900,
      "size": 226,
      "vsize": 226,
      "preference": "low",
      "relayed_by": "178.235.245.81",
      "received": "2023-08-27T06:36:34.986162763Z",
      "ver": 1,
      "double_spend": false,
      "vin_sz": 1,
      "vout_sz": 2,
      "confirmations": 0,
      "inputs": [
        {
          "prev_hash": "97fc2aa56d052bb34d62f7ce283691d28a30b4601abb663437f04c2af1548ee8",
          "output_index": 14,
          "output_value": 3284945,
          "sequence": 4294967295,
          "addresses": [
            "n1s2ufETs6XaWemggpEa2NmZoU8DDgvhkT"
          ],
          "script_type": "pay-to-pubkey-hash",
          "age": 2471480
        }
      ],
      "outputs": [
        {
          "value": 1000000,
          "script": "76a914dc6d168058ed071b429864c530aef320c3974cea88ac",
          "addresses": [
            "n1cTdpKJHb9922eFTCnncui3KGVU6Fvw43"
          ],
          "script_type": "pay-to-pubkey-hash"
        },
        {
          "value": 2275045,
          "script": "76a914df2eafb7c3fdbf0488bd8fefaecf9eca441efdf188ac",
          "addresses": [
            "n1s2ufETs6XaWemggpEa2NmZoU8DDgvhkT"
          ],
          "script_type": "pay-to-pubkey-hash"
        }
      ]
    },
    "tosign_tx": [
      "0100000001e88e54f12a4cf0373466bb1a60b4308ad2913628cef7624db32b056da52afc970e0000001976a914df2eafb7c3fdbf0488bd8fefaecf9eca441efdf188acffffffff0240420f00000000001976a914dc6d168058ed071b429864c530aef320c3974cea88ace5b62200000000001976a914df2eafb7c3fdbf0488bd8fefaecf9eca441efdf188ac0000000001000000"
    ],
    "tosign": [
      "3891c3f38a9491511b1cea030036dfa6b86f27a9049ecad830adf180472984b9"
    ]
  }

  const pk = 'a2710c8f2075615aa8e4ea45eb6b81fea155353a8b5fd3aff7fc84bfc426a4c4'
  const signedTx = signTx(tx, pk, true)

  // const hash = Buffer.from(tx.tosign, 'hex')
  // const strSig = Buffer.from(signedTx.value.signatures[0], 'hex').toString()
  // const sig = crypto.Signature.fromString(strSig)
  // const pubkey = new PrivateKey(pk, Networks.testnet).toPublicKey()
  
  console.log(signedTx.value)
  //const verified = crypto.ECDSA.verify(hash, sig, pubkey)
  //assert.isTrue(verified)
})