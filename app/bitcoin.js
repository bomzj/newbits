// TODO: move away from legacy ecpair to bip32 https://github.com/bitcoinjs/bitcoinjs-lib/issues/1746#issuecomment-968371375
import ECPairFactory from 'ecpair'
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import * as bitcoin from 'bitcoinjs-lib'
import { tryCatch, pipeWith, always, ifElse, identity, compose, 
  cond, either, is, or, bind, invoker, map, partialRight, andThen } from 'ramda'
import { Either } from 'ramda-fantasy'

// Fix for Bitcoinjs-lib https://github.com/bitcoinjs/bitcoinjs-lib/issues/1969
if (typeof window !== 'undefined') {
  import('buffer').then(module => 
    // eslint-disable-next-line fp/no-mutation
    Uint8Array.prototype.readUint8 = module.Buffer.prototype.readUint8
  )
}

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

export function validateAddress(address, isTestnet) {
  const network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  
  return !!tryCatch(bitcoin.address.toOutputScript, always(false))
    (address, network)
}