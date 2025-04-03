![Alcorel demo](https://github.com/soycarlo99/alcorel/blob/main/src/logotype/trimmed.gif)

Technologies used:

- .NET8 Minimal API:s (RESTful)
- Npgsql
- PostgreSQL
- React
- React-Dom
- Ollama
- React-Router
- Mailsolution: MailKit

### Build From Source

Clone the repository and build the server manually:

```bash
git clone https://github.com/soycarlo99/alcorel.git

cd alcorel
cd server/Server

dotnet run
```

### Frontend installation guide

To install react you need to do the steps bellow:

```bash
# in the main root path run this command to install react and its dependencies
npm install
```

# API Documentation

## Introduction

This API documentation provides comprehensive information about the RESTful API for the Alcorel support ticket system. The API allows users to interact with the system programmatically, managing tickets, users, categories, and more.

The API follows RESTful principles with JSON data format for requests and responses.

## Authentication

Authentication is handled through session cookies. Users must first log in using their credentials to obtain a session.

### Session Management

- POST /api/login - Authenticate and create session
- POST /api/logout - Destroy session

All subsequent requests require a valid session cookie.

## Base URL

The base URL for all API endpoints is:

http://localhost:5001/api/

## Request & Response Formats

### Request Headers

- Content-Type: application/json
- Cookie: .AspNetCore.Session={session_id}

### Request Body Format

All requests with a body should be in JSON format.

### Response Formats

Successful responses return a 200 OK status with JSON data.

Error responses return appropriate status codes with error details:

- 200 Ok
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbid
- 404 Not Found
- 500 Internal Server Error

## Reference Documentation

### Available Methods

| Method                                    | Description                             | Parameters                                                 | Returns                           |
| ----------------------------------------- | --------------------------------------- | ---------------------------------------------------------- | --------------------------------- |
| GET /users                                | Retrieve list of users                  | None                                                       | Array of user objects             |
| POST /tickets                             | Create new support ticket               | ticket_time, status, user_id, category_id                  | New ticket object                 |
| PUT /tickets/{ticketId}/status            | Update ticket status                    | ticketId, new status                                       | Updated ticket status             |
| POST /questions                           | Create new question                     | questions, category_id                                     | New question object               |
| DELETE /categories/{categoryId}           | Delete existing category                | categoryId                                                 | Deletion confirmation             |
| POST /messages                            | Add message to ticket                   | ticket_id, message                                         | New message object                |
| PUT /sendRating/{rating}/{ticketId}       | Send rating for ticket                  | rating, ticketId                                           | Rating confirmation               |
| POST /email                               | Send email                              | To, Subject, Body                                          | Confirmation message              |
| POST /createusers                         | Create new user                         | Name, Email, Password, admin_customer_employee, company_id | New user object                   |
| POST /login                               | User login                              | Email, Password                                            | Login response with redirect path |
| GET /ticket/token/{token}                 | Get ticket by token                     | token                                                      | Ticket details                    |
| GET /company/{companyId}/init             | Initialize company session              | companyId                                                  | Success confirmation              |
| GET /session/userId                       | Get current user ID from session        | None                                                       | User ID                           |
| GET /session/username                     | Get current username from session       | None                                                       | Username                          |
| GET /company/current                      | Get current company ID from session     | None                                                       | Company ID                        |
| GET /login/employee                       | Check if current user is an employee    | None                                                       | Success/failure                   |
| GET /login/admin                          | Check if current user is an admin       | None                                                       | Success/failure                   |
| GET /GetCategory                          | Get all categories                      | None                                                       | Array of categories               |
| GET /GetCategory/{categoryId}             | Get category by ID                      | categoryId                                                 | Category details                  |
| POST /PostCategory                        | Create new category                     | category_name, company_id                                  | New category object               |
| DELETE /DeleteCategory/{categoryId}       | Delete category                         | categoryId                                                 | Deletion confirmation             |
| PUT /update/category/{catId}              | Update category                         | catId, new category name                                   | Update confirmation               |
| PUT /update/logo/{companyId}              | Update company logo                     | companyId, logotype                                        | Update confirmation               |
| GET /employee/dashboard                   | Get current company ID from session     | None                                                       | Company name                      |
| GET /admin/dashboard                      | Get admin dashboard information         | None                                                       | Company name                      |
| POST /password/reset/{resetToken}         | Reset password with token               | resetToken, newPassword                                    | Confirmation message              |
| PUT /ResetPassword/{testuserId}           | Send password reset link                | testuserId                                                 | Confirmation message              |
| GET /employee/{userId}/check-password     | Check if user is using default password | userId                                                     | Password status                   |
| GET /password/validate-token/{resetToken} | Validate password reset token           | resetToken                                                 | Token validation status           |

## Detailed PUT /sendRating API

**Verb**: PUT

**Path**: http://localhost:5001/api/sendRating/{rating}/{ticketId}

**Parameter Binding Count**: 2

### Description

This endpoint allows users to send a rating for a specific ticket.

### Parameters

- `rating` (integer): The rating value to be assigned to the ticket
- `ticketId` (integer): The ID of the ticket to be rated

### Request Body

```js
{
  // No request body required
}
```

### Responses

#### Successful Response

**Status Code**: 200 OK

**Content Type**: text/plain

**Example Response**:

```
Rating updated to 4 in ticket #123
```

#### Error Responses

**Status Code**: 400 Bad Request

**Content Type**: text/plain

**Example Responses**:

```
Failed to rate
```

```
Database error: [Specific error message]
```

## Detailed POST /tickets API

**Verb**: POST

**Path**: http://localhost:5001/api/tickets

**Parameter Binding Count**: 0

### Description

This endpoint allows users to create a new support ticket.

### Request Body

```js
{
    "ticket_time": "2025-03-20T12:00:00Z",
    "status": "open",
    "user_id": 123,
    "category_id": 45
}
```

### Responses

#### Successful Response

**Status Code**: 201 Created

**Content Type**: application/json

**Example Response**:

```json
{
  "id": 456,
  "ticket_time": "2025-03-20T12:00:00Z",
  "status": "open",
  "user_id": 123,
  "category_id": 45
}
```

#### Error Responses

**Status Code**: 400 Bad Request

**Content Type**: text/plain

**Example Responses**:

```
Unauthorized, You are an employee and can't create a ticket
```

```
Failed to create ticket
```

```
Database error: [Specific error message]
```

## Code Examples

1. Create Ticket Example (using async/await):

```javascript
const createTicket = async () => {
  try {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticket_time: new Date().toISOString(),
        status: "open",
        user_id: 123,
        category_id: 45,
      }),
    });

    if (!response.ok) {
      throw new Error("Ticket creation failed");
    }

    const data = await response.json();
    console.log("Ticket created:", data);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

2. Send Rating Example (using chained promises):

```javascript
const sendRating = (rating, ticketId) => {
  fetch(`/api/sendRating/${rating}/${ticketId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send rating");
      }
      return response.text();
    })
    .then((data) => {
      console.log("Rating sent successfully:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
```
