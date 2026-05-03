@smoke @regression @ui @login
Feature: UI Login Functionality

  Background:
    Given user opens "saucedemoUrl"

  @TCId-Login001
  Scenario Outline: Valid user login through UI flow
    Then visual validation passes for "login_username" element
    And visual validation passes for "login_password" element
    And visual validation passes for "login_loginButton" element
    And visual validation passes for "login" page
    When user enters "<username>" in "login_username"
    And user enters "testdata.password" in "login_password"
    And user clicks "login_loginButton"
    Then "inventory_page" should be visible

    Examples:
      | username       |
      | testdata.user1 |
      | testdata.user2 |

  @TCId-Login002
  Scenario: Login should fail for invalid/missing username and password
    When user enters "<username>" in "login_username"
    And user enters "<password>" in "login_password"
    And user clicks "login_loginButton"
    Then "login_error" should be visible
    And "login_error" text should be "<error_message>"

    Examples:
      | username        | password          | error_message                                                             |
      |                 | testdata.password | Epic sadface: Username is required                                        |
      | wrong_username  | testdata.password | Epic sadface: Username and password do not match any user in this service |
      | standard_user   |                   | Epic sadface: Password is required                                        |
      | standard_user   | wrong_password    | Epic sadface: Username and password do not match any user in this service |
      | locked_out_user | testdata.password | Epic sadface: Sorry, this user has been locked out.                       |

