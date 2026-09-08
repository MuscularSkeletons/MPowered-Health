// This file connects the root app route to the opening splash screen.
import Splash from './splash';

// Keep an explicit root component so Expo Router always registers the `/` route.
export default function Index() {
  return <Splash />;
}
