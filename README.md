</head>
<body>
<img src="https://github.com/soycarlo99/alcorel/blob/main/src/logotype/AlcoRel.png?raw=true" alt="Program Logo">
</body>
</html>

Technologies used:

- .NET8 Minimal API:s
- Npgsql
- PostgreSQL
- React
- React-Dom
- React-Router
- Mailsolution: MailKit

# API Documentation

[Introduction](#introduction) [Authentication](#authentication) [Base URL](#base-url) [Request & Response](#request-response) [Reference](#reference) [Code Examples](#code-examples)

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

http://localhost:5000/api/

## Request & Response Formats

### Request Headers

- Content-Type: application/json
- Cookie: .AspNetCore.Session={session_id}

### Request Body Format

All requests with a body should be in JSON format.

### Response Formats

Successful responses return a 200 OK status with JSON data.

Error responses return appropriate status codes with error details:

- 400 Bad Request
- 401 Unauthorized
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
| POST /categories                          | Create new category                     | category_name, company_id                                  | New category object               |
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
| PUT /update/logo/{companyId}              | Update company logo                     | companyId, new logo                                        | Update confirmation               |
| GET /employee/dashboard                   | Get employee dashboard information      | None                                                       | Company name and logo             |
| GET /admin/dashboard                      | Get admin dashboard information         | None                                                       | Company name and logo             |
| POST /password/reset/{resetToken}         | Reset password with token               | resetToken, newPassword                                    | Confirmation message              |
| PUT /ResetPassword/{testuserId}           | Send password reset link                | testuserId                                                 | Confirmation message              |
| GET /employee/{userId}/check-password     | Check if user is using default password | userId                                                     | Password status                   |
| GET /password/validate-token/{resetToken} | Validate password reset token           | resetToken                                                 | Token validation status           |

## Code Examples

### React (with async/await)

```js
// Login example
                const login = async () => {
                    try {
                        const response = await fetch('/api/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: 'user@example.com',
                                password: 'password'
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Login failed');
                        }

                        const data = await response.json();
                        console.log('Login successful:', data);
                    } catch (error) {
                        console.error('Error:', error);
                    }
                };

                // Create ticket example
                const createTicket = async () => {
                    try {
                        const response = await fetch('/api/tickets', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                ticket\_time: new Date().toISOString(),
                                status: 'open',
                                user\_id: 123,
                                category\_id: 45
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Ticket creation failed');
                        }

                        const data = await response.json();
                        console.log('Ticket created:', data);
                    } catch (error) {
                        console.error('Error:', error);
                    }
                };

                // Get ticket by token example
                const getTicketByToken = async (token) => {
                    try {
                        const response = await fetch(\`/api/ticket/token/${token}\`);

                        if (!response.ok) {
                            throw new Error('Failed to get ticket');
                        }

                        const data = await response.json();
                        console.log('Ticket details:', data);
                    } catch (error) {
                        console.error('Error:', error);
                    }
                };
```
