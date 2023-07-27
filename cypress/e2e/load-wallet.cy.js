const baseUrl = Cypress.config('baseUrl')

it('Can load a wallet created without password', () => {
  localStorage.setItem('keys', '{}')

  cy.visit('/')
    .url()
    .should('eq', baseUrl + '/coins')
})