import Settings from '../src/app/(tabs)/(settings)/settings';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PrimaryButton } from '@/components/auth/auth-ui';
import { openBrowserAsync } from 'expo-web-browser';
import { renderRouter } from 'expo-router/testing-library';
import SettingsLayout from '@/app/(tabs)/(settings)/_layout';
import ManageProfile from '@/app/(tabs)/(settings)/profile';
import ManageNotifications from '@/app/(tabs)/(settings)/notifications';

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: jest.fn(),
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        isLoading: false,
    }),
}))

//mocking the web browser
jest.mock('expo-web-browser', () => ({
    openBrowserAsync: jest.fn()
}))

describe("objects rendering on screen", () => {
    test("objects are rendered on screen" , async() =>{
        await render(<Settings/>);
        expect(screen.getByText("SETTINGS")).toBeTruthy();
        expect(screen.getByText("Edit Your Profile")).toBeTruthy();
        expect(screen.getByRole('button', {name : "Edit Profile"})).toBeTruthy();
        expect(screen.getByRole('button', {name : "Notifications"})).toBeTruthy();
        expect(screen.getByRole('link', {name : "Privacy Policy"})).toBeTruthy();
        expect(screen.getByRole('link', {name : "Terms and Conditions"})).toBeTruthy();
        expect(screen.getByText("Sign Out")).toBeTruthy();
        expect(screen.getByText("Delete Account")).toBeTruthy();
    })
})

describe("url link tests", () => {

    test("clicking on privacy policy opens the correct link", async() => {
        await render(<Settings/>);
        fireEvent.press(screen.getByRole('link', {name : "Privacy Policy"}));
        await expect(openBrowserAsync).toHaveBeenCalledWith('https://muscha.org/privacy-policy/');
    })

    test("clicking on T&Cs opens the correct link", async() => {
        await render(<Settings/>);
        fireEvent.press(screen.getByRole('link', {name : "Terms and Conditions"}));
        await expect(openBrowserAsync).toHaveBeenCalledWith('https://muscha.org/terms-and-conditions/');
    })
})

describe("navigation tests", () => {

    test("clicking on edit profile directs to edit profile screen", async() => {
        await renderRouter(
            {
                "_layout": () => <SettingsLayout/>,
                "Edit Profile": () => <ManageProfile/>,
            }, {
                initialUrl: '../src/app/(tabs)/(settings)/settings',
            }
        )

        fireEvent.press(screen.getByRole('button', {name : "Edit Profile"}));
        expect(screen.getByText("PROFILE")).toBeTruthy();
    
    })

    test("clicking on notifications directs to notifications screen", async() => {
        await renderRouter(
            {
                "_layout": () => <SettingsLayout/>,
                "notifications": () => <ManageNotifications/>,
            }, {
                initialUrl: '../src/app/(tabs)/(settings)/settings',
            }
        )

        fireEvent.press(screen.getByRole('button', {name : "Notifications"}));
        expect(screen.getByText("NOTIFICATIONS")).toBeTruthy();
    })
})