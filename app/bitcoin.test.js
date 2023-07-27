import { assert, expect, test, it, describe } from 'vitest'
import { times, is, pipe } from 'ramda'
import { Either } from 'ramda-fantasy'
import { generatePrivateKey, getAddress } from './bitcoin'

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