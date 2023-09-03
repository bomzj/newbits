/* eslint-disable max-lines */
import './init'
import { Networks, PrivateKey, Address, Transaction, Script, Unit, 
  crypto, Message } from 'bitcore-lib'
import { tryCatch, pipeWith, always, ifElse, identity, compose, pipe, 
  cond, either, is, or, bind, invoker, map, partialRight, andThen } from 'ramda'
import { Either } from 'ramda-fantasy'

export const toBtc = satoshis => Unit.fromSatoshis(satoshis).toBTC()
export const toSatoshis = btc => Unit.fromBTC(btc).toSatoshis()

// TODO: Define Errors and use them in the functions as Failure result(Either.Left)
export const TxError = {
  NotEnoughFundsToCoverFee: 1,
  InvalidRecipientAddress: 2,
  NotEnoughFunds: 3,
  AmountMustBeGreaterThanZero: 4,
  UnknownError: 0
}

export function generatePrivateKey(isTestnet = false) {
  //const network = isTestnet ? Networks.testnet : Networks.livenet
  const pk = new PrivateKey()
  return pk.toString()
}

export function getAddress(privateKey, isTestnet = false) {
  const network = isTestnet ? Networks.testnet : Networks.livenet
  const pk = new PrivateKey(privateKey, network)
  const segwitAddress = 
    Address.fromPublicKey(pk.publicKey, network, Address.PayToWitnessPublicKeyHash)
  return segwitAddress.toString()
}

export function validateAddress(address, isTestnet) {
  const network = isTestnet ? Networks.testnet : Networks.livenet
  return !!tryCatch(() => new Address(address, network), always(false))
    (address, network)
}

export async function fetchBalances(addresses, isTestnet) {
  const network =  isTestnet ? 'test3' : 'main'
  const url = `https://api.blockcypher.com/v1/btc/${network}/addrs/` + 
    addresses.join(';') 
  
  return (
    fetch(url)
    .then(
      ifElse(res => res.ok, res => res.json(), res => Promise.reject(res))
    )
    .then(data => Array.isArray(data) ? data : [data])
    .then(
      map(i => ({ 
        address: i.address, 
        balance: toBtc(i.balance)
      }))
    )
    .then(Either.Right)
    .catch(Either.Left)
  )
}

/**
 * @param {{ from: string, to: string, amount: number | 'Max'}} param0 
 * @param {boolean} isTestnet 
 * @returns 
 */
export async function createTx({ from, to, amount }, isTestnet) { 
  const blockcypherToken = 'e66ef0174a8141d4812ca11d32b2f41b'
  const network =  isTestnet ? 'test3' : 'main'

  const createTxUrl = 
    `https://api.blockcypher.com/v1/btc/${network}/txs/new?` +
    `token=${blockcypherToken}&` +
    'includeToSignTx=true'

  const value = amount == 'Max' ? -1 : toSatoshis(amount)
  const txPayload = {
    inputs: [{ addresses: [from] }],
    outputs: [{ addresses: [to], value }]
  } 

  return (
    await fetch(createTxUrl, { method: 'post', body: JSON.stringify(txPayload) })
    .then(
      res => res.json()
      //ifElse(res => res.ok, res => res.json(), res => Promise.reject(res))
    )
    .then(tx => {
      const errors = tx?.errors
      
      if (errors?.length == 1 && 
          errors[0].error.match(/^Not enough funds after fees/)) {
        return Either.Left(TxError.NotEnoughFundsToCoverFee)
      } else if (errors) {
        return Either.Left(TxError.UnknownError)
      }

      return Either.Right(tx)
    })
    .catch(() => Either.Left(TxError.UnknownError))
  )
}

const parseOutput = network => output => {
  const outputObj = output.toObject()
  const outputScriptHex = outputObj.script
  const outputScriptBuffer = Buffer.from(outputScriptHex, 'hex')
  const outputScript = new Script(outputScriptBuffer)
  const address = outputScript.toAddress(network).toString()
  return { address, value: toBtc(output.satoshis) }
}

const doubleHash = pipe(
  hex => Buffer.from(hex, 'hex'), 
  crypto.Hash.sha256, 
  crypto.Hash.sha256, 
  buff => buff.toString('hex')
)

export const validateTx = tryCatch(
  (tx, { from, to, amount, change, fee }, isTestnet) => { 
    const network =  isTestnet ? Networks.testnet : Networks.livenet
    const rawTx = tx.tosign_tx[0]
    const decodedRawTx = new Transaction(rawTx)
    const outputs = decodedRawTx.outputs.map(parseOutput(network))
   
    // validate that correct amount is sent to recipient
    const hasRecipientCorrectAmount = 
      outputs.find(i => i.address == to).value == amount

    if (!hasRecipientCorrectAmount) 
      return Either.Left(`Incorrect recipient's amount`)
      
    // validate sender's change
    const isChangeCorrect = 
      outputs.find(i => i.address == from).value == change

    if (!isChangeCorrect) 
      return Either.Left(`Incorrect sender's change`)
    
    // double sha256 raw tx and match with the data to sign
    const expectedHash = doubleHash(tx.tosign_tx[0])
    if (tx.tosign[0] != expectedHash) 
      return Either.Left(`Raw tx doesn't match signature`)

    return Either.Right(tx)
  }, Either.Left)

export const signTx = tryCatch(
  (tx, privateKey, isTestnet) => {
  const network =  isTestnet ? Networks.testnet : Networks.livenet
  const tosign = Buffer.from(tx.tosign[0], 'hex')
  const pk = new PrivateKey(privateKey, network)
  const signature = crypto.ECDSA.sign(tosign, pk)
  const hexSignature = signature.toString()
  const pubkey = pk.toPublicKey().toString('hex')
  const signedTx = { ...tx, signatures: [hexSignature], pubkeys: [pubkey]}
  return Either.Right(signedTx)
}, Either.Left)

export async function sendTx(tx, isTestnet) { 
  const blockcypherToken = 'e66ef0174a8141d4812ca11d32b2f41b'
  const network =  isTestnet ? 'test3' : 'main'

  const sendTxUrl = 
    `https://api.blockcypher.com/v1/btc/${network}/txs/send?` +
    `token=${blockcypherToken}`

  return (
    await fetch(sendTxUrl, { method: 'post', body: JSON.stringify(tx) })
    .then(
      res => res.json()
      //ifElse(res => res.ok, res => res.json(), res => Promise.reject(res))
    )
    .then(tx => {
      const errors = tx?.errors
      if (errors) return Either.Left(errors[0])
     
      return Either.Right(tx)
    })
    .catch(Either.Left)
  )
}

/** toWalletTx
  * @typedef {{ 
  *   token: string, 
  *   from: string, 
  *   to: string, 
  *   amount: number,
  *   fee: number
  *  }} WalletTx
 * @param {*} tx 
 * @returns {WalletTx}
 */
export function parseTx(tx) {
  return ({
    token: 'btc',
    from: tx.tx.inputs[0].addresses[0],
    to: tx.tx.outputs[0].addresses[0],
    amount: toBtc(tx.tx.outputs[0].value),
    fee: toBtc(tx.tx.fees)
  })
}

// export async function getNetworkFee(tx) {
//   return tx.tx.fees
// }
