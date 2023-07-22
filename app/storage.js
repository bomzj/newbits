import { encrypt, decrypt } from './encryption'

export function saveDataToStorage(key, data) {
  const json = JSON.stringify(data)
  localStorage.setItem(key, json)
}

export async function saveDataEncryptedToStorage(key, data, password) {
  const json = JSON.stringify(data)
  const encryptedJson = await encrypt(json, password)
  localStorage.setItem(key, encryptedJson)
}