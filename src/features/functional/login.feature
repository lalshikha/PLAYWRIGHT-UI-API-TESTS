@regression @functional @api @login
Feature: Functional API Login Validation

  @TCId-008
  Scenario Outline: API backend validates login credentials
    Given API service validates <user> login

    Examples:
      | user          |
      | standard_user |
      | visual_user   |

