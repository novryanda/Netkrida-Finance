"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, UserRoleLabels } from "@/server/schema/enums";

interface UsersFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  role: string;
  onRoleChange: (role: string) => void;
  isActive: string;
  onIsActiveChange: (isActive: string) => void;
}

export function UsersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  isActive,
  onIsActiveChange,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search by name, email, or bank..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {Object.values(UserRole).map((r) => (
            <SelectItem key={r} value={r}>
              {UserRoleLabels[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={isActive} onValueChange={onIsActiveChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
