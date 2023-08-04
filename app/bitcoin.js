import ECPairFactory from 'ecpair'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import * as bitcoin from 'bitcoinjs-lib'

const ECPair = ECPairFactory(ecc)

export function generatePrivateKey() {
  const keyPair = ECPair.makeRandom()
  return keyPair.privateKey.toString('hex')
}

export function getAddress(privateKey) {
  const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'))
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
  return address
}

export async function getBalance(address) {
  return (
    fetch('https://blockchain.info/rawaddr/' + address)
    .then((res) => res.json())
    .then(Math.random)
  )
}