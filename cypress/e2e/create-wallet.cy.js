const baseUrl = Cypress.config('baseUrl')

it('Can create a new wallet without password', () => 
  cy.visit('/')
    .contains('Create a new wallet')
    .click()
    .get('[placeholder=Password]')
    .type('1')
    .get('[type=submit]')
    .click()
    .url()
    .should('eq', baseUrl + '/coins')
)

it('Can create a new encrypted wallet', () => 
  cy.visit('/')
    .contains('Create a new wallet')
    .click()
    .get('[type=checkbox]')
    .check()
    .get('[type=submit]')
    .click()
    .url()
    .should('eq', baseUrl + '/coins')
)

// it('Redirect to "/unlock-wallet" page if wallet encrypted', () => {
//   localStorage.setItem('wallet', '[]')

//   cy.visit('/')
//     .contains('Create a new wallet')
//     .click()
//     .get('[type=checkbox]')
//     .check()
//     .get('[type=submit]')
//     .click()
//     .url()
//     .should('eq', baseUrl + '/coins')
// })