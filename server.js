import express from 'express';
import dotenv from 'dotenv';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { OpenFgaClient, CredentialsMethod } from '@openfga/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Initial Setup ---
dotenv.config();
const app = express();
const port = process.env.PORT || 6060;

// --- ES Module Workaround for __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Database Setup (lowdb) ---
const adapter = new JSONFile('db.json');
const db = new Low(adapter, { profiles: [] });

const initializeDatabase = async () => {
    await db.read();
    if (!db.data.profiles || db.data.profiles.length === 0) {
        db.data = {
            profiles: [
                { id: 'user_123', name: 'Alice', loyaltyPoints: 1500, tier: 'Gold', lastVisit: '2024-07-09' },
                { id: 'user_456', name: 'Bob', loyaltyPoints: 800, tier: 'Silver', lastVisit: '2024-07-08' },
                { id: 'user_789', name: 'Cathy', loyaltyPoints: 25000, tier: 'Platinum', lastVisit: '2024-07-10' },
            ]
        };
        await db.write();
    }
};

// --- Auth0 FGA Client Setup ---
let fgaClient;
if (process.env.FGA_STORE_ID && process.env.FGA_CLIENT_ID) {
    fgaClient = new OpenFgaClient({
        apiUrl: process.env.FGA_API_URL,
        storeId: process.env.FGA_STORE_ID,
        credentials: {
            method: CredentialsMethod.ClientCredentials,
            config: {
                clientId: process.env.FGA_CLIENT_ID,
                clientSecret: process.env.FGA_CLIENT_SECRET,
                apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER,
                apiAudience: process.env.FGA_API_AUDIENCE,
            },
        },
    });
} else {
    console.error("FATAL: Auth0 FGA environment variables not set. The application cannot make authorization decisions.");
}

// --- Authorization Check Logic ---
const checkAuthorization = async (user, relation, object) => {
    if (!fgaClient) {
        const errorMessage = "Auth0 FGA Client is not configured. Please check your environment variables.";
        console.error(errorMessage);
        return { allowed: false, error: errorMessage };
    }
    try {
        const { allowed } = await fgaClient.check({ user, relation, object });
        console.log(`FGA Check: User '${user}' | Relation '${relation}' | Object '${object}' -> ${allowed ? 'Allowed' : 'Denied'}`);
        return { allowed };
    } catch (error) {
        console.error("FGA Check Error:", error);
        return { allowed: false, error: error.message };
    }
};

// --- API Endpoints ---

// Get all users for the login screen
app.get('/api/users', (req, res) => {
    res.json(db.data.profiles);
});

// Get profile information for a specific user
app.get('/api/profile/:targetUserId', async (req, res) => {
    const { targetUserId } = req.params;
    const { currentUserId } = req.query;

    if (!currentUserId) {
        return res.status(400).json({ error: 'currentUserId query parameter is required.' });
    }

    const { allowed, error } = await checkAuthorization(`user:${currentUserId}`, 'owner', `profile:${targetUserId}`);

    if (error) {
        return res.status(500).json({ error: `FGA check failed: ${error}` });
    }

    if (!allowed) {
        return res.status(403).json({ error: `You are not authorized to view the profile for user ${targetUserId}.` });
    }

    const profile = db.data.profiles.find(p => p.id === targetUserId);
    if (profile) {
        res.json(profile);
    } else {
        res.status(404).json({ error: 'Profile not found.' });
    }
});


// --- Server Initialization ---
const startServer = async () => {
    await initializeDatabase();
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

startServer();