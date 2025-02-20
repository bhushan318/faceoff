// auth.js

// Configuration
const CONFIG = {
    
    GOOGLE_CLIENT_ID: '935225842626-ah57kpi2duu5ft64t4vcs13jqvcgluro.apps.googleusercontent.com',
    FACEBOOK_APP_ID: '675879724775943'
};

// Auth State Management
const AuthState = {
    user: null,
    isAuthenticated: false
};

// Google Auth
class GoogleAuth {
    static initialize() {
        // Load Google Sign-In API
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
            google.accounts.id.initialize({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                callback: this.handleSignIn
            });
        };
    }

    static handleSignIn(response) {
        try {
            const payload = this.decodeJwtResponse(response.credential);
            const userData = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                provider: 'google'
            };
            
            AuthState.user = userData;
            AuthState.isAuthenticated = true;
            
            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update UI
            UI.updateAuthStatus(userData);
            UI.closeModal();
            
        } catch (error) {
            console.error('Google Sign-in Error:', error);
            UI.showError('Google sign-in failed. Please try again.');
        }
    }

    static decodeJwtResponse(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    static signIn() {
        google.accounts.id.prompt();
    }
}

// Facebook Auth
class FacebookAuth {
    static initialize() {
        // Load Facebook SDK
        window.fbAsyncInit = () => {
            FB.init({
                appId: CONFIG.FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        };

        // Load Facebook SDK Script
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    static async signIn() {
        try {
            const authResponse = await new Promise((resolve) => {
                FB.login(resolve, { scope: 'public_profile,email' });
            });

            if (authResponse.authResponse) {
                const userData = await new Promise((resolve) => {
                    FB.api('/me', { fields: 'name, email, picture' }, resolve);
                });

                const user = {
                    name: userData.name,
                    email: userData.email,
                    picture: userData.picture?.data?.url,
                    provider: 'facebook'
                };

                AuthState.user = user;
                AuthState.isAuthenticated = true;
                
                // Store in localStorage
                localStorage.setItem('user', JSON.stringify(user));
                
                // Update UI
                UI.updateAuthStatus(user);
                UI.closeModal();
            }
        } catch (error) {
            console.error('Facebook Sign-in Error:', error);
            UI.showError('Facebook sign-in failed. Please try again.');
        }
    }
}

// UI Management
class UI {
    static updateAuthStatus(user) {
        if (user) {
            // Update profile section
            const profileContainer = document.getElementById('profile-container');
            const loginContainer = document.getElementById('login-container');
            
            if (profileContainer && loginContainer) {
                profileContainer.classList.remove('hidden');
                loginContainer.classList.add('hidden');
                
                document.getElementById('profile-name').textContent = user.name;
                document.getElementById('profile-email').textContent = user.email;
                if (user.picture) {
                    document.getElementById('profile-pic').src = user.picture;
                }
            }
        }
    }

    static closeModal() {
        document.getElementById('modalOverlay')?.classList.add('hidden');
        document.getElementById('signupModal')?.classList.add('hidden');
    }

    static showError(message) {
        alert(message); // You might want to replace this with a better UI notification
    }
}

// Initialize Auth
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth providers
    GoogleAuth.initialize();
    FacebookAuth.initialize();
    
    // Add click handlers to social login buttons
    document.querySelector('.google-auth-btn')?.addEventListener('click', () => {
        GoogleAuth.signIn();
    });
    
    document.querySelector('.facebook-auth-btn')?.addEventListener('click', () => {
        FacebookAuth.signIn();
    });
    
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        AuthState.user = user;
        AuthState.isAuthenticated = true;
        UI.updateAuthStatus(user);
    }
});

// Export for use in other files
export { GoogleAuth, FacebookAuth, AuthState };