# PetStore API - Create Pet Test Case
## Positive Test Implementation

---

## ✅ Test Summary

**Test Case**: TC_CREATE_PET_001  
**Description**: Add a new pet successfully to PetStore  
**Status**: ✅ **PASSED**  
**Duration**: 1.5s  
**HTTP Method**: POST  
**Response Code**: 200  

---

## 🎯 Test Details

### Endpoint
- **Base URL**: https://petstore.swagger.io/v2
- **Path**: /pet
- **Full URL**: https://petstore.swagger.io/v2/pet
- **Method**: POST
- **Content-Type**: application/json

### Request Body (Valid Pet Data)
```json
{
  "id": 0,
  "category": {
    "id": 0,
    "name": "Dogs"
  },
  "name": "Fluffy",
  "photoUrls": [
    "https://example.com/photo.jpg"
  ],
  "tags": [
    {
      "id": 0,
      "name": "friendly"
    }
  ],
  "status": "available"
}
```

### Response (200 OK)
```json
{
  "id": 9223372036854776000,
  "category": {
    "id": 0,
    "name": "Dogs"
  },
  "name": "Fluffy",
  "photoUrls": [
    "https://example.com/photo.jpg"
  ],
  "tags": [
    {
      "id": 0,
      "name": "friendly"
    }
  ],
  "status": "available"
}
```

---

## 📝 Feature File

**Location**: [src/features/functional/petstore.feature](src/features/functional/petstore.feature)

```gherkin
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
  And response has field "id"
  And response.id > 0
  And response.name == "Fluffy"
  And response.status == "available"
  And response.category.name == "Dogs"
  And response has header "content-type"
  And response header content-type contains "application/json"
```

---

## ✅ Validations Performed

| Validation | Result | Details |
|--|--|--|
| **Status Code** | ✅ PASS | Expected 200, received 200 |
| **Field Exists** | ✅ PASS | Response has "id" field |
| **ID Generated** | ✅ PASS | Auto-generated ID: 9223372036854776000 |
| **ID > 0** | ✅ PASS | ID is greater than 0 |
| **Pet Name** | ✅ PASS | Name matches "Fluffy" |
| **Pet Status** | ✅ PASS | Status matches "available" |
| **Category Name** | ✅ PASS | Nested field category.name matches "Dogs" |
| **Header Exists** | ✅ PASS | Response has "content-type" header |
| **Header Value** | ✅ PASS | Content-Type contains "application/json" |

---

## 📊 Test Execution Log

```
2026-05-02T15:57:24.880Z [info]: === Before Scenario === TC_CREATE_PET_001 Add a new pet successfully
2026-05-02T15:57:24.939Z [info]: Set URL from PETSTORE_BASE_URL: https://petstore.swagger.io/v2
2026-05-02T15:57:24.949Z [info]: Set header Content-Type=application/json
2026-05-02T15:57:24.957Z [info]: ✓ Request body set
2026-05-02T15:57:24.961Z [info]: Set path from CREATE_PET_ENDPOINT: /pet
2026-05-02T15:57:24.964Z [info]: Sending POST request to: https://petstore.swagger.io/v2/pet
2026-05-02T15:57:25.962Z [info]: Response status: 200
2026-05-02T15:57:25.963Z [info]: Response time: 994ms
2026-05-02T15:57:25.963Z [info]: ✓ POST request sent
2026-05-02T15:57:25.979Z [info]: ✓ Status is 200
2026-05-02T15:57:25.989Z [info]: ✓ Response has field: id
2026-05-02T15:57:25.997Z [info]: ✓ Response.id > 0
2026-05-02T15:57:26.007Z [info]: ✓ Response.name == "Fluffy"
2026-05-02T15:57:26.012Z [info]: ✓ Response.status == "available"
2026-05-02T15:57:26.017Z [info]: ✓ Response.category.name == "Dogs"
2026-05-02T15:57:26.027Z [info]: ✓ Response has header: content-type
2026-05-02T15:57:26.040Z [info]: ✓ Response header content-type contains "application/json"
2026-05-02T15:57:26.046Z [info]: Status: passed
```

---

## 🔧 Environment Configuration

**File**: [env/dev.env](env/dev.env)

```env
PETSTORE_BASE_URL=https://petstore.swagger.io/v2
CREATE_PET_ENDPOINT=/pet
```

---

## 🚀 How to Run This Test

### Run Only This Test
```bash
npm run bdd:fresh -- -g "@TCId-1003"
```

### Run All PetStore API Tests
```bash
npm run bdd:fresh -- -g "@petstore"
```

### Run All API Tests
```bash
npm run pw:api
```

### View Test Report
```bash
npx playwright show-report
```

---

## 📚 Framework Features Used

### Step Definitions (All Reusable)
| Step | File | Usage |
|--|--|--|
| `Given url {word}` | apiCommonSteps.ts | Set base URL from environment variable |
| `And header {key} = {string}` | apiCommonSteps.ts | Set request header |
| `And body is {string}` | apiCommonSteps.ts | Set JSON request body |
| `And path {word}` | apiCommonSteps.ts | Set endpoint path from environment variable |
| `When method post` | apiCommonSteps.ts | Send POST request |
| `Then status {int}` | apiCommonSteps.ts | Validate response status code |
| `And response has field {string}` | apiCommonSteps.ts | Check if response field exists |
| `And response.{field} > {value}` | apiCommonSteps.ts | Validate numeric comparison |
| `And response.{field} == {value}` | apiCommonSteps.ts | Validate field equals value |
| `And response.{field}.{nestedField} == {value}` | apiCommonSteps.ts | Validate nested field (via getFieldValue) |
| `And response has header {string}` | apiCommonSteps.ts | Check if response header exists |
| `And response header {name} contains {string}` | apiCommonSteps.ts | Validate header contains value |

### ApiService Methods
- `setUrl()` - Set base URL
- `setHeader()` - Set request header
- `setBody()` - Set request body
- `setPath()` - Set endpoint path
- `sendPostRequest()` - Execute POST request
- `getResponseStatus()` - Get response status code
- `getResponseData()` - Get response body
- `getFieldValue()` - Get field value (supports nested paths like `category.name`)
- `getResponseHeaders()` - Get response headers

---

## 🎯 Key Highlights

✅ **Positive Test Case** - Validates successful pet creation  
✅ **Valid Test Data** - Real PetStore API compatible data  
✅ **Comprehensive Validations** - Status, body, nested fields, headers  
✅ **Reusable Steps** - All 8 step definitions are generic and reusable  
✅ **No Custom Code** - 100% uses existing framework utilities  
✅ **Nested Field Support** - Successfully validates `response.category.name`  
✅ **Proper Logging** - Complete request/response logging  
✅ **Environment Driven** - Uses environment variables for URLs/paths  
✅ **Production Ready** - Enterprise-grade test case  

---

## 📌 Test Artifacts

- **Feature File**: [src/features/functional/petstore.feature](src/features/functional/petstore.feature)
- **Step Definitions**: [src/step-definitions/functional/apiCommonSteps.ts](src/step-definitions/functional/apiCommonSteps.ts)
- **Service Layer**: [src/services/ApiService.ts](src/services/ApiService.ts)
- **Environment Config**: [env/dev.env](env/dev.env)
- **Conversion Guide**: [API_BDD_CONVERSION_GUIDE.md](API_BDD_CONVERSION_GUIDE.md)
- **Framework Enhancements**: [API_FRAMEWORK_ENHANCEMENTS.md](API_FRAMEWORK_ENHANCEMENTS.md)

---

## 🔄 Next Steps

To create similar API test cases:

1. **Add environment variables** for base URLs and endpoints to `env/dev.env`
2. **Create feature file** using the pattern from `petstore.feature`
3. **Use existing generic steps** from `apiCommonSteps.ts`
4. **Add feature-specific steps** only if no generic alternative exists
5. **Run test**: `npm run bdd:fresh -- -g "@TCId-xxxx"`

---

**Test Created**: May 2, 2026  
**Framework**: Playwright + Cucumber + TypeScript  
**Status**: ✅ Production Ready
