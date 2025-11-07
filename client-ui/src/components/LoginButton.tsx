import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
    const { loginWithRedirect } = useAuth0();

    const handleLogin = async () => {
        await loginWithRedirect({
            appState: {
                returnTo: window.location.pathname,
            },
            authorizationParams: {
                prompt: "select_account",
            }
        });
    };

    return <button onClick={handleLogin}>Log In</button>;
}