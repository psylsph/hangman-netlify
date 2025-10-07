# Deployment Guide for Hangman Game

This guide will walk you through deploying the Hangman Game to Netlify with Supabase for real-time features.

## Prerequisites

1. **Node.js** (version 18 or higher) installed on your machine
2. **Git** for version control
3. **GitHub** account for code hosting
4. **Netlify** account for deployment
5. **Supabase** account for real-time features

## Step 1: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Choose your organization
   - Enter a project name (e.g., "hangman-game")
   - Set a database password
   - Select a region close to your users
   - Click "Create new project"

2. **Get Your Supabase Credentials**
   - Once your project is created, go to Settings > API
   - Copy the Project URL and the anon public key
   - Keep these safe; you'll need them for environment variables

3. **Set Up Database Tables**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the SQL from `database-schema.md`
   - Click "Run" to execute the schema

4. **Enable Real-time for Tables**
   - Go to Settings > API
   - Under "Realtime", enable the following tables:
     - `rooms`
     - `game_sessions`
     - `chat_messages`
     - `room_players`

## Step 2: Set Up Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/hangman-netlify.git
   cd hangman-netlify
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   - Open `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   
   - Open your browser and navigate to `http://localhost:1234`
   - Test the application to ensure everything works

   **Note**: The project uses npx to run Parcel, which uses the locally installed version. This avoids issues with Parcel not being found in the global PATH.

## Step 3: Set Up GitHub Repository

1. **Create a New Repository on GitHub**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Enter a repository name (e.g., "hangman-netlify")
   - Choose Public or Private
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push Your Code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/hangman-netlify.git
   git push -u origin main
   ```

## Step 4: Deploy to Netlify

1. **Sign Up/Log In to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up or log in

2. **Create a New Site**
   - Click "Add new site" > "Import an existing project"
   - Select "GitHub"
   - Authorize Netlify to access your GitHub account
   - Select the "hangman-netlify" repository

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (or higher)

4. **Set Environment Variables**
   - Click "Advanced settings" > "Environment variables"
   - Add the following variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your site
   - Once deployed, you'll get a random URL like `random-name-123456.netlify.app`

## Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain in Netlify**
   - Go to Site settings > Domain management
   - Click "Add custom domain"
   - Enter your domain name (e.g., `hangmangame.com`)
   - Click "Verify"

2. **Update DNS Records**
   - Netlify will provide DNS records
   - Add these records to your domain registrar
   - Wait for DNS propagation (can take up to 48 hours)

## Step 6: Test the Deployed Application

1. **Visit Your Site**
   - Open your Netlify URL in a browser
   - Test all features:
     - Single player mode
     - Multiplayer mode (if implemented)
     - UI interactions
     - Sound effects

2. **Check Browser Console**
   - Open developer tools
   - Check for any errors in the console
   - Fix any issues found

## Step 7: Set Up Continuous Deployment

Your site is already set up for continuous deployment. Every time you push changes to the main branch, Netlify will automatically rebuild and deploy your site.

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check the build logs in Netlify
   - Ensure all dependencies are properly installed
   - Verify your build command is correct

2. **Environment Variables Not Working**
   - Ensure variables are set in Netlify, not just locally
   - Variable names must start with `VITE_` to be accessible in the browser
   - Restart the build after changing environment variables

3. **Supabase Connection Issues**
   - Verify your Supabase URL and API key are correct
   - Check that Row Level Security (RLS) policies are properly configured
   - Ensure real-time is enabled for the required tables

4. **CORS Issues**
   - Make sure your Netlify URL is added to the allowed origins in Supabase
   - Check your CORS settings in Supabase

5. **Assets Not Loading**
   - Ensure all asset paths are relative to the root
   - Check that assets are in the correct directories

6. **Parcel Not Found Error**
   - The project uses npx to run Parcel, which uses the locally installed version
   - Make sure you've run `npm install` to install all dependencies
   - If you still have issues, you can install Parcel globally with `npm install -g parcel`

### Debugging Tips

1. **Use Netlify Functions for Debugging**
   - Create serverless functions to log errors
   - Check function logs in Netlify dashboard

2. **Check Network Tab**
   - Use browser developer tools to inspect network requests
   - Verify API calls are being made correctly

3. **Test Locally First**
   - Always test changes locally before deploying
   - Use the Netlify CLI to test builds locally

## Performance Optimization

1. **Enable Caching**
   - Netlify automatically caches static assets
   - Check `netlify.toml` for caching rules

2. **Optimize Images**
   - Use WebP format for images
   - Compress images before adding to the project

3. **Minimize Bundle Size**
   - Use code splitting for large JavaScript files
   - Remove unused dependencies

## Security Considerations

1. **API Keys**
   - Never expose secret keys in client-side code
   - Use environment variables for sensitive data

2. **Content Security Policy**
   - Implement CSP headers in `netlify.toml`
   - Prevent XSS attacks

3. **HTTPS**
   - Netlify automatically provides HTTPS
   - Redirect HTTP to HTTPS

## Maintenance

1. **Regular Updates**
   - Keep dependencies up to date
   - Update Supabase schema as needed

2. **Monitoring**
   - Set up error monitoring (e.g., Sentry)
   - Monitor site performance

3. **Backups**
   - Supabase automatically backs up your database
   - Keep your code in Git for version control

## Additional Features

Once your basic deployment is working, you can add:

1. **Analytics**
   - Google Analytics
   - Netlify Analytics

2. **Forms**
   - Netlify Forms for contact forms
   - Form handling with Netlify Functions

3. **Search**
   - Implement search functionality
   - Use Algolia or similar service

4. **SEO**
   - Add meta tags
   - Implement structured data

## Conclusion

Your Hangman Game is now deployed and accessible to users worldwide! You can continue to develop and improve the game, and Netlify will automatically deploy your changes.

For more information, check out:
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)