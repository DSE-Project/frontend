describe('Dashboard Page - Core Functionality', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })

  it('renders the welcome message', () => {
    cy.get('[data-cy=welcome-message]', { timeout: 20000 })
      .should('exist')
      .and('contain.text', 'Welcome')
  })

  it('displays the page subtitle', () => {
    cy.contains("Here's your recession risk dashboard.").should('be.visible')
  })

  it('renders model prediction cards', () => {
    cy.get('[data-cy=model-prediction]').should('exist')
  })

  it('renders the macro indicators snapshot section', () => {
    cy.get('[data-cy=macro-indicators]').should('be.visible')
  })

  it('renders the economic indicators charts', () => {
    cy.get('[data-cy=economic-indicators]').should('be.visible')
  })

  it('shows sidebar and header', () => {
    cy.get('header').should('exist')
    cy.get('[data-cy=sidebar]').should('exist')
  })

  it('should adjust layout when sidebar collapses', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=sidebar-toggle]').length) {
        cy.get('[data-cy=sidebar-toggle]').click()
        cy.get('main').should('have.class', 'ml-16')
      }
    })
  })
})
