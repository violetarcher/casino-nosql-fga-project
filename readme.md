# Casino Concierge Chatbot with Auth0 FGA

This project is a web-based chatbot application that demonstrates how to use [Auth0 FGA](https://auth0.com/fine-grained-authorization) to implement fine-grained, relationship-based access control (ReBAC) in a real-world scenario.

The application simulates a casino's customer-facing chatbot. Users can log in as different customers (Alice, Bob, or Cathy) and ask the chatbot for their profile information, such as loyalty points and membership tier. The backend, built with Node.js and Express, uses Auth0 FGA to ensure that users can only access their own profile data, strictly enforcing the "owner" relationship defined in the authorization model.

This repository serves as a practical, end-to-end example for developers looking to integrate a powerful authorization system like Auth0 FGA into their own applications.

## Features

* **Fine-Grained Authorization:** Core logic is protected by Auth0 FGA, ensuring users can only access resources they own.
* **Client-Server Architecture:** A robust backend built with Node.js and Express handles all business logic and authorization checks.
* **Dynamic Frontend:** A clean, responsive frontend built with vanilla JavaScript and styled with Tailwind CSS.
* **Simulated Database:** Uses `lowdb` to simulate a simple JSON-based database for user profiles.
* **Secure Credential Management:** Follows best practices by using a `.env` file to manage sensitive API credentials.

## Tech Stack

* **Backend:** Node.js, Express.js
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ESM)
* **Authorization:** [Auth0 FGA](https://auth0.com/fine-grained-authorization)
* **Database:** [lowdb](https://github.com/typicode/lowdb) (for simulation)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
* **Development:** [Nodemon](https://nodemon.io/) (for auto-reloading)

## How It Works: The Authorization Flow

The core of this application is the authorization check that happens every time a user requests profile information.

1.  **User Action:** The user, logged in as `user:alice`, types "what are bob's points?" into the chat.
2.  **API Request:** The frontend sends a `GET` request to the backend endpoint: `/api/profile/user_456?currentUserId=user_123`.
3.  **Backend Intercepts:** The Express server receives the request. It extracts the `targetUserId` (`user_456`) and the `currentUserId` (`user_123`).
4.  **FGA Check:** The server calls the `checkAuthorization` function, which constructs a query for Auth0 FGA:
    * **User:** `user:user_123`
    * **Relation:** `owner`
    * **Object:** `profile:user_456`
5.  **FGA Decision:** Auth0 FGA checks its relationship tuples. It finds no tuple linking `user:user_123` as an `owner` to `profile:user_456`. It returns `{ "allowed": false }`.
6.  **Server Response:** The Express server receives the "deny" decision and sends a `403 Forbidden` status back to the frontend with an error message.
7.  **Frontend Renders:** The chatbot displays the "access denied" message to the user.

If Alice had asked for her own points, the FGA check would have found the tuple `(user:user_123, owner, profile:user_123)` and returned `{ "allowed": true }`, allowing the server to proceed and fetch the profile data.

## Getting Started

Follow these instructions to get the project set up and running on your local machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later recommended)
* [npm](https://www.npmjs.com/) (comes with Node.js)
* An [Auth0 FGA Account](https://dashboard.fga.dev/)

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/casino-chatbot-fga.git](https://github.com/your-username/casino-chatbot-fga.git)
    cd casino-chatbot-fga
    ```

2.  **Install Dependencies:**
    Install the backend dependencies listed in `package.json`.
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    You'll need to provide your Auth0 FGA credentials to the application.
    a. Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    b. Follow the [Auth0 FGA Setup Guide](#auth0-fga-setup-guide) below to get your credentials and populate the `.env` file.

### Auth0 FGA Setup Guide

1.  **Create a Store:** Log in to your [Auth0 FGA Dashboard](https://dashboard.fga.dev/) and create a new store.

2.  **Define the Authorization Model:** In the Model Explorer, paste and save the following model:
    ```fga
    model
      schema 1.1
    type user
    type profile
      relations
        define owner: [user]
    ```

3.  **Add Relationship Tuples:** In Tuple Management, add the following relationships:
    * `user:user_123` is the `owner` of `profile:user_123`
    * `user:user_456` is the `owner` of `profile:user_456`
    * `user:user_789` is the `owner` of `profile:user_789`

4.  **Get API Credentials:** In your store's **Settings** page, create a new **Authorized Client**. Copy the `Store ID`, `Client ID`, and `Client Secret` and add them to your `.env` file.

### Running the Application

1.  **Start the Server:**
    To run the server in production mode:
    ```bash
    npm start
    ```
    For development with automatic server restarts on file changes, use:
    ```bash
    npm run dev
    ```

2.  **Access the Application:**
    Once the server is running, open your web browser and navigate to:
    [http://localhost:6060](http://localhost:6060)

## API Endpoints

The Express server exposes the following endpoints:

* `GET /api/users`
    * **Description:** Retrieves a list of all user profiles for the login screen.
    * **Response:** `200 OK` - An array of user objects.

* `GET /api/profile/:targetUserId`
    * **Description:** Retrieves profile information for a specific user after performing an FGA check.
    * **Query Parameters:**
        * `currentUserId` (string, required): The ID of the user making the request.
    * **Responses:**
        * `200 OK`: The user's profile object.
        * `403 Forbidden`: If the FGA check fails.
        * `404 Not Found`: If the `targetUserId` does not exist.
        * `500 Internal Server Error`: If the FGA service is misconfigured or unreachable.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
