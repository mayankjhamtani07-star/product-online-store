importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBbeYbHPQpsUmLfcePmOUK75aepoHF_7Jo",
    authDomain: "ticket-system-4550e.firebaseapp.com",
    projectId: "ticket-system-4550e",
    storageBucket: "ticket-system-4550e.firebasestorage.app",
    messagingSenderId: "811134532906",
    appId: "1:811134532906:web:7c0b0820c1d1a8a38bb253"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.data;
    self.registration.showNotification(title, {
        body,
        icon: "/vite.svg"
    });
});
