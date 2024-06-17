describe('Logging into the system and testing add functionality', () =>{
    // Define variables that are needed
    let uid; // User ID
    let name; // Name of the user (firstName + ' '+ lastName)
    let email; // Email of the user

    before(function(){
        // Create a dummy user from fixture
        cy.fixture('user.json').then((user) =>{
            cy.request({
                method: 'POST',
                url: 'http://localhost:5000/users/create',
                form: true,
                body: user
            }).then((response) =>{
                uid = response.body._id.$oid;
                name = user.firstName + ' ' + user.lastName;
                email = user.email;
            });
        });
    });

    beforeEach(function(){
        // Loging before each test case
        cy.visit('http://localhost:3000');

        // Detect a div which contains "Email Address", find the input and type
        cy.contains('div', 'Email Address')
            .find('input[type=text]')
            .type(email);
    
            // Submit the form on this page
            cy.get('form').submit();
    
            //Assert that the user is now logged in
            cy.get('h1').should('contain.text', 'Your tasks');
    });


    // Add a Task with a URL YT video
    it('should add a new task with a YT URL/video', () => {
        cy.get('input[placeholder="Title of your Task"]').type('Never Gonna Give You Up');
        cy.get('input[placeholder="Viewkey of a YouTube video (the part after /watch?v= in the URL), e.g., dQw4w9WgXcQ"]').type('dQw4w9WgXcQ');
        cy.get('input[type=submit]').should('have.value', 'Create new Task').click();

    });

    // Test Case 1
    // 1.1
    it('should enter detailed view of todos-list and add button should be disabled', () => {

        cy.contains('Never Gonna Give You Up').click();
        
        cy.get('input[placeholder="Add a new todo item"]').clear();
        cy.get('input[type=submit]').contains('Add').should('be.disabled');
    });

    // // 1.2
    it('should enter detailed view of todos-list and add a new todo item', () => {

        cy.contains('Never Gonna Give You Up').click();

        cy.get('input[placeholder="Add a new todo item"]').type('Give me up');
        cy.get('form.inline-form input[type=submit]').should('have.value', 'Add').click();
        cy.get('.todo-list').last().should('contain', 'Give me up');

    });

    // 2.1
    it('should click the toggle todo item', () => {
        // Ensure that we are on the correct task detailed view 
        cy.contains('Never Gonna Give You Up').click();

        // Click the icon to mark the todo as done
        cy.get('.todo-list .todo-item').contains('Give me up').parent()
        .find('.checker').click();
    });

    it('should check if todo item is marked as checked', () =>{
        // Ensure that we are on the correct task detailed view 
        cy.contains('Never Gonna Give You Up').click();

        // Check if the todo item is marked done
        cy.get('.todo-list .todo-item').contains('Give me up').parent()
        .find('.checker').should('have.class', 'checked');
    });

    // 2.2
    it('should toggle todo item as active when the icon is clicked again', () => {
        // Ensure that we are on the correct task detailed view 
        cy.contains('Never Gonna Give You Up').click();
        
        // Click the icon again to mark the todo as active
        cy.get('.todo-list .todo-item')
        .contains('Give me up')
        .parent()
        .find('.checker')
        .click();

    });

    it('should have the checker as unchecked', () => {
        // Ensure that we are on the correct task detailed view 
        cy.contains('Never Gonna Give You Up').click();

        // Check if the todo item is marked as unchecked
        cy.get('.todo-list .todo-item')
        .contains('Give me up')
        .parent()
        .find('.checker')
        .should('have.class', 'unchecked');
    });

    // 3.1
    it('should remove todo item when the X symbol is clicked', () => {
        cy.contains('Never Gonna Give You Up').click();

        // Add a todo item to remove
        cy.get('input[placeholder="Add a new todo item"]').type('Remove me');
        cy.get('form.inline-form input[type=submit]').should('have.value','Add').click();

        // Ensure the new todo item is added
        cy.get('.todo-list').last().should('contain', 'Remove me');

        // Click the X symbol to remove the todo item 
        cy.get('.todo-list .todo-item')
        .contains('Remove me')
        .parent()
        .find('.remover')
        .dblclick();

        // Check if the todo item is removed
        cy.get('.todo-list').should('not.contain', 'Remove me')

    });


    after(function(){
        // Clean up by deleting the user from the database
        cy.request({
            method: 'DELETE',
            url:`http://localhost:5000/users/${uid}`
        }).then((response) =>{
            cy.log(response.body);
        });
    });


});