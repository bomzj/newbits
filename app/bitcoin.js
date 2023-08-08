import ECPairFactory from 'ecpair'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import * as bitcoin from 'bitcoinjs-lib'

const ECPair = ECPairFactory(ecc)

export function generatePrivateKey(isTestnet = false) {
  const network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  const keyPair = ECPair.makeRandom({ network })
  return keyPair.privateKey.toString('hex')
}

export function getAddress(privateKey, isTestnet = false) {
  const network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network })
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network })
  return address
}

export async function getBalance(address, isTestnet) {
  const url = isTestnet 
    ? 'https://api.blockcypher.com/v1/btc/test3/addrs/'
    : 'https://api.blockcypher.com/v1/btc/main/addrs/'

  return (
    fetch(url + address)
    .then((res) => res.json())
    .then(data => data.balance * 0.00000001)
  )
}