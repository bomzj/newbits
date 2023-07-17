const baseUrl = Cypress.config('baseUrl')

it('Can load a wallet created without password', () => {
  localStorage.setItem('wallet', '[]')

  cy.visit('/')
    .url()
    .should('eq', baseUrl + '/coins')
})