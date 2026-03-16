import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes with main layout
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./features/home/home/home').then(m => m.Home) },
      { path: 'products', loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductList) },
      { path: 'products/:slug', loadComponent: () => import('./features/products/product-detail/product-detail').then(m => m.ProductDetail) },

      // Auth (guest only)
      { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
      { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterPage) },

      // Cart & Checkout (accessible to both guests and logged-in users)
      { path: 'cart', loadComponent: () => import('./features/cart/cart/cart').then(m => m.CartPage) },
      { path: 'checkout', loadComponent: () => import('./features/cart/checkout/checkout').then(m => m.Checkout) },
      { path: 'order-confirmation/:orderNumber', loadComponent: () => import('./features/cart/order-confirmation/order-confirmation').then(m => m.OrderConfirmation) },
      { path: 'track-order', loadComponent: () => import('./features/cart/track-order/track-order').then(m => m.TrackOrder) },
      { path: 'wishlist', canActivate: [authGuard], loadComponent: () => import('./features/wishlist/wishlist/wishlist').then(m => m.WishlistPage) },

      // Redirects
      { path: 'categories', redirectTo: 'products', pathMatch: 'full' },

      // Account
      { path: 'account/profile', canActivate: [authGuard], loadComponent: () => import('./features/account/profile/profile').then(m => m.ProfilePage) },
      { path: 'account/orders', canActivate: [authGuard], loadComponent: () => import('./features/account/orders/orders').then(m => m.OrdersPage) },
      { path: 'account/addresses', canActivate: [authGuard], loadComponent: () => import('./features/account/addresses/addresses').then(m => m.AddressesPage) },
    ],
  },

  // Admin routes with admin layout
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.AdminDashboard) },
      { path: 'products', loadComponent: () => import('./features/admin/products/products').then(m => m.AdminProducts) },
      { path: 'categories', loadComponent: () => import('./features/admin/categories/categories').then(m => m.AdminCategories) },
      { path: 'brands', loadComponent: () => import('./features/admin/brands/brands').then(m => m.AdminBrands) },
      { path: 'orders', loadComponent: () => import('./features/admin/orders/orders').then(m => m.AdminOrders) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users').then(m => m.AdminUsers) },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
