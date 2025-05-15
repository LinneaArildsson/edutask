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
            todos: "Active ToDo"
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

  it('ID: 2.1 = should toggle active todo to done and show it as checked', () => {
    cy.contains('My Task').click();
    cy.contains('.todo-list .todo-item', 'Active ToDo')
      .as('activeTodo');

    cy.get('@activeTodo')
      .find('.checker')
      .click()
      .then(() => {
        // Retry until the class is present or timeout hits
        cy.get('@activeTodo')
          .find('.checker', { timeout: 7000 })
          .should(($el) => {
            expect($el.hasClass('checked'));
          });
      });
  });

  it('ID: 2.2 = should toggle done todo to active and show it as unchecked', () => {

    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/todos/create',
      form: true,
      body: {
        taskid: taskId,
        description: "Done ToDo",
        done: true
      },
    });

    cy.contains('My Task').click();
    
    cy.contains('.todo-list .todo-item', 'Done ToDo')
      .as('doneTodo');

    cy.get('@doneTodo')
      .find('.checker')
      .click()
      .then(() => {
        // Retry until the class is present or timeout hits
        cy.get('@doneTodo')
          .find('.checker', { timeout: 7000 })
          .should(($el) => {
            expect($el.hasClass('unchecked'));
          });
      });
  });

  it('ID: 3.1 = should delete todo item when pressing "X" symbol', () => {
    cy.contains('My Task').click();
    cy.get('.todo-list .todo-item').contains('Active ToDo').parent().find('.remover').click();
    cy.get('.todo-list').should('not.contain', 'Active ToDo');
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
