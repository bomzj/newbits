import { safeFn } from './safeFn'
import { encrypt, decrypt } from './encryption'

export const parseJsonFromStorage = (key) => {
  const json = localStorage.getItem(key)
  return JSON.parse(json)
}

export const parseEncryptedJsonFromStorage = async (key, password) => {
  const json = localStorage.getItem(key)
  const decryptedJson = await decrypt(json, password)
  return JSON.parse(decryptedJson)
}

export function saveDataToStorage(key, data) {
  const json = JSON.stringify(data)
  localStorage.setItem(key, json)
}

export async function saveDataEncryptedToStorage(key, data, password) {
  const json = JSON.stringify(data)
  const encryptedJson = await encrypt(json, password)
  localStorage.setItem(key, encryptedJson)
}