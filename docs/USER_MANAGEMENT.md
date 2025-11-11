# User Management Module - Admin

## Overview
Module User Management memungkinkan admin untuk mengelola pengguna dalam sistem, termasuk create, read, update, dan delete (CRUD) operations.

## Struktur Folder

```
├── src/
│   ├── server/
│   │   ├── repositories/
│   │   │   └── user.repository.ts          # Data access layer
│   │   ├── schema/
│   │   │   ├── enums.ts                    # Enum definitions
│   │   │   ├── user.schema.ts              # User schemas & validation
│   │   │   ├── common.schema.ts            # Common schemas
│   │   │   └── index.ts                    # Schema exports
│   │   └── service/
│   │       └── admin/
│   │           └── user.service.ts         # Business logic
│   ├── app/
│   │   └── api/
│   │       └── admin/
│   │           └── users/
│   │               ├── route.ts            # GET, POST endpoints
│   │               └── [id]/
│   │                   ├── route.ts        # GET, PUT, DELETE by ID
│   │                   └── toggle-status/
│   │                       └── route.ts    # Toggle active status
│   └── components/
│       └── dashboard/
│           └── admin/
│               └── users/
│                   ├── users-table.tsx     # Users table component
│                   ├── user-form-dialog.tsx # Create/Edit form
│                   └── users-filters.tsx   # Search & filter
```

## Fitur

### 1. **List Users** (GET /api/admin/users)
- Pagination support
- Search by name, email, or bank
- Filter by role (ADMIN, FINANCE, STAFF)
- Filter by status (Active/Inactive)
- Sorting options

**Query Parameters:**
```
?page=1
&limit=10
&search=john
&role=ADMIN
&isActive=true
&sortBy=createdAt
&sortOrder=desc
```

### 2. **Get User by ID** (GET /api/admin/users/[id])
- Retrieve detailed user information
- Password excluded from response

### 3. **Create User** (POST /api/admin/users)
- Email validation (must be unique)
- Password hashing (bcrypt)
- Role assignment
- Bank account information (optional)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STAFF",
  "bankName": "Bank ABC",
  "bankAccountNo": "1234567890",
  "isActive": true
}
```

### 4. **Update User** (PUT /api/admin/users/[id])
- Partial update support
- Email uniqueness check (excluding current user)
- Password re-hashing if changed
- All fields optional

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "role": "FINANCE",
  "isActive": false
}
```

### 5. **Delete User** (DELETE /api/admin/users/[id])
- Soft delete (sets isActive = false)
- Prevents self-deletion
- Confirmation required in UI

### 6. **Toggle User Status** (POST /api/admin/users/[id]/toggle-status)
- Quick activate/deactivate
- Prevents self-toggling

## Validation Schema

### CreateUserSchema
```typescript
{
  name: string (min 1),
  email: string (valid email),
  password: string (min 8 chars),
  role: UserRole (ADMIN | FINANCE | STAFF),
  bankName?: string,
  bankAccountNo?: string,
  isActive: boolean (default: true)
}
```

### UpdateUserSchema
```typescript
{
  name?: string (min 1),
  email?: string (valid email),
  password?: string (min 8 chars),
  role?: UserRole,
  bankName?: string,
  bankAccountNo?: string,
  isActive?: boolean
}
```

## Components

### UsersTable
Displays list of users with:
- User information (name, email, role)
- Bank details
- Active status badge
- Action dropdown (Edit, Toggle Status, Delete)

### UserFormDialog
Modal form for create/edit with:
- Form validation
- Password field (required for create, optional for edit)
- Role selection
- Bank information fields
- Active status checkbox

### UsersFilters
Filter controls with:
- Search input
- Role filter dropdown
- Status filter dropdown

## Security

1. **Authentication Required**: All endpoints check for valid session
2. **Admin Only**: Role check ensures only ADMIN can access
3. **Password Security**: 
   - Bcrypt hashing with salt rounds = 10
   - Never returned in responses
4. **Self-Protection**: Admins cannot delete/toggle their own account
5. **Email Uniqueness**: Enforced at database and application level

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Forbidden - Admin only"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "User not found"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

## Usage Example

### Frontend (React)

```typescript
// Fetch users
const fetchUsers = async () => {
  const response = await fetch('/api/admin/users?page=1&limit=10');
  const result = await response.json();
  if (result.success) {
    setUsers(result.data);
  }
};

// Create user
const createUser = async (data) => {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};

// Update user
const updateUser = async (id, data) => {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Delete user
const deleteUser = async (id) => {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
```

## Testing

Access the page at: `/dashboard/admin/users`

Make sure you're logged in as an ADMIN user.

## Dependencies

- `bcryptjs`: Password hashing
- `zod`: Schema validation
- `@radix-ui/react-dialog`: Modal dialogs
- `@radix-ui/react-select`: Select dropdowns
- `@radix-ui/react-toast`: Toast notifications

## Future Enhancements

1. Bulk operations (delete multiple, bulk role update)
2. User activity logs
3. Advanced filtering (date range, multiple roles)
4. Export to CSV/Excel
5. User profile pictures upload
6. Email verification system
7. Password reset functionality
8. Two-factor authentication
