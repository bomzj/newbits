const baseUrl = Cypress.config('baseUrl')

describe('Redirect rules when wallet not created yet', () => {
  
  ['/', '/create-wallet']
    .forEach(url => 
      it(`can visit "${url}" page`, () =>
        cy.visit(url)
          .url()
          .should('eq', baseUrl + url)
      )
    );

  ['/unlock-wallet', '/coins']
    .forEach(url => 
      it(`Should redirect to "/" when visiting "${url}"`, () => 
        cy.visit(url)
          .url()
          .should('eq', baseUrl + '/')
      )
    )
})

describe('Redirect rules when wallet exists and not encrypted', () => {

  beforeEach(() => {
    localStorage.setItem('keys', '{}')
  });
  
  ['/', '/create-wallet', '/unlock-wallet']
    .forEach(url => 
      it(`Should redirect to "/coins" when visiting "${url}"`, () => 
        cy.visit(url)
          .url()
          .should('eq', baseUrl + '/coins')
      )
    )
  
  it('can visit "/coins" page', () => {
    const url = '/coins'
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
  
  ['/', '/create-wallet', '/coins']
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