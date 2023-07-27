const baseUrl = Cypress.config('baseUrl')

it('Can unlock a wallet protected with password', () => {
  // Encrypt wallet with password of "1"
  localStorage.setItem(
    'keys', 
    'Q30a49y9eKyC2m/HrHlP8Woup+qPzfxC9CTNLOVvMcMnEbQvZZJeOXWXT8nNhA=='
  )

  cy.visit('/unlock-wallet')
    .get('[placeholder=Password]')
    .type('1')
    .get('[type=submit]')
    .click()
    .url()
    .should('eq', baseUrl + '/coins')
})