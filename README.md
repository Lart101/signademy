<div align="center">

# 🤟 Signademy

### Interactive AI-Powered Sign Language Learning Platform

*Master American Sign Language through structured modules, AI-powered feedback, and gamified challenges*

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure)

</div>

---

## 📖 About

**Signademy** is a modern web application designed to make American Sign Language (ASL) learning accessible, interactive, and engaging for everyone. Whether you're a complete beginner or looking to expand your sign language vocabulary, Signademy provides a comprehensive learning experience with AI-powered tools and gamified challenges.

### 🎯 Mission

Bridging communication gaps by making ASL education freely available through an intuitive, web-based platform that combines video demonstrations, real-time AI feedback, and interactive challenges.

---

## ✨ Features

### 📚 **Learning Modules**
- **6 Structured Categories**: Alphabet (26), Numbers (10), Colors (8), Basic Words (6), Family (5), and Food (6)
- **50+ High-Quality Video Demonstrations** with clear, easy-to-follow sign language instructions
- Browse and replay any sign instantly from the comprehensive library

### 🎮 **Interactive Challenge Modes**
- **Flash Sign Challenge**: Test your recognition speed with timed rounds
- **Endless Survival Mode**: Practice continuously with progressive difficulty
- **Video Matching Game**: Match signs to their meanings
- **Speed Drill**: Build muscle memory through rapid-fire practice

### 🤖 **AI-Powered Tools**

#### 📹 Webcam Detection
- Real-time sign language recognition using your device camera
- Instant AI feedback on sign accuracy with MediaPipe hand tracking
- Practice mode with confidence scoring

#### ✍️ Text to Sign Converter
- Type any sentence and see corresponding sign demonstrations
- Letter-by-letter video playback with pacing controls
- Perfect for learning to spell in ASL

#### 🖼️ Image to Sign Detector
- Upload photos of hand signs for instant AI recognition
- Confidence scoring for each detected letter
- Great for testing your signing accuracy

### 🎨 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Comfortable viewing in any environment
- **Smooth Animations**: Polished UI with Framer Motion transitions
- **Accessibility First**: Built with inclusive design principles

### 🔐 **Admin Dashboard**
- Secure authentication with Supabase
- Manage AI models and training data
- Upload and organize sign language media
- Monitor platform analytics

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI component library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component collection

### Backend & Services
- **[Supabase](https://supabase.com/)** - Backend as a Service (Authentication, Storage, Database)
- **[MediaPipe](https://mediapipe.dev/)** - Hand tracking and gesture recognition
- **Custom TensorFlow Models** - Sign language classification

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation
- **[Lucide React](https://lucide.dev/)** - Icon library

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun package manager
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/signademy.git
   cd signademy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SUPABASE_BUCKET=your-bucket-name
   
   # MediaPipe Configuration
   NEXT_PUBLIC_MEDIAPIPE_CDN=https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs
   NEXT_PUBLIC_MEDIAPIPE_WASM=https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
signademy/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── admin/                    # Admin dashboard
│   ├── challenge/                # Challenge modes
│   ├── components/               # Shared components
│   ├── contact/                  # Contact page
│   ├── mission/                  # Mission statement
│   ├── modules/                  # Learning modules
│   ├── tools/                    # AI tools
│   │   ├── image-to-sign/
│   │   ├── text-to-sign/
│   │   └── webcam/
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable UI components
│   └── ui/                       # shadcn/ui components
├── hooks/                        # Custom React hooks
│   ├── use-gesture-recognizer.ts
│   └── use-mobile.ts
├── lib/                          # Utility libraries
│   ├── ai-models.ts              # AI model configuration
│   ├── asl-data.ts               # ASL dataset
│   ├── load-mediapipe.ts         # MediaPipe loader
│   ├── model-cache.ts            # Model caching
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
│   ├── audio/                    # Sound effects
│   ├── image/                    # Images
│   ├── sign_language_images/     # Sign images
│   └── sign_language_videos/     # Sign videos
└── package.json                  # Dependencies
```

---

## 🎯 Usage

### For Learners

1. **Start with Modules**: Navigate to the Modules page to explore 50+ sign language demonstrations
2. **Practice with Tools**: Use the Text-to-Sign converter to learn spelling in ASL
3. **Get Real-Time Feedback**: Try the Webcam Detection tool to practice and improve
4. **Test Your Skills**: Challenge yourself with various game modes
5. **Upload & Verify**: Use Image Detection to check if your hand signs are correct

### For Administrators

1. Navigate to `/admin`
2. Authenticate with Supabase credentials
3. Manage AI models, upload training data, and organize media content
4. Monitor platform usage and analytics

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and not yet licensed for public use.

---

## 🙏 Acknowledgments

- ASL video content and educational resources
- MediaPipe team for hand tracking technology
- Supabase for backend infrastructure
- The open-source community for amazing tools and libraries

---

<div align="center">

**Made with ❤️ for the ASL learning community**

*Empowering communication, one sign at a time*

</div>
