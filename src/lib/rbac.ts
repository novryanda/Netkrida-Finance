import { UserRole } from "@prisma/client"

export type Resource = 
  | "project" 
  | "expense" 
  | "reimbursement" 
  | "dashboard" 
  | "report"

export type Action = 
  | "create" 
  | "read" 
  | "update" 
  | "delete" 
  | "approve" 
  | "pay"

export type Scope = "all" | "own" | "none"

export interface Permission {
  resource: Resource
  action: Action
  scope: Scope
}

// RBAC Error Messages
export const RBAC_ERRORS = {
  UNAUTHORIZED: "Anda harus login terlebih dahulu",
  FORBIDDEN: "Anda tidak memiliki akses untuk melakukan aksi ini",
  INVALID_ROLE: "Role tidak valid",
}

// Permission Matrix
const PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Projects - Full access
    { resource: "project", action: "create", scope: "all" },
    { resource: "project", action: "read", scope: "all" },
    { resource: "project", action: "update", scope: "all" },
    { resource: "project", action: "delete", scope: "all" },
    
    // Expenses - Full access
    { resource: "expense", action: "create", scope: "all" },
    { resource: "expense", action: "read", scope: "all" },
    { resource: "expense", action: "update", scope: "all" },
    { resource: "expense", action: "delete", scope: "all" },
    
    // Reimbursements - Can approve
    { resource: "reimbursement", action: "create", scope: "all" },
    { resource: "reimbursement", action: "read", scope: "all" },
    { resource: "reimbursement", action: "update", scope: "all" },
    { resource: "reimbursement", action: "approve", scope: "all" },
    { resource: "reimbursement", action: "delete", scope: "all" },
    
    // Dashboard & Reports - Full access
    { resource: "dashboard", action: "read", scope: "all" },
    { resource: "report", action: "read", scope: "all" },
  ],
  
  FINANCE: [
    // Projects - Read only
    { resource: "project", action: "read", scope: "all" },
    
    // Expenses - Read only
    { resource: "expense", action: "read", scope: "all" },
    
    // Reimbursements - Can pay approved ones
    { resource: "reimbursement", action: "read", scope: "all" },
    { resource: "reimbursement", action: "pay", scope: "all" },
    { resource: "reimbursement", action: "update", scope: "all" },
    
    // Dashboard & Reports
    { resource: "dashboard", action: "read", scope: "all" },
    { resource: "report", action: "read", scope: "all" },
  ],
  
  STAFF: [
    // Projects - Read only
    { resource: "project", action: "read", scope: "all" },
    
    // Expenses - Create and read own
    { resource: "expense", action: "create", scope: "own" },
    { resource: "expense", action: "read", scope: "own" },
    
    // Reimbursements - Create and read own
    { resource: "reimbursement", action: "create", scope: "own" },
    { resource: "reimbursement", action: "read", scope: "own" },
    { resource: "reimbursement", action: "update", scope: "own" },
    
    // Dashboard - Read own
    { resource: "dashboard", action: "read", scope: "own" },
  ],
}

/**
 * Check if user role has permission to perform action on resource
 */
export function hasPermission(
  userRole: UserRole,
  resource: Resource,
  action: Action
): { allowed: boolean; scope: Scope } {
  const rolePermissions = PERMISSIONS[userRole]
  
  const permission = rolePermissions.find(
    (p) => p.resource === resource && p.action === action
  )
  
  if (!permission) {
    return { allowed: false, scope: "none" }
  }
  
  return { allowed: true, scope: permission.scope }
}

/**
 * Check if user has specific role(s)
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Require specific role(s) - throws error if not authorized
 */
export function requireRole(userRole: UserRole | undefined, allowedRoles: UserRole[]) {
  if (!userRole) {
    throw new Error(RBAC_ERRORS.UNAUTHORIZED)
  }
  
  if (!hasRole(userRole, allowedRoles)) {
    throw new Error(RBAC_ERRORS.FORBIDDEN)
  }
  
  return true
}

/**
 * Require specific permission - throws error if not authorized
 */
export function requirePermission(
  userRole: UserRole | undefined,
  resource: Resource,
  action: Action
) {
  if (!userRole) {
    throw new Error(RBAC_ERRORS.UNAUTHORIZED)
  }
  
  const { allowed, scope } = hasPermission(userRole, resource, action)
  
  if (!allowed) {
    throw new Error(RBAC_ERRORS.FORBIDDEN)
  }
  
  return { allowed, scope }
}

/**
 * Check if user can access resource based on ownership
 */
export function canAccessResource(
  scope: Scope,
  resourceOwnerId: string,
  currentUserId: string
): boolean {
  if (scope === "all") return true
  if (scope === "own") return resourceOwnerId === currentUserId
  return false
}
