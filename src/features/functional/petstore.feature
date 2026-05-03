@regression @functional @api @petstore
Feature: petstore

  @TCId-1001
  Scenario Outline: TC_GET_PET_BY_STATUS_001 Get pets by status
    # Description: Validate that GET /pet/findByStatus returns a valid list of pets
    # when status=available is passed, and confirm every returned pet belongs to the requested status.

    Given url PETSTORE_BASE_URL
    And header api_key = "special-key"
    And param status = <status>
    And path GET_PET_BY_STATUS_ENDPOINT
    When method get
    Then status 200
    And match response.headers['content-type'] contains "application/json"
    And match response is not empty
    And match response is an array of objects
    And match each response[*].status == <status>

    Examples:
      | status      |
      | "available" |
      | "pending"   |
      | "sold"      |

  @TCId-1003
  Scenario: TC_CREATE_PET_001 Add a new pet successfully
    # Description: Validate that a new pet can be created via POST /pet endpoint
    # with valid pet data. Response should return 200 with created pet details
    # including id, name, status, and other pet attributes.

    Given url PETSTORE_BASE_URL
    And header Content-Type = "application/json"
    And body is '{"id":0,"category":{"id":0,"name":"Dogs"},"name":"Fluffy","photoUrls":["https://example.com/photo.jpg"],"tags":[{"id":0,"name":"friendly"}],"status":"available"}'
    And path CREATE_PET_ENDPOINT
    When method post
    Then status 200
    And match response has field "id"
    And match response.id > 0
    And match response.name == "Fluffy"
    And match response.status == "available"
    And match response.category.name == "Dogs"
    And match response has header "content-type"
    And match response header content-type contains "application/json"