describe("Blog app", function () {
  beforeEach(function () {
    cy.request("POST", "http://localhost:3003/api/testing/reset");
    const user = {
      name: "Tushar Reddy",
      username: "root",
      password: "sekret",
    };
    cy.request("POST", "http://localhost:3003/api/users/", user);
    cy.visit("http://localhost:3000");
  });
  it("Login form is shown", function () {
    cy.contains("Login");
    cy.contains("username");
    cy.contains("password");
  });
  describe("Login", function () {
    it("succeeds with correct credentials", function () {
      cy.get("#username").type("root");
      cy.get("#password").type("sekret");
      cy.get("#login-button").click();
      cy.contains("Tushar Reddy logged in");
    });
    it("fails with wrong credentials", function () {
      cy.get("#username").type("root");
      cy.get("#password").type("wrong");
      cy.get("#login-button").click();
      cy.contains("Wrong username or password");
    });
  });
  describe("When logged in", function () {
    beforeEach(function () {
      cy.get("#username").type("root");
      cy.get("#password").type("sekret");
      cy.get("#login-button").click();
      cy.contains("New blog").click();
      cy.get("#title").type("Test Blog");
      cy.get("#author").type("Test Author");
      cy.get("#url").type("Test URL");
      cy.get("#create-button").click();
    });
    it("A blog can be created", function () {
      cy.contains("Test Blog");
    });
    it("A blog can be liked", function () {
      cy.contains("Test Blog");
      cy.contains("view").click();
      cy.contains("like").click();
      cy.contains("likes: 1");
    });
    it("A blog can be deleted", function () {
      cy.contains("Test Blog");
      cy.contains("view").click();
      cy.contains("remove").click();
      cy.contains("Blog deleted");
    });
  });
  describe("Only the creator of a blog can delete it", function () {
    beforeEach(function () {
      cy.get("#username").type("root");
      cy.get("#password").type("sekret");
      cy.get("#login-button").click();
      cy.contains("New blog").click();
      cy.get("#title").type("Test Blog");
      cy.get("#author").type("Test Author");
      cy.get("#url").type("Test URL");
      cy.get("#create-button").click();
      cy.contains("Test Blog");
    });
    it("A blog can be deleted", function () {
      cy.contains("view").click();
      cy.contains("remove").click();
      cy.contains("Blog deleted");
    });
    it("A blog cannot be deleted by another user", function () {
      cy.contains("logout").click();
      const user = {
        name: "Another User",
        username: "another",
        password: "another",
      };
      cy.request("POST", "http://localhost:3003/api/users/", user);
      cy.get("#username").type("another");
      cy.get("#password").type("another");
      cy.get("#login-button").click();
      cy.contains("Test Blog");
      cy.contains("view").click();
      cy.get("remove").should("not.exist");
    });
  });
  describe("Blogs are ordered by likes", function () {
    beforeEach(function () {
      cy.get("#username").type("root");
      cy.get("#password").type("sekret");
      cy.get("#login-button").click();
      cy.contains("New blog").click();
      cy.get("#title").type("Test Blog 1");
      cy.get("#author").type("Test Author 1");
      cy.get("#url").type("Test URL 1");
      cy.get("#create-button").click();
      cy.contains("New blog").click();
      cy.get("#title").type("Test Blog 2");
      cy.get("#author").type("Test Author 2");
      cy.get("#url").type("Test URL 2");
      cy.get("#create-button").click();
      cy.contains("New blog").click();
      cy.get("#title").type("Test Blog 3");
      cy.get("#author").type("Test Author 3");
      cy.get("#url").type("Test URL 3");
      cy.get("#create-button").click();
      cy.contains("Test Blog 1");
      cy.contains("Test Blog 2");
      cy.contains("Test Blog 3");
    });
    it("Blogs are ordered by likes", function () {
      cy.contains("Test Blog 1").parent().as("blog1");
      cy.contains("Test Blog 2").parent().as("blog2");
      cy.contains("Test Blog 3").parent().as("blog3");

      cy.get("@blog1").contains("view").click();
      cy.get("@blog1").contains("like").click();
      cy.wait(500);
      cy.get("@blog1").contains("like").click();
      cy.wait(500);
      cy.get("@blog1").contains("like").click();
      cy.wait(500);
      cy.get("@blog1").contains("hide").click();

      cy.get("@blog3").contains("view").click();
      cy.get("@blog3").contains("like").click();
      cy.wait(500);
      cy.get("@blog3").contains("like").click();
      cy.wait(500);
      cy.get("@blog3").contains("hide").click();

      cy.get("@blog2").contains("view").click();
      cy.get("@blog2").contains("like").click();
      cy.wait(500);
      cy.get("@blog2").contains("hide").click();

      cy.reload();

      cy.get(".Blog").then((blogs) => {
        cy.wrap(blogs[0]).contains("Test Blog 1");
        cy.wrap(blogs[1]).contains("Test Blog 3");
        cy.wrap(blogs[2]).contains("Test Blog 2");
      });
    });
  });
});
