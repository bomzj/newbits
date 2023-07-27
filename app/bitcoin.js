import ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import bitcoin from 'bitcoinjs-lib'

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