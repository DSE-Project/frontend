// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// cypress/support/commands.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Cypress.env('SUPABASE_URL')
const supabaseKey = Cypress.env('SUPABASE_ANON_KEY')

// Validate they exist
if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in Cypress environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

Cypress.Commands.add('login', () => {
  cy.wrap(
    supabase.auth.signInWithPassword({
      email: Cypress.env('TEST_USER_EMAIL'),
      password: Cypress.env('TEST_USER_PASSWORD')
    })
  ).then(({ data, error }) => {
    if (error) throw new Error(`Supabase login failed: ${error.message}`)

    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify(data.session))
    })
  })
})

