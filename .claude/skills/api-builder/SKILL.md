---
name: api-builder
description: Creates REST/GraphQL API endpoints with validation, error handling, and types
---

When building an API ($ARGUMENTS):

1. **Define the endpoint**:
   - HTTP method and route
   - Request params, query, body schema
   - Response format and status codes

2. **Implement with best practices**:
   - Input validation (zod, joi, or manual)
   - Proper error handling with status codes
   - TypeScript types for request/response
   - Consistent response format: `{ data, error, message }`

3. **Add middleware** as needed:
   - Authentication/authorization
   - Rate limiting
   - Request logging
   - CORS headers

4. **Error responses**:
   - 400: Bad request (validation errors)
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not found
   - 500: Internal server error

5. **Generate tests** for the endpoint covering happy path and error cases
