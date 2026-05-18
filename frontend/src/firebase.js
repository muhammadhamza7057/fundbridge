import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCADavD434HEwS8hgUoiveIigc2OePsMS0',
  authDomain: 'fundbridge-55b5e.firebaseapp.com',
  projectId: 'fundbridge-55b5e',
  storageBucket: 'fundbridge-55b5e.firebasestorage.app',
  messagingSenderId: '202380272582',
  appId: '1:202380272582:web:4e77fad46a485c2c9888c7',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

async function signInWithGooglePopup() {
  return await signInWithPopup(auth, provider);
}

async function signInWithGoogleRedirect() {
  return await signInWithRedirect(auth, provider);
}

async function getGoogleRedirectResult() {
  return await getRedirectResult(auth);
}

export { app, auth, provider, signInWithGooglePopup, signInWithGoogleRedirect, getGoogleRedirectResult };
