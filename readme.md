## Casino Chatbot - Node.js/Express Backend

This project is the backend server for the Casino Chatbot application, built with Node.js and Express. It handles user data and authorization checks with Auth0 FGA.

### Project Structure

```
/
├── public/
│   ├── js/
│   │   └── main.js     # Frontend JavaScript
│   ├── style.css       # CSS styles
│   └── index.html      # Main HTML file
├── .env                # Environment variables
├── package.json        # Project dependencies and scripts
├── server.js           # Main Express server file
└── db.json             # lowdb database file (will be created automatically)
```

### Setup and Installation

1.  **Clone the Repository:**
    If this were a real project, you would start by cloning it from a repository. For now, just ensure all the provided files are in a single project folder.

2.  **Install Dependencies:**
    Open your terminal in the project's root directory and run the following command to install the necessary packages from `package.json`:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    a. Create a new file named `.env` in the root of your project.
    b. Copy the contents of `.env.example` into your new `.env` file.
    c. Fill in the required credentials for Auth0 FGA. You can get these from your [Auth0 FGA Dashboard](https://dashboard.fga.dev/) under your store's "Settings" page.

    ```
    # .env file

    # Server Port
    PORT=6060

    # Auth0 FGA Credentials
    FGA_API_URL=[https://api.us1.fga.dev](https://api.us1.fga.dev)
    FGA_STORE_ID=...
    FGA_CLIENT_ID=...
    FGA_CLIENT_SECRET=...
    FGA_API_TOKEN_ISSUER=fga.us.auth0.com
    FGA_API_AUDIENCE=[https://api.us1.fga.dev/](https://api.us1.fga.dev/)
    ```

### Running the Application

1.  **Start the Server:**
    To run the server, execute the following command in your terminal:
    ```bash
    npm start
    ```
    For development, you can use `nodemon` to automatically restart the server when files change:
    ```bash
    npm run dev
    ```

2.  **Access the Application:**
    Once the server is running, open your web browser and navigate to:
    [http://localhost:6060](http://localhost:6060)

You should now see the casino chatbot application, fully powered by your new Express backend.
