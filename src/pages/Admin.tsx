import React, { useContext, useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { Context } from '../main';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Lock, Unlock, LogOut, Users, Search, RefreshCw, ListIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ListingManager from '@/components/admin/ListingManager';
import { approveUser, blockUser, unblockUser } from '@/http/userWorkAPI';
import CategoriesTable from '@/components/CategoriesTable';

const Admin = observer(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userStore, userWorkStore } = useContext(Context)!;

  // Состояния для авторизации
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Основные состояния админ-панели
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  // Фильтр по категориям – если выбран "all", то передаётся пустая строка
  const [categoryFilter, setCategoryFilter] = useState('');

  // Состояния для действий над пользователями
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'block' | 'unblock'>('approve');

  // При изменении поискового запроса, категории или текущей страницы обновляем список
  useEffect(() => {
    userWorkStore.fetchUserCounts();
    userWorkStore.fetchUsers(userWorkStore.currentPage || 1, 10, searchQuery, categoryFilter);
  }, [searchQuery, categoryFilter, userWorkStore.currentPage]);

  useEffect(() => console.log(userStore.user), []);

const changePage = (page: number) => {
  userWorkStore.changePage(page);
};

// Обработчик логина админа
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await userStore.loginAdmin(email, password);
    toast({
      title: 'Login successful',
      description: 'Welcome to the admin dashboard.',
    });
  } catch (error: any) {
    toast({
      title: 'Login failed',
      description: error.message || 'Invalid credentials',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};

const handleLogout = () => {
  localStorage.removeItem('admin-token');
  userStore.logout();
  navigate('/');
  toast({
    title: 'Logged out',
    description: 'You have been logged out successfully.',
  });
};

const handleUserAction = (user: any, action: 'approve' | 'block' | 'unblock') => {
  setSelectedUser(user);
  setActionType(action);
  setIsActionDialogOpen(true);
};

const confirmUserAction = async () => {
  if (!selectedUser) return;

  const currentUserRole = userStore.user.role; // Получаем роль текущего пользователя

  // Проверка: модератор не может банить или разбанивать модератора
  if (selectedUser.role === 'moderator' && currentUserRole !== 'admin') {
    return toast({
      title: 'Access Denied',
      description: 'You do not have permission to perform this action.',
      variant: 'destructive',
    });
  }

  try {
    let actionMessage = '';
    let updatedUser = { ...selectedUser };

    switch (actionType) {
      case 'approve':
        await approveUser(selectedUser.id);
        updatedUser.status = 'approved';
        actionMessage = `${selectedUser.fullName || selectedUser.name} has been approved successfully.`;
        break;
      case 'block':
        await blockUser(selectedUser.id);
        updatedUser.status = 'blocked';
        actionMessage = `${selectedUser.fullName || selectedUser.name} has been blocked successfully.`;
        break;
      case 'unblock':
        await unblockUser(selectedUser.id);
        updatedUser.status = 'approved';
        actionMessage = `${selectedUser.fullName || selectedUser.name} has been unblocked successfully.`;
        break;
    }

    userWorkStore.users = userWorkStore.users.map((u: any) =>
      u.id === selectedUser.id ? updatedUser : u
    );

    toast({
      title: 'Action completed',
      description: actionMessage,
    });

    await userWorkStore.fetchUserCounts();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Something went wrong',
      variant: 'destructive',
    });
  } finally {
    setIsActionDialogOpen(false);
  }
};

const refreshUserList = () => {
  userWorkStore.fetchUsers(userWorkStore.currentPage || 1, 10, searchQuery, categoryFilter);
  toast({
    title: 'Refreshed',
    description: 'User list has been refreshed.',
  });
};

// Если админ не авторизован – показываем форму логина
if (!localStorage.getItem('admin-token')) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Admin Login</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to access the admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email-address">Email address</Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Sign in'}
            </Button>
          </div>
        </form>
        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/')}>
            Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Business Unit Club Admin
        </h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Site
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl p-4 py-6 sm:px-6 lg:px-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex items-center">
            <ListIcon className="mr-2 h-4 w-4" />
            <span>Listing Management</span>
          </TabsTrigger>
          {userStore.user.role === 'admin' && (
            <TabsTrigger value="categories" className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="users">
          {/* Статистика */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{userWorkStore.total || 0}</div>
                  <Users className="h-5 w-5 text-gray-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{userWorkStore.pending || 0}</div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                    Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{userWorkStore.approved || 0}</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                    Approved
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{userWorkStore.blocked || 0}</div>
                  <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                    Blocked
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Поиск и кнопка обновления */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full sm:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={refreshUserList}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh List
            </Button>
          </div>
          {/* Фильтрация по категориям */}
          <Tabs
            defaultValue={categoryFilter || 'all'}
            onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Requests</TabsTrigger>
              <TabsTrigger value="approved">Approved Users</TabsTrigger>
              <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
              <TabsTrigger value="all">All Users</TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Таблица пользователей */}
          <UserTable
            users={userWorkStore.users}
            currentUserRole={userStore.user.role}
            onApprove={(user) => handleUserAction(user, 'approve')}
            onBlock={(user) => handleUserAction(user, 'block')}
            onUnblock={(user) => handleUserAction(user, 'unblock')}
          />
          {/* Пагинация */}
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => changePage(userWorkStore.currentPage - 1)}
              disabled={userWorkStore.currentPage === 1}
            >
              Prev
            </Button>
            <span className="mx-2">
              {userWorkStore.currentPage} / {userWorkStore.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => changePage(userWorkStore.currentPage + 1)}
              disabled={userWorkStore.currentPage === userWorkStore.totalPages}
            >
              Next
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="listings">
          <ListingManager />
        </TabsContent>
        <TabsContent value="categories">
          {userStore.user.role === 'admin' && <CategoriesTable />}
        </TabsContent>
      </Tabs>
    </main>
    <AlertDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType === 'approve'
              ? 'Approve User'
              : actionType === 'block'
                ? 'Block User'
                : 'Unblock User'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === 'approve' &&
              "This will grant the user access to member features."}
            {actionType === 'block' &&
              "This will prevent the user from accessing their account."}
            {actionType === 'unblock' &&
              "This will restore the user's access to their account."}
            <br />
            <br />
            User: {selectedUser?.fullName || selectedUser?.name} ({selectedUser?.email})
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmUserAction}>
            {actionType === 'approve'
              ? 'Approve'
              : actionType === 'block'
                ? 'Block'
                : 'Unblock'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);
});

interface UserTableProps {
  users: any[];
  currentUserRole: string; // Добавили текущую роль пользователя
  onApprove: (user: any) => void;
  onBlock: (user: any) => void;
  onUnblock: (user: any) => void;
}

function UserTable({ users, currentUserRole, onApprove, onBlock, onUnblock }: UserTableProps) {
  if (!users || users.length === 0) {
    return <div className="py-8 text-center text-gray-500">No users found.</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case 'blocked':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Blocked</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.fullname || user.name}
                {user.role === 'admin' && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800">Admin</Badge>
                )}
                {user.role === 'moderator' && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">Moderator</Badge>
                )}
              </TableCell>
              <TableCell>
                <div>{user.email}</div>
                {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
              </TableCell>
              <TableCell>
                {user.purpose ? (
                  <span className="capitalize">{user.purpose}</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {user.role !== 'admin' && (
                    <>
                      {/* Проверяем, является ли текущий пользователь модератором и пытается ли управлять другим модератором */}
                      {(currentUserRole === 'admin' || user.role !== 'moderator') && (
                        <>
                          {user.status === 'pending' && (
                            <Button variant="outline" size="sm" onClick={() => onApprove(user)}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {user.status !== 'blocked' && (
                            <Button variant="outline" size="sm" onClick={() => onBlock(user)}>
                              <Lock className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                          {user.status === 'blocked' && (
                            <Button variant="outline" size="sm" onClick={() => onUnblock(user)}>
                              <Unlock className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default Admin;
