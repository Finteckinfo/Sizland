/// <reference types="cypress" />
import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  env: {
    NEXT_URL: 'http://localhost:3000',
    ERP_URL: 'http://localhost:4173',
    ERP_BACKEND_URL: 'http://localhost:5000',
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    experimentalRunAllSpecs: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    setupNodeEvents(_on: Cypress.PluginEvents, _config: Cypress.PluginConfigOptions) {
      // place for future node event hooks (e.g., reporting)
    },
  },
});
