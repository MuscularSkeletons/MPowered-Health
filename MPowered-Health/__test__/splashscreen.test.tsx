import SplashScreen from '../src/app/(auth)/splashscreen';
import { render, screen } from '@testing-library/react-native';

//check if screen components render properly
describe('splash screen components render properly', () => {

    test('rendering get started button', async() => {
        //wait until the screen is fully rendered
        await render(<SplashScreen/>);
        expect(screen.getByText("Get Started")).toBeTruthy();
    });

    test('rendering sign in button', async() => {
        //wait until the screen is fully rendered
        await render(<SplashScreen/>);
        expect(screen.getByText("Sign in")).toBeTruthy();
    });
    
});