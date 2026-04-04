# Trust: Frontend Application

The user interface for the **Trust** undercollateralized lending protocol, built with **Next.js** and designed for the **HashKey Chain**.

## ✨ UI/UX Highlights
- **Black + Purple Theme**: High-contrast, premium aesthetic tailored for privacy and the HashKey brand.
- **Glassmorphism**: Modern, translucent UI components using Tailwind CSS and custom backdrops.
- **Vanta.js Shards**: Dynamic 3D background animations for a high-impact first impression.
- **Responsive Dashboard**: Mobile-ready layout for managing loans and viewing credit history.

## 🛠️ Tech Stack
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Auth & Wallets**: [Privy](https://privy.io/)
- **Identity**: [World ID (IDKit)](https://worldcoin.org/world-id)
- **Database**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Three.js](https://threejs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

## 🏗️ Getting Started

### Installation
We recommend using [Bun](https://bun.sh/) for the fastest development experience.
```bash
bun install
```

### Environment Variables
Create a `.env.local` file in this directory:
```env
NEXT_PUBLIC_WORLD_ID_APP_ID=app_...
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_LOAN_MANAGER_ADDRESS=...
```

### Development Server
```bash
bun dev
```
The application will be available at [http://localhost:3001](http://localhost:3001).

---
Built with 💜 for the HashKey Hackathon by **Trust Team**.
