/// <reference types="cypress" />

describe('Lobby → ERP flow smoke test', () => {
  it('displays the lobby onboarding hero', () => {
    cy.visit('/lobby');
    cy.get('[data-testid="erp-onboarding-hero"]').should('exist');
  });
});
