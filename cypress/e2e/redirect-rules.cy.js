/* eslint-disable max-nested-callbacks */
const baseUrl = Cypress.config('baseUrl')

describe('Redirect rules when wallet not created yet', () => {
  
  ['/welcome', '/create-wallet'].forEach(url => 
    it(`can visit "${url}" page`, () =>
      cy.visit(url)
        .url()
        .should('eq', baseUrl + url)
    )
  );

  ['/unlock-wallet', '/'].forEach(url => 
    it(`Should redirect to "/welcome" when visiting "${url}"`, () => 
      cy.visit(url)
        .url()
        .should('eq', baseUrl + '/welcome')
    )
  )
})

describe('Redirect rules when wallet exists and not encrypted', () => {

  beforeEach(() => {
    localStorage.setItem('keys', '{}')
  });
  
  ['/welcome', '/create-wallet', '/unlock-wallet'].forEach(url => 
      it(`Should redirect to "/" when visiting "${url}"`, () => 
        cy.visit(url)
          .url()
          .should('eq', baseUrl + '/')
      )
    )
  
  it('can visit "/" page', () => {
    const url = '/'
    cy.visit(url)
      .url()
      .should('eq', baseUrl + url)
  })
})

describe('Redirect rules when wallet exists and encrypted', () => {

  beforeEach(() => {
    // scramble wallet data to mimic encryption
    localStorage.setItem('keys', 'fdsafsafas')
  });
  
  ['/welcome', '/create-wallet', '/']
    .forEach(url => 
      it(`Should redirect to "/unlock-wallet" when visiting "${url}"`, () => 
        cy.visit(url)
          .url()
          .should('eq', baseUrl + '/unlock-wallet')
      )
    )

  it('can visit "/unlock-wallet" page', () => {
    const url = '/unlock-wallet'
    cy.visit(url)
      .url()
      .should('eq', baseUrl + url)
  })
})