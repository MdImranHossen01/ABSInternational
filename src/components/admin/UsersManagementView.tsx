'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Loader2, 
  User as UserIcon, 
  Eye, 
  ShieldAlert, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  UserCog, 
  Trash2, 
  Search,
  Crown,
  CheckCircle2,
  Sparkles,
  Trophy,
  Shield,
  Wallet,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import Image from 'next/image';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from '@/components/ui/image-upload';

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  phone?: string;
  addresses?: any[];
  createdAt: string;
  lastActive?: string;
  memberId?: string;
  sponsorId?: string;
  rank?: string;
  isSubscriptionActive?: boolean;
  depositWallet?: number;
  bonusWallet?: number;
  withdrawalWallet?: number;
  personalSales?: number;
  teamSales?: number;
  teamCount?: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

interface UsersManagementViewProps {
  type?: 'all' | 'leaders' | 'active' | 'free' | 'ranks' | 'admins';
  title?: string;
  description?: string;
}

export function UsersManagementView({
  type = 'all',
  title,
  description,
}: UsersManagementViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(Math.max(1, parseInt(searchParams.get('page') || '1')));

  const [users, setUsers] = useState<UserData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const prevSearchTermRef = useRef(debouncedSearchTerm);

  // Reset page when search term changes (skip initial mount)
  useEffect(() => {
    if (prevSearchTermRef.current !== debouncedSearchTerm) {
      prevSearchTermRef.current = debouncedSearchTerm;
      if (currentPage > 1) {
        setCurrentPage(1);
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
      }
    }
  }, [debouncedSearchTerm, currentPage, pathname, router, searchParams]);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAssignAdminOpen, setIsAssignAdminOpen] = useState(false);
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminImage, setAdminImage] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.role === 'super_admin';

  const fetchUsers = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=20&search=${encodeURIComponent(debouncedSearchTerm)}&type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, debouncedSearchTerm, type]);

  useEffect(() => {
    const pageFromParams = Math.max(1, parseInt(searchParams.get('page') || '1'));
    if (pageFromParams !== currentPage) {
      setCurrentPage(pageFromParams);
    }
  }, [searchParams]);

  const openUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const result = await Swal.fire({
      title: 'Change User Role?',
      text: `Are you sure you want to change this user's role to ${newRole}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, change it!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update role');
      }
    } catch (error) {
      toast.error('Error updating user role');
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedIdentifier = adminIdentifier.trim();
    if (!trimmedIdentifier) {
      toast.error('Please enter an email or phone number');
      return;
    }

    const payload: any = {};
    if (trimmedIdentifier.includes('@')) {
      payload.email = trimmedIdentifier;
    } else {
      payload.phone = trimmedIdentifier;
    }
    if (adminName.trim()) payload.name = adminName.trim();
    if (adminImage.trim()) payload.image = adminImage.trim();
    if (adminPassword.trim()) payload.password = adminPassword.trim();

    setIsAssigning(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`Successfully assigned Admin role to ${adminIdentifier}`);
        setAdminIdentifier('');
        setAdminName('');
        setAdminImage('');
        setAdminPassword('');
        setIsAssignAdminOpen(false);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to assign admin');
      }
    } catch (error) {
      toast.error('Error assigning admin');
    } finally {
      setIsAssigning(false);
    }
  };
 
  const handleDeleteUser = async (userId: string, userName: string) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete permanently!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success(`User "${userName}" deleted successfully`);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const pageHeadings: Record<string, { title: string; desc: string }> = {
    all: {
      title: 'All Registered Users',
      desc: 'Complete directory of all platform customers, leaders, and system staff.',
    },
    leaders: {
      title: 'Founding Leaders (মূল ৬ জন লিডার)',
      desc: 'Top root leaders directly sponsored by Company ID (ABS-COMPANY) driving the network.',
    },
    active: {
      title: 'Active Subscription Members (একটিভ মেম্বার)',
      desc: 'Verified members who have activated a package subscription (৳1,500).',
    },
    free: {
      title: 'Free Unactivated Members (ফ্রি মেম্বার)',
      desc: 'Registered users who have not yet purchased/activated a membership package.',
    },
    ranks: {
      title: 'Rank Achievers (পদবীধারী লিডারবৃন্দ)',
      desc: 'Promoted leaders from Team Manager up to Company Director tier.',
    },
    admins: {
      title: 'System Administrators & Managers',
      desc: 'Staff members with elevated system privileges and backend management access.',
    },
  };

  const currentHeading = {
    title: title || pageHeadings[type]?.title || 'Users Management',
    desc: description || pageHeadings[type]?.desc || 'Manage and view registered accounts.',
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 py-4 md:py-6 w-full animate-in fade-in duration-500">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            {currentHeading.title}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-0.5">
            {currentHeading.desc}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {(isSuperAdmin || (session?.user as any)?.role === 'admin') && (
            <Button 
              onClick={() => setIsAssignAdminOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-4 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm shadow-md border-none"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Assign Admin
            </Button>
          )}
          <div className="bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            <span className="text-primary font-bold text-xs sm:text-sm">{totalCount} Accounts</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email, phone, or Member ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-11 bg-white rounded-xl border border-slate-200 shadow-2xs font-medium text-xs sm:text-sm"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border bg-white shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[60px]">Avatar</TableHead>
                <TableHead className="font-bold">Member & Sponsor</TableHead>
                <TableHead className="font-bold">Contact Info</TableHead>
                <TableHead className="font-bold">MLM Rank & Status</TableHead>
                <TableHead className="font-bold">Orders / Spent</TableHead>
                <TableHead className="font-bold">Role</TableHead>
                <TableHead className="font-bold">Joined</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground font-medium text-xs">Loading accounts...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <p className="text-muted-foreground text-xs font-medium">No accounts found in this directory.</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      {user.image && user.image !== '' ? (
                        <div className="relative h-9 w-9 rounded-full overflow-hidden border">
                          <Image 
                            src={user.image} 
                            alt={user.name} 
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link 
                          href={`/admin/users/${user._id}`}
                          className="font-bold text-slate-900 hover:text-primary transition-colors text-left text-xs sm:text-sm hover:underline"
                        >
                          {user.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-muted-foreground">
                          <span className="font-bold text-primary">{user.memberId || 'N/A'}</span>
                          {user.sponsorId && (
                            <>
                              <span>•</span>
                              <span>Sponsor: {user.sponsorId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-slate-600">
                        <span className="font-medium">{user.email}</span>
                        {user.phone && <span className="text-[11px] text-slate-400">{user.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {user.rank && user.rank !== 'user' ? (
                          <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                            {user.rank}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            General
                          </Badge>
                        )}
                        {user.isSubscriptionActive ? (
                          <Badge className="bg-emerald-500 text-white text-[10px]">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-200 text-slate-700 text-[10px]">Free</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-bold text-slate-700">{user.totalOrders} Orders</span>
                        <span className="text-[11px] text-muted-foreground font-medium">৳{user.totalSpent.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' || user.role === 'super_admin' ? 'default' : 'outline'}
                        className={`
                          capitalize px-2.5 py-0.5 rounded-full font-bold text-[10px]
                          ${user.role === 'admin' || user.role === 'super_admin' ? 'bg-blue-600 text-white' : ''}
                          ${user.role === 'manager' ? 'bg-emerald-600 text-white' : ''}
                        `}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-2 py-1.5">User Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer text-xs font-bold text-slate-800">
                              <Link href={`/admin/users/${user._id}`}>
                                <ExternalLink className="mr-2 h-4 w-4 text-primary" /> Full Profile Page
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openUserDetails(user)} className="cursor-pointer text-xs">
                              <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> Quick Modal
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-2 py-1.5">Management</DropdownMenuLabel>
                            
                            {user.role !== 'admin' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(user._id, 'admin')}
                                className="cursor-pointer text-blue-600 font-bold text-xs"
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" /> Make Admin
                              </DropdownMenuItem>
                            )}

                            {user.role !== 'manager' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(user._id, 'manager')}
                                className="cursor-pointer text-primary font-bold text-xs"
                              >
                                <UserCog className="mr-2 h-4 w-4" /> Make Manager
                              </DropdownMenuItem>
                            )}

                            {user.role !== 'user' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(user._id, 'user')}
                                className="cursor-pointer text-slate-600 font-bold text-xs"
                              >
                                <UserCog className="mr-2 h-4 w-4" /> Make User
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="text-destructive cursor-pointer font-bold bg-red-50 hover:bg-red-100 mt-1 text-xs"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No users found.</div>
          ) : (
            users.map((user) => (
              <div key={user._id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <Link 
                        href={`/admin/users/${user._id}`}
                        className="font-bold text-slate-900 hover:text-primary transition-colors text-left text-sm truncate block hover:underline"
                      >
                        {user.name}
                      </Link>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                        <span className="font-bold text-primary">{user.memberId || 'N/A'}</span>
                        {user.sponsorId && <span>• {user.sponsorId}</span>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Badge 
                    className={`capitalize text-[10px] shrink-0 ${
                      user.role === 'admin' ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {user.role}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {user.rank && user.rank !== 'user' && (
                    <Badge className="bg-amber-100 text-amber-900 text-[10px]">{user.rank}</Badge>
                  )}
                  {user.isSubscriptionActive ? (
                    <Badge className="bg-emerald-500 text-white text-[10px]">Active Member</Badge>
                  ) : (
                    <Badge className="bg-slate-200 text-slate-700 text-[10px]">Free Member</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/users/${user._id}`}>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="h-8 rounded-lg text-xs gap-1.5 bg-primary text-white font-bold"
                      >
                        <ExternalLink className="h-3 w-3" /> Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openUserDetails(user)}
                      className="h-8 rounded-lg text-xs gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> Quick View
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    className="h-8 rounded-lg text-xs px-2.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="py-3 border-t bg-white px-4 md:px-6">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(page) => {
                setCurrentPage(page);
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', page.toString());
                router.push(`${pathname}?${params.toString()}`);
              }}
            />
          </div>
        )}
      </div>

      {/* User Details Modal with MLM details */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              User Profile & MLM Ledger
              <Badge className="bg-primary/10 text-primary border-none">{selectedUser?.role}</Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="flex flex-col gap-5 pt-2">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border-2 border-primary/20 shrink-0">
                  {selectedUser.name?.charAt(0) || 'U'}
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h2 className="font-black text-xl tracking-tight text-slate-900">{selectedUser.name}</h2>
                  <p className="text-muted-foreground text-xs">{selectedUser.email}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-2 font-mono text-xs">
                    <Badge className="bg-primary text-white font-bold">ID: {selectedUser.memberId || 'N/A'}</Badge>
                    <Badge variant="outline">Sponsor: {selectedUser.sponsorId || 'None'}</Badge>
                    <Badge className="bg-amber-100 text-amber-900 font-bold">{selectedUser.rank || 'user'}</Badge>
                    {selectedUser.isSubscriptionActive ? (
                      <Badge className="bg-emerald-500 text-white font-bold">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-300 text-slate-800">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* MLM Wallet & Network Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">Deposit Wallet</span>
                  <span className="text-lg font-black text-emerald-800">৳{(selectedUser.depositWallet || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                  <span className="text-[10px] font-bold uppercase text-amber-600 block">Bonus Wallet</span>
                  <span className="text-lg font-black text-amber-800">৳{(selectedUser.bonusWallet || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
                  <span className="text-[10px] font-bold uppercase text-purple-600 block">Withdrawal Wallet</span>
                  <span className="text-lg font-black text-purple-800">৳{(selectedUser.withdrawalWallet || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <span className="text-[10px] font-bold uppercase text-blue-600 block">Team Downlines</span>
                  <span className="text-lg font-black text-blue-800">{selectedUser.teamCount || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Contact Information</h3>
                  <div className="p-3.5 rounded-xl border bg-white space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Phone:</span>
                      <span className="font-bold text-slate-800">{selectedUser.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Address:</span>
                      <span className="font-semibold text-slate-700">
                        {selectedUser.addresses && selectedUser.addresses.length > 0 
                          ? `${selectedUser.addresses[0].street || ''}, ${selectedUser.addresses[0].city || ''}`
                          : 'No address saved'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* E-Commerce Stats */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Orders & Sales</h3>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <span className="text-lg font-black text-orange-600">{selectedUser.totalOrders}</span>
                      <span className="text-[10px] font-bold uppercase text-orange-500 block">Total Orders</span>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="text-lg font-black text-primary">৳{selectedUser.totalSpent.toLocaleString()}</span>
                      <span className="text-[10px] font-bold uppercase text-primary/60 block">Total Spent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Admin Modal */}
      <Dialog open={isAssignAdminOpen} onOpenChange={setIsAssignAdminOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="bg-blue-600 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white">Assign Admin Access</DialogTitle>
              <p className="text-blue-100 text-xs mt-1">Grant admin permissions using email or phone number.</p>
            </DialogHeader>
          </div>

          <form onSubmit={handleAssignAdmin} className="p-6 space-y-4 bg-white">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Full Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full h-11 px-3.5 rounded-xl border bg-slate-50 focus:bg-white text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">
                Email or Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                placeholder="email@example.com or 017xxxxxxxx"
                required
                className="w-full h-11 px-3.5 rounded-xl border bg-slate-50 focus:bg-white text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl border bg-slate-50 focus:bg-white text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignAdminOpen(false)}
                className="flex-1 h-11 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAssigning}
                className="flex-[2] h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-xs text-white"
              >
                {isAssigning ? 'Processing...' : 'Confirm Assign'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
