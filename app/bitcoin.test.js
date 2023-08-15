import { assert, expect, test, it, describe } from 'vitest'
import { times, is, pipe, tryCatch } from 'ramda'
import { Either } from 'ramda-fantasy'
import { generatePrivateKey, getAddress, validateAddress } from './bitcoin'
import { Buffer } from 'buffer'

it('Can generate a random bitcoin address', async () => {
  const newAddress = pipe(
    generatePrivateKey,
    getAddress,
  )()

  // bitcoin P2PKH addresses start with a '1'
  assert.strictEqual(newAddress.startsWith('1'), true)

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

  // bitcoin testnet P2PKH addresses start with a 'm' or 'n'
  assert.strictEqual(
    address.startsWith('m') || address.startsWith('n'),
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