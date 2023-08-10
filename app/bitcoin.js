import ECPairFactory from 'ecpair'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import * as bitcoin from 'bitcoinjs-lib'
import { tryCatch, pipeWith, always, ifElse, identity, compose, 
  cond, either, is, or, bind, invoker, map, partialRight, andThen } from 'ramda'
import { Either } from 'ramda-fantasy'

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

export async function fetchBalances(addresses, isTestnet) {
  const network =  isTestnet ? 'test3' : 'main'
  const url = `https://api.blockcypher.com/v1/btc/${network}/addrs/` + addresses.join(';')
  
  return (
    fetch(url)
    .then(
      ifElse(res => res.ok, res => res.json(), res => Promise.reject(res))
    )
    .then(data => Array.isArray(data) ? data : [data])
    .then(
      map(i => ({ 
        address: i.address, 
        balance: i.balance * 0.00000001 
      }))
    )
    .then(Either.Right)
    .catch(Either.Left)
  )
}