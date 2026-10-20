import SplashScreen from '@/app/(auth)/splashscreen';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
    }),
}))

//mocking expo router
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}))

//mocking the slide show component
jest.mock('@/components/splash/artwork', () => ({
    SplashArtwork: () => null,
}))

describe('splash screen components render properly', () => {

    test("objects are rendered on screen properly", async() => {
        await render(<SplashScreen/>);
        expect(screen.getByText("Get started →")).toBeTruthy();
        expect(screen.getByText("Sign in")).toBeTruthy();
        expect(screen.getByText('Track your pain and its impacts weekly')).toBeTruthy();
        expect(screen.getByText("Supported by ABBVIE")).toBeTruthy();
    })
});

describe ("Navigation to the correct screen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('navigate to signup page when get started button is pressed', async() => {
        await render(<SplashScreen/>);
        await fireEvent.press(screen.getByText("Get started →"));
        expect(router.replace).toHaveBeenCalledWith('/(auth)/signup');
    })

    test('navigate to login page when sign in button is pressed', async() => {
        await render(<SplashScreen/>);
        await fireEvent.press(screen.getByText("Sign in"));
        expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
    })
})