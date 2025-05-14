# FarmCredit Platform

![FarmCredit Logo](public/farmcredit-logo.png)

## Overview

FarmCredit is a comprehensive financial platform designed to bridge the gap between Nigerian farmers and lenders, providing accessible credit solutions for agricultural development. The platform addresses the critical challenge of limited access to financing that Nigerian farmers face, which hinders agricultural growth and food security in the region.

# Application URL & Credentials

You can view the live project at:

- [Farm Credit Website](http://farmcredit.site/)
- [Farm Credit Website (Alternate URL)](https://v0-multi-step-form-chideras-projects-bf3bcdb1.vercel.app/)

## Dashboard Access Credentials

### Admin  
- **Username:** admin@example.com  
- **Password:** admin123

### Lender  
- **Username:** chidera.ozigbo@vfdtech.ng  
- **Password:** Dera2010$

### Farmer  
- **Username:** chideraozigbo@gmail.com  
- **Password:** Dera2010$


## Problem Statement

Nigerian farmers, particularly smallholders who make up the majority of the agricultural workforce, face significant barriers to accessing credit:

- Traditional financial institutions often consider agricultural lending high-risk
- Farmers lack formal credit histories and collateral
- High interest rates and complex application processes
- Limited financial literacy among rural farming communities
- Geographical barriers to accessing financial services

## Solution

FarmCredit creates a direct connection between farmers and lenders through a secure, transparent digital platform that:

1. Simplifies the loan application process for farmers
2. Provides lenders with tools to assess farmer creditworthiness
3. Facilitates secure transactions and loan management
4. Offers educational resources to improve financial literacy
5. Builds credit histories for previously unbanked farmers
6. Incorporates weather data and agricultural insights to reduce risk

## Key Features

### For Farmers

- **Streamlined Loan Applications**: Simple, guided process for applying for agricultural loans
- **Farm Management Tools**: Track farm production, expenses, and income
- **Credit Score Building**: Establish and improve creditworthiness through platform activity
- **Financial Education**: Access to guides on agricultural finance and best practices
- **Weather Insights**: Location-based weather forecasts and agricultural recommendations
- **Loan Repayment Management**: Track loan status and make repayments through the platform
- **Support System**: Direct communication with lenders and platform administrators

### For Lenders

- **Loan Application Review**: Comprehensive tools to assess farmer applications
- **Risk Assessment**: Data-driven insights on farmer creditworthiness
- **Portfolio Management**: Track and manage approved loans and repayments
- **Transaction History**: Complete record of all financial transactions
- **Secure Wallet System**: Manage funds for lending with secure deposit and withdrawal options
- **Analytics Dashboard**: Visualize lending performance and impact

### For Administrators

- **User Verification**: Review and approve farmer and lender registrations
- **Platform Oversight**: Monitor all transactions and loan activities
- **Support Management**: Address user inquiries and resolve disputes
- **Data Analytics**: Access comprehensive platform usage and impact metrics
- **Content Management**: Update educational resources and platform information

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router for server-side rendering and routing
- **TypeScript**: For type-safe code and improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Component library for consistent UI elements
- **Lucide React**: Icon library for modern, customizable icons
- **React Hook Form**: Form validation and submission handling
- **Recharts**: Data visualization for analytics dashboards

### Backend
- **Next.js API Routes**: Serverless functions for backend logic
- **Supabase**: PostgreSQL database with authentication and storage
- **Row-Level Security (RLS)**: Database-level security policies
- **Server Actions**: For secure server-side operations
- **JWT Authentication**: Secure user sessions and authorization

### External Services
- **Paystack**: Payment processing for loan repayments and wallet funding
- **OpenCage Geocoding**: Location services for farm registration
- **Meteoblue API**: Weather data for agricultural insights
- **Resend**: Email notifications and communications

## System Architecture

The FarmCredit platform follows a modern web application architecture:

1. **Client Layer**: Next.js frontend with React components
2. **API Layer**: Next.js API routes and Server Actions
3. **Database Layer**: Supabase PostgreSQL with RLS policies
4. **External Services**: Payment processing, weather data, geocoding

### Database Schema

The database includes the following key tables:

- **Users**: Core user information and authentication
- **Farmers**: Extended farmer profile information
- **Lenders**: Extended lender profile information
- **Farms**: Registered farm details and production data
- **Loan_Applications**: Farmer loan requests
- **Loans**: Approved and active loans
- **Transactions**: Financial transaction records
- **Bank_Accounts**: User banking information
- **Weather_Metrics**: Location-based weather data
- **Notifications**: System and user notifications
- **Support_Tickets**: User support requests
- **Learning_Modules**: Educational content

Comprehensive schema details can be found [here](https://dbdocs.io/amandinancy16/DCA-Quarterly-Hackathon-2025?table=loan_contract&schema=public&view=table_structure)

## Installation and Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Required API keys for external services

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/FarmCreditInc/farmcredit-app.git
   cd farmcredit-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Authentication
   JWT_SECRET=your_jwt_secret
   
   # Payment Processing
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   
   # External APIs
   OPENCAGE_API_KEY=your_opencage_api_key
   METEOBLUE_API_KEY=your_meteoblue_api_key
   
   # Email
   RESEND_API_KEY=your_resend_api_key
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   # or
   yarn db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new Supabase project
2. Run the migration scripts in the `supabase/migrations` directory
3. Set up storage buckets for document uploads
4. Configure Row-Level Security policies

## Project Structure

```
farmcredit/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard pages for different user roles
│   └── ...                 # Other public pages
├── components/             # React components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard UI components
│   ├── sections/           # Landing page sections
│   └── ui/                 # Reusable UI components
├── contexts/               # React context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── public/                 # Static assets
├── actions/                # Server actions
├── providers/              # Provider components
├── scripts/                # Utility scripts
├── supabase/               # Supabase migrations and configurations
│   └── migrations/         # SQL migration files
└── utils/                  # Helper functions
```

## Deployment

The FarmCredit platform is deployed on Vercel with the following configuration:

1. **Production Environment**: Connected to the main branch
2. **Preview Environments**: Generated for pull requests
3. **Environment Variables**: Configured in the Vercel dashboard
4. **Edge Functions**: Used for authentication middleware
5. **Analytics**: Enabled for performance monitoring

## Security Considerations

The platform implements multiple layers of security:

1. **JWT Authentication**: Secure user sessions
2. **Row-Level Security**: Database-level access control
3. **Input Validation**: Client and server-side validation
4. **HTTPS**: Encrypted data transmission
5. **Environment Variables**: Secure storage of sensitive information
6. **Session Management**: Automatic session expiration and renewal

## Contributing

We welcome contributions to the FarmCredit platform Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact:

- **Project Lead**: project-lead@www.farmcredit.site
- **Technical Support**: www.farmcredit.site
- **Website**: https://www.farmcredit.site

---

© 2025 FarmCredit. All rights reserved.

