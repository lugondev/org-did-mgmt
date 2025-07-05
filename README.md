# BizIssuer DID - Decentralized Identity Credential Management Platform

A modern web application for managing DID (Decentralized Identity) credentials, inspired by OrgDID platform. This project provides a comprehensive solution for businesses and organizations to issue, manage, and verify digital credentials.

## 🚀 Features

### Core Functionality
- **Credential Management**: Issue, view, revoke, and delete digital credentials
- **Schema Designer**: Create and manage credential schemas
- **Verification System**: Verify credential presentations
- **Organization Profiles**: Manage organization information and settings
- **Activity Logging**: Track all credential-related activities
- **Developer Tools**: API management and webhook configuration

### User Experience
- **Clean & Professional UI**: Enterprise-grade interface design
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Test Mode**: Safe environment for testing credential operations
- **Bulk Operations**: Manage multiple credentials simultaneously
- **Advanced Search**: Find credentials quickly with powerful search capabilities

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **Icons**: Lucide React
- **Package Manager**: Bun

## 📁 Project Structure

```
biz-issuer-did/
├── app/                    # Next.js app directory
│   ├── activity/          # Activity tracking page
│   ├── credentials/       # Credential management
│   ├── dashboard/         # Main dashboard
│   ├── designer/          # Schema designer
│   ├── developer/         # Developer tools
│   ├── ecosystem/         # Ecosystem management
│   ├── help/             # Help and support
│   ├── organization/      # Organization settings
│   ├── schemas/          # Schema management
│   └── verification/      # Verification tools
├── components/            # Reusable UI components
│   ├── layout/           # Layout components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions
└── docs/                 # Documentation
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563eb` - Main actions and active states
- **Light Blue**: `#dbeafe` - Active backgrounds
- **Gray Background**: `#f8f9fa` - Sidebar and secondary areas
- **Text Colors**: `#1f2937`, `#6b7280`, `#9ca3af`

### Typography
- **Font**: Inter (sans-serif)
- **Sizes**: 14px-16px for body text
- **Hierarchy**: Clear heading structure

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/biz-issuer-did.git
   cd biz-issuer-did
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
bun run build
bun start
```

## 📱 Pages Overview

| Page | Description | Status |
|------|-------------|--------|
| `/dashboard` | Main dashboard with overview | ✅ |
| `/credentials` | Credential management interface | ✅ |
| `/schemas` | Schema creation and management | 🚧 |
| `/designer` | Visual schema designer | 🚧 |
| `/verification` | Credential verification tools | 🚧 |
| `/organization` | Organization profile settings | 🚧 |
| `/ecosystem` | Ecosystem management | 🚧 |
| `/activity` | Activity logs and history | 🚧 |
| `/developer` | API and webhook management | 🚧 |
| `/help` | Help and support resources | 🚧 |

## 🔧 Development

### Code Style
- **Language**: All code and comments in English
- **Formatting**: Prettier configuration included
- **Components**: Function-level comments for all components
- **TypeScript**: Strict type checking enabled

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow the established design system
- Add comprehensive comments for complex logic

### File Naming
- Components: PascalCase (e.g., `CredentialCard.tsx`)
- Pages: kebab-case (e.g., `credential-list.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by OrgDID platform by Dock Labs
- Built with modern web technologies
- Designed for enterprise credential management needs

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the `/help` section in the application
- Review the documentation in the `/docs` folder

---

**Note**: This is a clone/recreation project for educational and development purposes. It aims to replicate the functionality and design of professional DID credential management platforms.