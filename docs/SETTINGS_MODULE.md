# Settings Module Documentation

## Overview
Modul Settings memungkinkan user untuk mengubah informasi profile mereka, mengganti password, dan upload profile picture. Modul ini dapat diakses oleh semua role (ADMIN, FINANCE, STAFF).

## Features

### 1. Update Profile Information
- **Allowed Fields**: Name, Bank Name, Bank Account Number
- **Restricted Fields**: Email (read-only), Role (read-only)
- **Endpoint**: `PUT /api/settings/profile`

### 2. Change Password
- **Requirements**: 
  - Current password verification
  - New password minimum 8 characters
  - Password confirmation must match
- **Endpoint**: `PUT /api/settings/password`

### 3. Upload Profile Picture
- **Allowed Formats**: JPEG, PNG, WebP
- **Maximum Size**: 5MB
- **Storage**: `/public/uploads/` directory
- **Naming Convention**: `profile-{userId}-{timestamp}.{ext}`
- **Endpoints**: 
  - Upload: `POST /api/uploads`
  - Delete: `DELETE /api/uploads`
  - Serve: `GET /api/uploads/{filename}`

## File Structure

```
src/
├── app/
│   ├── (protected-pages)/
│   │   └── dashboard/
│   │       └── settings/
│   │           └── page.tsx                    # Settings page
│   └── api/
│       ├── settings/
│       │   ├── profile/
│       │   │   └── route.ts                   # Profile API endpoints
│       │   └── password/
│       │       └── route.ts                   # Password API endpoints
│       └── uploads/
│           ├── route.ts                        # Upload/Delete API endpoints
│           └── [filename]/
│               └── route.ts                    # Serve uploaded images
├── components/
│   └── dashboard/
│       └── settings/
│           ├── profile-form.tsx               # Profile update form
│           ├── change-password-form.tsx       # Password change form
│           ├── profile-picture-upload.tsx     # Profile picture upload
│           └── index.ts                       # Export index
├── server/
│   ├── schema/
│   │   └── settings.schema.ts                 # Zod schemas
│   ├── repositories/
│   │   └── settings.repository.ts             # Database operations
│   └── service/
│       └── settings/
│           └── settings.service.ts            # Business logic
└── public/
    └── uploads/                                # Profile pictures storage
```

## API Endpoints

### 1. Get User Profile
```
GET /api/settings/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STAFF",
    "bankName": "Bank ABC",
    "bankAccountNo": "1234567890",
    "image": "/uploads/profile-user_id-1234567890.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Update Profile
```
PUT /api/settings/profile
Content-Type: application/json

{
  "name": "John Doe",
  "bankName": "Bank ABC",
  "bankAccountNo": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STAFF",
    "bankName": "Bank ABC",
    "bankAccountNo": "1234567890",
    "image": "/uploads/profile-user_id-1234567890.jpg"
  }
}
```

### 3. Change Password
```
PUT /api/settings/password
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

### 4. Upload Profile Picture
```
POST /api/uploads
Content-Type: multipart/form-data

file: [binary data]
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "imageUrl": "/uploads/profile-user_id-1234567890.jpg"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, and WebP are allowed"
}
```

### 5. Delete Profile Picture
```
DELETE /api/uploads
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture deleted successfully"
}
```

## Components

### ProfileForm
Form untuk update profile information (name, bank name, bank account number).

**Props:**
```typescript
interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    bankName: string | null;
    bankAccountNo: string | null;
    image: string | null;
  };
}
```

### ChangePasswordForm
Form untuk change password dengan current password verification.

**Features:**
- Toggle password visibility
- Password strength requirement (min 8 chars)
- Password confirmation
- Current password verification

### ProfilePictureUpload
Component untuk upload dan manage profile picture.

**Props:**
```typescript
interface ProfilePictureUploadProps {
  currentImage: string | null;
  userName: string | null;
}
```

**Features:**
- Image preview
- Drag & drop support
- File type validation
- File size validation (max 5MB)
- Delete existing picture

## Security

### Authentication
- All endpoints require user authentication via NextAuth session
- User can only modify their own profile

### File Upload Security
- File type validation (JPEG, PNG, WebP only)
- File size limit (5MB max)
- Unique filename generation to prevent overwrite
- Stored in public directory with controlled access

### Password Security
- Current password verification required
- Minimum 8 characters for new password
- Password hashed with bcrypt (10 rounds)
- Password confirmation required

## Database Schema

### User Model (relevant fields)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  image         String?
  password      String?   // Hashed password
  role          UserRole  @default(STAFF)
  bankName      String?
  bankAccountNo String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Usage Example

### In Settings Page
```typescript
import { auth } from "@/server/auth";
import { settingsService } from "@/server/service/settings/settings.service";
import {
  ProfileForm,
  ChangePasswordForm,
  ProfilePictureUpload,
} from "@/components/dashboard/settings";

export default async function SettingsPage() {
  const session = await auth();
  const user = await settingsService.getUserProfile(session.user.id);

  return (
    <div>
      <ProfilePictureUpload
        currentImage={user.image}
        userName={user.name}
      />
      <ProfileForm user={user} />
      <ChangePasswordForm />
    </div>
  );
}
```

### Client-side API Call
```typescript
// Update profile
const response = await fetch("/api/settings/profile", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    bankName: "Bank ABC",
    bankAccountNo: "1234567890",
  }),
});

// Change password
const response = await fetch("/api/settings/password", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    currentPassword: "old123",
    newPassword: "new123456",
    confirmPassword: "new123456",
  }),
});

// Upload profile picture
const formData = new FormData();
formData.append("file", file);
const response = await fetch("/api/uploads", {
  method: "POST",
  body: formData,
});

// Delete profile picture
const response = await fetch("/api/uploads", {
  method: "DELETE",
});
```

## Error Handling

### Common Errors
1. **Unauthorized (401)**: User not authenticated
2. **Bad Request (400)**: Invalid input data or current password incorrect
3. **Internal Server Error (500)**: Database or file system errors

### Error Messages
- "Unauthorized" - User not logged in
- "User not found" - User ID doesn't exist
- "Current password is incorrect" - Wrong current password
- "Passwords don't match" - Confirm password doesn't match new password
- "Invalid file type" - Uploaded file is not JPEG, PNG, or WebP
- "File size too large" - File exceeds 5MB limit

## Testing Checklist

### Profile Update
- [ ] Update name
- [ ] Update bank name
- [ ] Update bank account number
- [ ] Email field is read-only
- [ ] Role field is read-only
- [ ] Form validation works
- [ ] Success toast shown
- [ ] Page refreshes after update

### Password Change
- [ ] Current password validation
- [ ] New password length validation (min 8)
- [ ] Password confirmation validation
- [ ] Toggle password visibility
- [ ] Success toast shown
- [ ] Form resets after success
- [ ] Error shown for wrong current password

### Profile Picture Upload
- [ ] File type validation (JPEG, PNG, WebP)
- [ ] File size validation (max 5MB)
- [ ] Image preview works
- [ ] Upload button disabled during upload
- [ ] Delete existing picture
- [ ] Success toast shown
- [ ] Image stored in /public/uploads/
- [ ] Image URL saved in database
- [ ] Page refreshes after upload

## Dependencies

### NPM Packages
```json
{
  "formidable": "^3.x.x",
  "@types/formidable": "^3.x.x",
  "bcryptjs": "^2.x.x",
  "zod": "^3.x.x",
  "next": "^14.x.x",
  "next-auth": "^5.x.x"
}
```

### Internal Dependencies
- `@/server/auth` - Authentication
- `@/server/db` - Database access
- `@/components/ui/*` - UI components
- `sonner` - Toast notifications

## Future Enhancements

1. **Image Optimization**
   - Resize uploaded images
   - Convert to WebP format
   - Generate thumbnails

2. **Cloud Storage**
   - Upload to S3/CloudFlare R2
   - CDN integration

3. **Additional Fields**
   - Phone number
   - Address
   - Department

4. **2FA Support**
   - Enable/disable 2FA
   - QR code generation

5. **Activity Log**
   - Track profile changes
   - Password change history
