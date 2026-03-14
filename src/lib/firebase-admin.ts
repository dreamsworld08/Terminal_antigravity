import * as admin from 'firebase-admin';

// Protect against multiple initializations in development
if (!admin.apps.length) {
    admin.initializeApp({
        // In a real production app we would use a service account key here.
        // For project ID verification in NextAuth credentials authorize,
        // we can initialize simply using the project ID.
        projectId: "terminal-app-7ac22",
    });
}

const adminAuth = admin.auth();

export { adminAuth };
