# Trip Hub: Alishan Day Trip

A mobile-first web application designed to help two users (Wisli and Gab) view, edit, and sync a shared trip plan in real-time without a backend database. It uses GitHub as the source of truth, directly reading and writing to `data/trip.json` in this repository via the GitHub REST API.

## Features
- **POV Switcher:** View the timeline and dashboard from a Shared perspective, or customized for Wisli or Gab.
- **Dynamic Dashboard:** Computes the current and "Next step" based on the current time and selected POV.
- **Interactive Timeline:** Edit items, reorder them, add new steps, and remove completed ones. Grouped automatically by time of day.
- **Shared Checklists:** Synchronize packing lists and day-of checklists.
- **Backend-less Sync:** Syncs directly to the GitHub repository using a Personal Access Token (PAT).
- **Conflict Handling:** Warns users if the underlying JSON file was modified by someone else since the last load.

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/alishan-trip-hub.git
   cd alishan-trip-hub
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser (typically `http://localhost:5173`).
5. Go to the **Settings** tab and configure your GitHub Sync parameters to start fetching the real data from your repository.

### How to Create the Token:
1. Go to your GitHub Settings -> Developer settings -> Personal access tokens -> **Fine-grained tokens**.
2. Click **Generate new token**.
3. Name it something recognizable, like `Trip Hub Sync`.
4. Set the expiration (e.g., 30 or 90 days).
5. **Repository access:** Select **Only select repositories** and choose `alishan-trip-hub`.
6. **Permissions:**
   - Go to **Repository permissions**.
   - Find **Contents** and set it to **Read and write**.
   - No other permissions are needed.
7. Click **Generate token** and copy it immediately.

### Entering the Token in the App:
1. Open the Trip Hub app on your phone.
2. Go to the **Settings** tab.
3. Enter the Repository Owner (e.g., your GitHub username), Repo Name (`alishan-trip-hub`), Branch (`main`), and File Path (`data/trip.json`).
4. Paste your Fine-Grained PAT into the Token field.
5. Click **Save Settings**.
6. Go back to the Dashboard or Timeline and click the **Reload from GitHub** (Refresh) button at the top right to verify it works!

## Privacy Note
Since this is a public/private GitHub repository, **do not put sensitive personal information** (like home addresses, full names, passwords, or passport numbers) in `data/trip.json` if your repository is set to Public. If you need privacy, make the repository Private (GitHub Pages still works for Private repos if you have GitHub Pro/Team, or you can host it on Vercel/Netlify for free).
