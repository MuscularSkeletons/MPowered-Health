[![Github](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://github.com/MuscularSkeletons/MPowered-Health/blob/development/LICENSE)
# MPowered-Health

## About
MPowered Health is an app designed for users with musculoskeletal conditions to empower them to take charge of their health. The app's core features allow users to record weekly assessments concerning their health and prepare questions to ask healthcare professional/s. 

## Run the App in Expo

Install Git and the current [Node.js LTS](https://nodejs.org/en/download) release (which includes npm) if they are not already installed. On macOS, the setup script can install Node.js for you if [Homebrew](https://brew.sh/) is available.

Clone the repository and run the setup script from the repository root:

```sh
git clone --branch development https://github.com/MuscularSkeletons/MPowered-Health.git
cd MPowered-Health
cp MPowered-Health/.env.example MPowered-Health/.env
# Fill in the team's Supabase URL and publishable key in MPowered-Health/.env.
./setup-and-run.sh
```

The script will tell you if the Supabase settings are missing. Keep `.env` out of Git. Expo is installed with the app dependencies, so a global Expo installation is not needed. Once the server starts, scan its QR code with Expo Go on your phone, or use an installed simulator.

## Connect to Supabase

The Supabase URL and publishable key can be found from the dashboard if you click 'Connect', then choose 'Server' and look under environmental variables.

Create an `.env` inside the MPowered-Health folder on the same levels as `src` folder.

```js
MPowered-Health/
├── __test__/
├── assets/
├── src/
├── .env/                   // <-- .env should be directly under MPowered-Health
```

Paste the Supabase URL and publishable key into the `.env` folder. The file should look like: 

```sh
EXPO_PUBLIC_SUPABASE_URL='YOUR SUPABASE PROJECT URL'
EXPO_PUBLIC_SUPABASE_ANON_KEY='YOUR PUBLISHABLE KEY'
```

Ensure the `.env` file is not committed.

## Troubleshooting Tips

To diagnose expo issues, run:

```sh
npx expo-doctor
```

## Repository Structure

```js
MPowered-Health/
├── __test__/
├── assets/
├── src/
│   ├── app/
│   │   └── (auth)/          // authentication and onboarding
│   │   └── (tabs)/          // core function of app
│   ├── components/          // shared UI components
│   ├── constants/           // shared variables
│   ├── context/             // shared state
│   ├── hooks/               // custom react hooks
│   ├── lib/
│   │   └── supabase/        // database connection
│   ├── navigation/
│   ├── services/            // shared logic
│   ├── types/
│   ├── utils/               // generic helper functions
```

## Codebase Description

Click [here]() to view the guide for this codebase.

## User Manual

Click [here]() to view the user manual for this app.

## Contributors
- <a href="https://github.com/Sher-Wen">Sher-Wen Chan</a>: sherwenc@student.unimelb.edu.au
- <a href="https://github.com/hsienweic">Hsien-wei Chen</a>: hsienweic@student.unimelb.edu.au
- <a href="https://github.com/s-tut-i">Stuti Gupta</a>: ssgupta@student.unimelb.edu.au
- <a href="https://github.com/ichko-io">Ichinkhorloo Myanganbayar</a>: imyanganbaya@student.unimelb.edu.au
- <a href="https://github.com/lara-pawar">Laranya Pawar</a>: pawal@student.unimelb.edu.au
