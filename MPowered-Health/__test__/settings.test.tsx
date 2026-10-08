import Settings from '../src/app/(tabs)/(settings)/settings';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { renderRouter } from 'expo-router/testing-library';
import SettingsLayout from '@/app/(tabs)/(settings)/_layout';
import ManageProfile from '@/app/(tabs)/(settings)/profile';
import ManageNotifications from '@/app/(tabs)/(settings)/notifications';
import { Alert } from 'react-native';

const mockSignOut = jest.fn();
const mockDeleteUser = jest.fn();

jest.mock("@/context/authcontext", () => ({
    useAuth: () => ({
        user: jest.fn(),
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: mockSignOut,
        deleteUser: mockDeleteUser,
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

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

    test("throw error if unable to open privacy policy link", async() => {
        await render(<Settings/>);

        const browserError = new Error('Failed to open web browser');
        (openBrowserAsync as jest.Mock).mockRejectedValueOnce(browserError);

        const spyAlert = jest.spyOn(Alert, 'alert');
        fireEvent.press(screen.getByRole('link', {name : "Privacy Policy"}));
        await waitFor(() => expect(spyAlert).toHaveBeenCalledWith('Unable to open page', 'Please try again.'))
    })

    test("throw error if unable to open t&cs link", async() => {
        await render(<Settings/>);

        const browserError = new Error('Failed to open web browser');
        (openBrowserAsync as jest.Mock).mockRejectedValueOnce(browserError);

        const spyAlert = jest.spyOn(Alert, 'alert');
        fireEvent.press(screen.getByRole('link', {name : "Terms and Conditions"}));
        await waitFor(() => expect(spyAlert).toHaveBeenCalledWith('Unable to open page', 'Please try again.'))
    })
})

//todo: fix expo router linking issue
describe("navigation tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

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

describe("sign out tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("user presses on sign out button and the sign out alert appears", async() => {
        await render(<Settings/>);
        const spyAlert = jest.spyOn(Alert, 'alert');
        fireEvent.press(screen.getByText("Sign Out"));
        expect(spyAlert).toHaveBeenCalledWith("Sign Out", "Are you sure you want to sign out?", expect.any(Array));
    })

    test("sign out alert shows cancel and sign out options", async() => {
        await render(<Settings/>);
        const spyAlert = jest.spyOn(Alert, 'alert');
        const alertButtons = [{
            text: 'Cancel',
            onPress: expect.anything(),
            style: 'cancel',
        },
        {
            text: 'Sign Out',
            onPress: expect.anything(),
            style: 'destructive',
        }]

        fireEvent.press(screen.getByText("Sign Out"));
        expect(spyAlert).toHaveBeenCalledWith("Sign Out", "Are you sure you want to sign out?", expect.arrayContaining(alertButtons));        
    })

    test("pressing cancel on sign out alert does not sign out the user", async() => {
        await render(<Settings/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        fireEvent.press(screen.getByText("Sign Out"));

        //press the cancel button
        const buttons = spyAlert.mock.calls?.[0]?.[2];
        await buttons?.[0]?.onPress?.();

        //do not call sign out
        expect(mockSignOut).not.toHaveBeenCalled();
        console.log("sign out was not called");
        expect(screen.getByText("SETTINGS")).toBeTruthy();
    })

    test("pressing sign out on sign out alert signs out the user and navigates to login", async() => {
        await render(<Settings/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        fireEvent.press(screen.getByText("Sign Out"));

        //press the sign out button
        const buttons = spyAlert.mock.calls?.[0]?.[2];
        await buttons?.[1]?.onPress?.();

        //call sign out
        console.log("calling sign out");
        expect(mockSignOut).toHaveBeenCalledTimes(1);
        console.log("sign out was called");

        //todo: navigate to login
    })
})

describe("delete account tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("user presses the delete account button and an alert appears", async() => {
        await render(<Settings/>);
        fireEvent.press(screen.getByText("Delete Account"));
        expect(Alert.alert).toHaveBeenCalledWith("Delete Account", "Are you sure you want to delete your account? This action cannot be reversed.", expect.any(Array));
    })

    test("delete account alert shows cancel and delete options", async() => {
        await render(<Settings/>);
        const spyAlert = jest.spyOn(Alert, 'alert');
        const alertButtons = [{
            text: 'Cancel',
            onPress: expect.anything(),
            style: 'cancel',
        },
        {
            text: 'Delete Account',
            onPress: expect.anything(),
            style: 'destructive',
        }]

        fireEvent.press(screen.getByText("Delete Account"));
        expect(spyAlert).toHaveBeenCalledWith("Delete Account", "Are you sure you want to delete your account? This action cannot be reversed.", expect.arrayContaining(alertButtons));        
    })

    test("pressing cancel on delete account alert does not delete the account", async() => {
        await render(<Settings/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        fireEvent.press(screen.getByText("Delete Account"));

        //press the cancel button
        const buttons = spyAlert.mock.calls?.[0]?.[2];
        await buttons?.[0]?.onPress?.();

        //do not call delete account
        expect(mockDeleteUser).not.toHaveBeenCalled();
        console.log("delete account was not called");
        expect(screen.getByText("SETTINGS")).toBeTruthy();
    })

    test("pressing delete account on alert deletes the account and navigates to splash screen", async() => {
        await render(<Settings/>);
        const spyAlert = jest.spyOn(Alert, 'alert');

        fireEvent.press(screen.getByText("Delete Account"));

        //press the delete button
        const buttons = spyAlert.mock.calls?.[0]?.[2];
        await buttons?.[1]?.onPress?.();

        //call delete
        console.log("calling delete");
        expect(mockDeleteUser).toHaveBeenCalledTimes(1);
        console.log("delete was called");

        //todo: navigate to splash screen
    })
})