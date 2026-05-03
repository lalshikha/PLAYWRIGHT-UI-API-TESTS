@ui @smoke @selfheal @demo
Feature: Flaky selector self-heal demo

  Scenario: Login button selector drift is self-healed
    Given user opens "saucedemoUrl"
    And "login_username" should be visible
    When user enters "standard_user" in "login_username"
    And user enters "secret_sauce" in "login_password"
    And user clicks "login_loginButton"
    Then "inventory_page" should be visible
