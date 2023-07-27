import { curry, otherwise, andThen, pipe, partialRight } from 'ramda'
import { Either } from 'ramda-fantasy'
import { encrypt, decrypt } from './encryption'

export async function encryptToLocalStorage(key, data, password) {
  const encryptOrPass = partialRight(
    async (data, password) => data && password ? encrypt(data, password) : data,
    [password]
  )

  const save = curry((key, data) => localStorage.setItem(key, data))
  const saveToPredefinedKey = save(key)

  return pipe(
    JSON.stringify,
    encryptOrPass,
    andThen(saveToPredefinedKey)
  )(data)
}

export async function decryptFromLocalStorage(key, password) {
  const decryptOrPass = partialRight(
    async (data, password) => data && password ? decrypt(data, password) : data,
    [password]
  )

  return pipe(
    key => localStorage.getItem(key),
    decryptOrPass,
    andThen(JSON.parse),
    andThen(Either.Right),
    otherwise(Either.Left)
  )(key)
}