describe('Custom Simulation Tool - Core Functionality', () => {

  const BASE_URL = 'http://localhost:5173/simulation';

  beforeEach(() => {
    // Visit the Custom Simulation tool page
    cy.login()
    cy.visit(BASE_URL);
  });

//   it('renders the simulation page title and description', () => {
//     cy.contains('Custom Simulation Tool').should('be.visible');
//     cy.contains('simulate different scenarios').should('be.visible');
//   });

  it('shows authentication prompt if user is not logged in', () => {
    // In case the app redirects unauthenticated users
    cy.get('body').then(($body) => {
      if ($body.text().includes('Authentication Required')) {
        cy.contains('Login to Continue').should('exist');
      } else {
        cy.log('User appears to be logged in, continuing tests...');
      }
    });
  });

  it('renders the simulation tabs (1, 3, 6 months)', () => {
    cy.contains('1 Month Ahead').should('exist');
    cy.contains('3 Months Ahead').should('exist');
    cy.contains('6 Months Ahead').should('exist');
  });

  it('switches between simulation tabs correctly', () => {
    cy.contains('3 Months Ahead').click();
    cy.contains('3 Months Ahead')
      .should('have.class', 'text-blue-600')
      .and('have.class', 'border-blue-500');

    cy.contains('6 Months Ahead').click();
    cy.contains('6 Months Ahead').should('have.class', 'text-blue-600');
  });

//   it('renders economic indicator controls after data loads', () => {
//     // Wait for simulated API response
//     cy.wait(2000);
//     cy.contains('Economic Indicators').should('be.visible');
//   });

  it('allows modifying input sliders and numeric fields', () => {
    cy.wait(2000);

    cy.get('input[type="range"]').first().as('firstSlider');
    cy.get('@firstSlider').invoke('val', 0.5).trigger('input');

    cy.get('input[type="number"]').first()
      .clear()
      .type('1.23')
      .should('have.value', '1.23');
  });

  it('handles randomize and reset buttons', () => {
    cy.wait(2000);
    cy.contains('Randomize Values').should('be.visible').click();
    cy.wait(1000);
    cy.contains('Reset to Default').click();
  });

   it('runs simulation and displays loading state for all periods', () => {
    // Intercept each prediction endpoint
    cy.intercept('POST', '/api/v1/simulate/predict/1m', {
      statusCode: 200,
      body: {
        prob_1m: 0.32,
        confidence_interval: {
          binary_prediction: 1,
          prediction_text: 'High Recession Risk'
        },
        timestamp: new Date().toISOString()
      }
    }).as('runSimulation1m')

    cy.intercept('POST', '/api/v1/simulate/predict/3m', {
      statusCode: 200,
      body: {
        prob_3m: 0.45,
        confidence_interval: {
          binary_prediction: 1,
          prediction_text: 'Moderate Recession Risk'
        },
        timestamp: new Date().toISOString()
      }
    }).as('runSimulation3m')

    cy.intercept('POST', '/api/v1/simulate/predict/6m', {
      statusCode: 200,
      body: {
        prob_6m: 0.67,
        confidence_interval: {
          binary_prediction: 1,
          prediction_text: 'High Recession Risk'
        },
        timestamp: new Date().toISOString()
      }
    }).as('runSimulation6m')

    // Run simulation for 1 Month Ahead
    // Run simulation for 1 Month Ahead
    cy.contains('1 Month Ahead').click()
    cy.contains('Run Simulation').click()
    cy.wait('@runSimulation1m')
    cy.contains('Recession Probability').should('be.visible')
    cy.contains('High Recession Risk').should('be.visible')

    // Run simulation for 3 Months Ahead
    cy.contains('3 Months Ahead').click()
    cy.contains('Run Simulation').click()
    cy.wait('@runSimulation3m')
    cy.contains('Recession Probability').should('be.visible')
    cy.contains('Moderate Recession Risk').should('be.visible')

    // Run simulation for 6 Months Ahead
    cy.contains('6 Months Ahead').click()
    cy.contains('Run Simulation').click()
    cy.wait('@runSimulation6m')
    cy.contains('Recession Probability').should('be.visible')
    cy.contains('High Recession Risk').should('be.visible')
  })


  it('shows error message if simulation API fails', () => {
    cy.intercept('POST', '**/simulate/predict/**', {
      statusCode: 500,
      body: {}
    }).as('failedSimulation');

    cy.contains('Run Simulation').click();

    cy.wait('@failedSimulation');
    cy.contains('Failed to run simulation').should('be.visible');
  });

});
