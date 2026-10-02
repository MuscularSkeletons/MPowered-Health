import Settings from '../src/app/(tabs)/(settings)/settings';
import { render, screen } from '@testing-library/react-native';
import { PrimaryButton } from '@/components/auth/auth-ui';

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