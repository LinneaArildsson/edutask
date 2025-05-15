describe('Logging into the system', () => {
    // Define variables that are needed
    let uid; // User ID
    let name; // Name of the user (firstName + ' ' + lastName)
    let email; // Email of the user
    let taskId;
  
    before(function () {
      // Create a dummy user from fixture
      cy.fixture('user.json').then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid;
          name = user.firstName + ' ' + user.lastName;
          email = user.email;          
        }).then(() => {

          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/tasks/create',
            form: true,
            body: {
              title: "My Task",
              url: "dQw4w9WgXcQ",
              description: "Description for My Task",
              userid: uid,
              todos: "Initial ToDo"
            },
          }).then((response) => {
            taskId = response.body[0]._id.$oid;
          });

        })
      });
    });
  
    beforeEach(function () {
      // Use cy.session to handle login and session management
      cy.visit('http://localhost:3000');
  
      // Detect a div which contains "Email Address", find the input and type
      cy.contains('div', 'Email Address')
        .find('input[type=text]')
        .type(email);
  
      // Submit the form on this page
      cy.get('form').submit();

    });

    it('ID: 1.2 = should disable the "Add" button when description is empty', () => {
        // Ensure that we are on the correct task detailed view
        cy.contains('My Task').click()
        
        cy.get('input[placeholder="Add a new todo item"').clear();
        cy.get('form.inline-form input[type=submit]').contains('Add').should('be.disabled')

    });
  
    it('ID: 1.1 = should add a new todo when the "Add" button is pressed', () => {
      // Ensure that we are on the correct task detailed view
      cy.contains('My Task').click();
  
      cy.get('input[placeholder="Add a new todo item"]').type('Take notes');
      cy.get('form.inline-form input[type=submit]').should('have.value', 'Add').click();
      cy.get('.todo-list').last().should('contain', 'Take notes');

    });

    it('ID: 2.1 = should change status to "done" when icon is clicked', () => {
        // Ensure that we are on the correct task detailed view
        cy.contains('My Task').click();
    
        cy.get('.todo-list .todo-item').contains('Take notes').parent().find('.checker').click();

      });

    it('ID: 2.1 = should have the checker as checked', () =>{
        // Ensure that we are on the correct task detailed view 
        cy.contains('My Task').click();

        // Check if the todo item is marked done
        cy.get('.todo-list .todo-item').contains('Take notes').parent().find('.checker').should('have.class', 'checked');

    });

    it('ID: 2.2 = should toggle todo item as active when the icon is clicked again', () => {
      // Ensure that we are on the correct task detailed view 
      cy.contains('My Task').click();
      
      // Click the icon again to mark the todo as active
      cy.get('.todo-list .todo-item').contains('Take notes').parent().find('.checker').click();

    });

    it('ID: 2.2 = should have the checker as unchecked', () => {
        // Ensure that we are on the correct task detailed view 
        cy.contains('My Task').click();

        // Check if the todo item is marked as unchecked
        cy.get('.todo-list .todo-item').contains('Take notes').parent().find('.checker').should('have.class', 'unchecked');

    });

    it('ID: 3.1 = should delete todo item when pressing "X" symbol', () => {
      // Ensure that we are on the correct task detailed view
      cy.contains('My Task').click();

      // Click the X symbol to remove the todo item 
      cy.get('.todo-list .todo-item').contains('Take notes').parent().find('.remover').click();
      
      // Check if the todo item is removed
      cy.get('.todo-list').should('not.contain', 'Take notes');

    });
  
    after(function () {
      // Clean up by deleting the user from the database
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/users/${uid}`,
      }).then((response) => {
        cy.log(response.body);
      });
    });
  });
  