describe('Home page', () => {
  it('loads and shows hero title and categories', () => {
    cy.visit('/')
    cy.contains('Empowering talent')
    cy.get('.categories-title').should('contain', 'Browse top categories')
  })
})