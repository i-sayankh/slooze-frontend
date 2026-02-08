# Slooze - Food Ordering Platform

Slooze is a full-stack food ordering platform built with **Next.js 16**, **React 19**, and **TypeScript**. It features role-based access control (Admin, Manager, Member), restaurant and menu management, a shopping cart, order processing, and payment method management.

## Features

- **Authentication** -- JWT-based login with role-based access control (Admin / Manager / Member)
- **Restaurant Browsing** -- Browse a grid of restaurants and view their menus
- **Menu Management** -- Admins can create restaurants and add menu items with availability toggles
- **Shopping Cart** -- Add/remove items, adjust quantities, and checkout via a slide-out cart drawer
- **Order Management** -- Place orders, track status, and cancel orders (Admin/Manager)
- **Payment Methods** -- Admins can add, update, and set default payment methods (Card / UPI)
- **Responsive UI** -- Collapsible sidebar, top navbar with cart icon, and mobile-friendly layout
- **Theme Support** -- Light/dark mode via `next-themes`

## Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Framework          | [Next.js 16](https://nextjs.org/) (App Router)  |
| Language           | TypeScript 5                                    |
| UI Components      | [shadcn/ui](https://ui.shadcn.com/) + Radix UI  |
| Styling            | Tailwind CSS 4                                  |
| HTTP Client        | Axios (with auth interceptors)                  |
| Forms & Validation | React Hook Form + Zod                           |
| State Management   | React Context API (Cart)                        |
| Auth               | JWT (jwt-decode), localStorage + cookies        |
| Icons              | Lucide React                                    |
| Notifications      | react-hot-toast / Sonner                        |
| Charts             | Recharts                                        |

## Project Structure

```
slooze-frontend/
├── app/
│   ├── layout.tsx                 # Root layout (CartProvider, AppLayout)
│   ├── page.tsx                   # Home (redirects based on auth)
│   ├── globals.css                # Global styles
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── restaurants/
│   │   ├── page.tsx               # Restaurant listing
│   │   └── [id]/
│   │       └── page.tsx           # Restaurant menu page
│   ├── orders/
│   │   └── page.tsx               # Order history & management
│   └── payments/
│       └── page.tsx               # Payment methods (Admin only)
├── components/
│   ├── app-layout.tsx             # Main layout wrapper
│   ├── app-sidebar.tsx            # Sidebar navigation
│   ├── navbar.tsx                 # Top navigation bar
│   ├── cart-drawer.tsx            # Shopping cart drawer
│   ├── create-restaurant-dialog.tsx
│   ├── create-menu-item-dialog.tsx
│   ├── add-payment-method-dialog.tsx
│   ├── update-payment-method-dialog.tsx
│   └── ui/                        # shadcn/ui components
├── context/
│   └── cart-context.tsx           # Cart state provider
├── lib/
│   ├── api.ts                     # Axios instance & interceptors
│   ├── auth.ts                    # Token management
│   ├── user.ts                    # JWT decode utilities
│   └── utils.ts                   # Utility functions
├── middleware.ts                   # Auth middleware (route protection)
├── .env                           # Environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## Prerequisites

- [Node.js](https://nodejs.org/) **v18** or later
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)
- A running instance of the **Slooze backend API** (the frontend connects to it via `NEXT_PUBLIC_BACKEND_URL`)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/i-sayankh/slooze-frontend.git
cd slooze-frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (or edit the existing one):

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

| Variable                   | Description                              | Default                  |
| -------------------------- | ---------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_BACKEND_URL`  | URL of the Slooze backend API server     | `http://127.0.0.1:8000`  |

> If the backend is deployed remotely, set this to the deployed URL (e.g., `https://your-backend.onrender.com`).

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

### 5. Build for production

```bash
npm run build
npm start
```

## Available Scripts

| Script          | Command           | Description                        |
| --------------- | ----------------- | ---------------------------------- |
| `dev`           | `next dev`        | Start the development server       |
| `build`         | `next build`      | Create a production build          |
| `start`         | `next start`      | Start the production server        |
| `lint`          | `eslint`          | Run ESLint to check for issues     |

## Application Flow

1. **Login** -- Users authenticate with email and password. A JWT token is stored in localStorage and cookies.
2. **Browse Restaurants** -- After login, users are redirected to `/restaurants` where they can browse the restaurant list.
3. **View Menu** -- Clicking a restaurant opens its menu page with available items.
4. **Add to Cart** -- Users add items to the cart. The cart drawer shows selected items and quantities.
5. **Checkout** -- Users select a payment method and place the order.
6. **Track Orders** -- The `/orders` page shows order history with statuses (Placed, Cancelled, etc.).

## Role-Based Access

| Feature                   | Admin | Manager | Member |
| ------------------------- | :---: | :-----: | :----: |
| Browse restaurants        |  Yes  |   Yes   |  Yes   |
| View menus & add to cart  |  Yes  |   Yes   |  Yes   |
| Place orders              |  Yes  |   Yes   |  Yes   |
| Cancel orders             |  Yes  |   Yes   |   No   |
| Create restaurants        |  Yes  |   No    |   No   |
| Create menu items         |  Yes  |   No    |   No   |
| Manage payment methods    |  Yes  |   No    |   No   |

## Route Protection

The `middleware.ts` file handles authentication and route protection:

- **Unauthenticated users** are redirected to `/login`
- **Authenticated users** visiting `/` are redirected to `/restaurants`
- **Expired tokens** are automatically cleared, and the user is redirected to `/login`
- Static assets and the `/login` page are excluded from auth checks
