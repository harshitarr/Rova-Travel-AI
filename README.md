

# Rova Travel AI 🩷

**AI-powered travel planning made effortless, beautiful, and personal.** ✨

---

## 📖 Overview
Rova Travel AI is a next-generation travel planner that leverages artificial intelligence to generate personalized, day-by-day itineraries for any destination. Whether you're planning a solo adventure, a family vacation, or a group trip, Rova helps you discover, organize, and manage your travels with ease. The platform is designed for both desktop and mobile, offering a seamless, modern, and visually engaging experience.

---

## 🖼️ Screenshots
![Home Page](https://github.com/harshitarr/Rova-Travel-AI/blob/main/public/rovaai.png)

## ✨ Features & Unique Highlights

- **AI Itinerary Generation:** Instantly create custom travel plans based on your preferences, group size, budget, and interests. Powered by advanced AI models (OpenAI/Groq).
- **Partial Trip Saving:** Never lose your progress! If not enough places are found, missing days are auto-filled with leisure, shopping, or rest day suggestions, and the user is clearly informed.
- **Animated Typing Indicator:** See a dynamic, animated indicator when the AI is working on your itinerary, for a more human-like experience.
- **Mobile-First UX:** Optimized for mobile and medium devices, including auto-scroll to trip details after creation and responsive navigation.
- **Dynamic Navbar:** On mobile/medium, see a prominent pink login button before login, and a hamburger menu after login for easy access.
- **User Credits & Premium:** Track your usage with a clear credit system, and unlock premium/unlimited features for power users.
- **Beautiful, Modern UI:** Enjoy a visually rich interface with animated sparkles, primary pink accents, and dynamic destination names.
- **Secure Authentication:** User accounts and sessions are managed with Clerk for a seamless and secure login/signup experience.
- **Trip Management:** View, edit, and manage all your saved trips in one place.
- **Contact & Support:** Built-in contact form for user feedback and support.

---

## 🛠️ Tools & Technologies

### Frontend
- **Next.js 16** – React-based framework for server-side rendering and routing
- **Tailwind CSS** – Utility-first CSS for rapid, responsive design
- **Lucide Icons** – Modern, open-source icon set
- **Clerk** – Authentication and user management

### Backend
- **Node.js** – JavaScript runtime for API routes
- **MongoDB** – NoSQL database for storing users, trips, and itinerary data
- **Mongoose** – Elegant MongoDB object modeling for Node.js
- **OpenAI / Groq** – AI models for generating itineraries and recommendations

### APIs
- **Custom REST APIs** – For trip, user, and credits management

---

## ⚙️ Environment Setup

1. **Clone the repository:**
	```bash
	git clone https://github.com/yourusername/rova-travel-ai.git
	cd rova-travel-ai
	```

2. **Install dependencies:**
	```bash
	npm install
	# or
	yarn install
	```

3. **Configure environment variables:**
	```bash
      -NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=....
      -CLERK_SECRET_KEY=...
      -NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
      -NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
      -NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
      -NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
      -NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
      -NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
      -MONGODB_URI=...
      -GROQ_API_KEY=""
      -GROK_MODEL=""
	  
    ```

4. **Run the development server:**
	```bash
	npm run dev
	```
	Open [http://localhost:3000](http://localhost:3000) in your browser.












