describe('UI', () => {
    before(() => {});

    it('Verification successful', () => {
        cy.visit('/regular');

        cy.get('#verifyRoute').click();

        cy.get('#verificationSuccessfulModal').should('be.visible');
        cy.get('#verificationSuccessfulModal > .modal-dialog > .modal-content > .modal-body > p').should(
            'have.text',
            'No errors detected during verification'
        );

        cy.get('#verificationSuccessfulModal > .modal-dialog > .modal-content > .modal-header > .close > span').click();

        cy.get('#singlePath > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#pathLength > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#pathLength > .info-box-content > .info-box-number')
            .invoke('text')
            .then(t => {
                expect(t).match(/[+-]?([0-9]*[.])?[0-9]+ km/);
            });
        cy.get('#routeType > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#routeType > .info-box-content > .info-box-number').should('have.text', 'Normal');
        cy.get('#numberOfStations > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#stationsOrder > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#stationsOnPath > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#elevationGain > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#elevationGain > .info-box-content > .info-box-number')
            .invoke('text')
            .then(t => {
                expect(t).match(/[+-]?([0-9]*[.])?[0-9]+ m/);
            });
        cy.get('#elevationLoss > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#elevationLoss > .info-box-content > .info-box-number')
            .invoke('text')
            .then(t => {
                expect(t).match(/[+-]?([0-9]*[.])?[0-9]+ m/);
            });
        cy.get('#elevationTotalChange > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#elevationTotalChange > .info-box-content > .info-box-number')
            .invoke('text')
            .then(t => {
                expect(t).match(/[+-]?([0-9]*[.])?[0-9]+ m/);
            });
    });

    it('Verification failed', () => {
        cy.visit('/13_stations');

        cy.get('#verifyRoute').click();

        cy.get('#verificationFailedModal').should('be.visible');
        cy.get('#verificationFailedModal > .modal-dialog > .modal-content > .modal-body > div > ul > li').should(
            'have.text',
            'Station 14 not found.'
        );

        cy.get('#verificationFailedModal > .modal-dialog > .modal-content > .modal-header > .close > span').click();

        cy.get('#singlePath > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#pathLength > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#pathLength > .info-box-content > .info-box-number')
            .invoke('text')
            .then(t => {
                expect(t).match(/[+-]?([0-9]*[.])?[0-9]+ km/);
            });
        cy.get('#routeType > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#routeType > .info-box-content > .info-box-number').should('have.text', 'Normal');
        cy.get('#numberOfStations > .info-box-icon').should('have.class', 'bg-yellow');
        cy.get('#stationsOrder > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#stationsOnPath > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#elevationGain > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#elevationGain > .info-box-content > .info-box-number')
            .invoke('text')
            .then(t => {
                expect(t).match(/[+-]?([0-9]*[.])?[0-9]+ m/);
            });
        cy.get('#elevationLoss > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#elevationLoss > .info-box-content > .info-box-number')
            .invoke('text')
            .then(t => {
                expect(t).match(/[+-]?([0-9]*[.])?[0-9]+ m/);
            });
        cy.get('#elevationTotalChange > .info-box-icon').should('have.class', 'bg-green');
        cy.get('#elevationTotalChange > .info-box-content > .info-box-number')
            .invoke('text')
            .then(t => {
                expect(t).match(/[+-]?([0-9]*[.])?[0-9]+ m/);
            });
    });
});
