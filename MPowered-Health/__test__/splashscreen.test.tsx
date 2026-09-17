import SplashScreen from '../src/app/(auth)/splashscreen';
import { render, screen } from '@testing-library/react-native';

//check if screen components render properly
describe('splash screen components render properly', () => {

    beforeEach(async() => {
    //wait until the screen is fully rendered
        await render(<SplashScreen/>);
    })

    test('rendering get started button', () => {
        expect(screen.getByText("Get Started")).toBeTruthy();
    });

    test('rendering sign in button', () => {
        expect(screen.getByText("Sign in")).toBeTruthy();
    });
    
     //todo:add slideshow render test
    /*
    test('rendering app info slide show', async() => {

        //use fireEvent() and mocks

    })*/

});