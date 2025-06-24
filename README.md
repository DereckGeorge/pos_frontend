# Hybrid POS System

A comprehensive Point of Sale system with role-based access control, supporting both web and desktop interfaces.

## Features

### 🎯 Role-Based Access Control
- **Cashier**: Sales processing, expense recording, receipt generation
- **Manager**: Dashboard analytics, product management, reports, inventory
- **Admin**: User management, system settings, audit logs, backup/restore

### 🖥️ Multi-Platform Support
- **Web App**: Manager dashboard accessible via browser
- **Desktop App**: Electron-based app for Cashier and Admin roles
- **Responsive Design**: Optimized for touch and keyboard/mouse input

### 🛠️ Core Functionality
- Real-time sales processing with barcode scanning
- Inventory management with low stock alerts
- Expense tracking and reporting
- PDF receipt generation
- CSV/PDF export capabilities
- User management and audit logging

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Desktop**: Electron
- **Charts**: Recharts
- **Authentication**: JWT (mock implementation)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd hybrid-pos-system
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Run the web application
\`\`\`bash
npm run dev
\`\`\`

4. Run the Electron app (development)
\`\`\`bash
npm run electron-dev
\`\`\`

### Building for Production

#### Web Application
\`\`\`bash
npm run build
\`\`\`

#### Electron Desktop App
\`\`\`bash
npm run dist
\`\`\`

This will create a Windows executable in the `dist` folder.

## Demo Credentials

- **Cashier**: username: `cashier`, password: `password`
- **Manager**: username: `manager`, password: `password`  
- **Admin**: username: `admin`, password: `password`

## Project Structure

\`\`\`
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Login page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared components
│   ├── dashboard/        # Dashboard components
│   ├── cashier/          # Cashier-specific components
│   ├── admin/            # Admin-specific components
│   └── ui/               # shadcn/ui components
└── electron/             # Electron main process files
\`\`\`

## Key Features Implementation

### Authentication & Authorization
- JWT-based authentication (mock implementation)
- Role-based route protection
- Persistent login sessions

### Sales Processing
- Product search and barcode scanning
- Shopping cart functionality
- Real-time total calculation
- Receipt generation

### Dashboard Analytics
- Sales overview charts
- Real-time statistics
- Low stock alerts
- Recent activity tracking

### User Management (Admin)
- Create/delete user accounts
- Role assignment
- Activity monitoring
- System health monitoring

## API Integration

The system is designed to work with RESTful APIs. Mock data is used for demonstration, but can be easily replaced with real API calls.

### Expected API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/products` - Product listing
- `POST /api/sales` - Create new sale
- `GET /api/reports` - Generate reports
- `GET /api/users` - User management (Admin only)

## Security Considerations

- Role-based access control
- JWT token validation
- Input sanitization
- HTTPS enforcement (production)
- Secure Electron configuration

## Performance Optimizations

- Next.js automatic code splitting
- Image optimization
- Lazy loading of components
- Efficient state management
- Optimized bundle size for Electron

## Deployment

### Web Application
Deploy to Vercel, Netlify, or any static hosting service.

### Desktop Application
The Electron app can be distributed as:
- Windows executable (.exe)
- macOS application (.dmg)
- Linux package (.AppImage, .deb, .rpm)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
\`\`\`
