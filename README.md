# Nordics - Premium Minecraft Server Website

A modern, feature-rich website for the Nordics Minecraft server community.

## 🚀 Features

- **Interactive Map System** - View and explore the server world with political maps
- **Community Hub** - Forums, achievements, and player statistics
- **Wiki System** - Comprehensive documentation and guides
- **Real-time Chat** - Minecraft server chat integration
- **Player Profiles** - Detailed statistics and achievements
- **Responsive Design** - Works on all devices
- **PWA Support** - Installable as a mobile app

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: WebSocket connections
- **Deployment**: Vercel/Netlify ready

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── admin/          # Admin panel components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat system components
│   ├── community/      # Community features
│   ├── forum/          # Forum system
│   ├── map/            # Interactive map components
│   ├── wiki/           # Wiki system
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── pages/              # Page components
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/nordics-website.git
cd nordics-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Fill in your Supabase credentials
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MC_SERVER_IP=your_minecraft_server_ip
VITE_MC_SERVER_PORT=25565
```

### Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Set up authentication providers
4. Configure storage buckets for images

## 📱 PWA Features

The website includes Progressive Web App features:

- **Service Worker** for offline functionality
- **Web App Manifest** for app-like experience
- **Install prompts** on supported devices
- **Offline caching** of essential resources

## 🎨 Customization

### Branding

- Update `public/site.webmanifest` for app name and colors
- Replace favicon files in `public/` directory
- Update logo in `src/components/NordicsLogo.tsx`

### Styling

- Modify `tailwind.config.ts` for theme colors
- Update CSS variables in `src/index.css`
- Customize component styles in individual component files

## 📊 Performance

- **Code Splitting** with React Router
- **Lazy Loading** for heavy components
- **Image Optimization** with responsive images
- **Bundle Analysis** with Vite build tools

## 🔒 Security

- **CSRF Protection** on forms
- **Input Validation** with Zod schemas
- **XSS Prevention** with DOMPurify
- **Rate Limiting** on API endpoints
- **Security Headers** middleware

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (when implemented)
npm run test
```

## 📦 Deployment

### Vercel

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Manual Deployment

1. Build the project: `npm run build`
2. Upload `dist/` folder to your web server
3. Configure server for SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Discord**: Join our community server
- **Email**: support@nordics.world
- **Issues**: Report bugs on GitHub

## 🙏 Acknowledgments

- Minecraft community for inspiration
- Open source contributors
- Supabase team for the excellent platform
- Shadcn/ui for beautiful components

---

Built with ❤️ for the Nordics Minecraft community
