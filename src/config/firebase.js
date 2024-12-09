import { initializeApp } from 'firebase/app'

const firebaseConfig = {
    apiKey: "AIzaSyAjUCGlKZL8z6jWBKZBFq7KxTVknJdhPsQ",
    authDomain: "brs---equipement-panel.firebaseapp.com",
    projectId: "brs---equipement-panel",
    storageBucket: "brs---equipement-panel.appspot.com",
    messagingSenderId: "235778313371",
    appId: "1:235778313371:web:1b28cc9e754dea71184a3e"
};

export const firebaseApp = initializeApp(firebaseConfig);
