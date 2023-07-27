import { assert, expect, it, describe } from 'vitest'
import { Either } from 'ramda-fantasy'
import { decryptFromLocalStorage } from './encryptedLocalStorage'

describe('Encrypted Local Storage', () => {
  
  it.each([
    ['with correct password', '1', Either.isRight],
    ['with wrong password', 'haha', Either.isLeft],
    ['without password', '', Either.isLeft],
  ])('Decrypt data %s', async (_, password, expectedPredicate) => {
    localStorage.setItem(
      'data', 
      'Q30a49y9eKyC2m/HrHlP8Woup+qPzfxC9CTNLOVvMcMnEbQvZZJeOXWXT8nNhA=='
    )
    
    await decryptFromLocalStorage('data', password)
      .then(expectedPredicate)
      .then(assert.isTrue)
  })

  it.each([
    ['empty', null, Either.isRight],
    ['unencrypted', '{}', Either.isRight],
  ])('Decrypt %s data', async (_, value, expectedPredicate) => {
    localStorage.setItem('data', value)

    await decryptFromLocalStorage('data')
      .then(expectedPredicate)
      .then(assert.isTrue)
  })
})