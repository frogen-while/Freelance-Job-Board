/// <reference types="cypress" />

describe('Auth flow', () => {
  it('navigates to login and shows form', () => {
    cy.visit('/login')
    cy.get('input[placeholder="Email"]').should('exist')
    cy.get('input[placeholder="Password"]').should('exist')
  })
})