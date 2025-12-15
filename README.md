# Anonymous Message Board

A simple, anonymous message board web application built with Node.js, Express, EJS, and SQLite3, containerized using Docker and Docker Compose. This application features a pure dark mode interface, support for Markdown content, and allows users to post, edit, and delete messages anonymously.

![Preview of the Application](PreviewImage.jpg)

## Features

*   **Anonymous Posting**: Share your thoughts without revealing your identity.
*   **Pure Dark Mode**: A sleek, modern dark theme is enforced throughout the application. No theme switching needed.
*   **SQLite3 Database**: Lightweight and efficient data storage.
*   **Data Persistence**: All messages are stored persistently using Docker volumes, ensuring your data is safe across container restarts.
*   **Markdown Support**: Write messages using Markdown syntax (headings, bold, italics, lists, code blocks, etc.), which will be rendered beautifully.
*   **Edit & Delete Messages**: Users can edit their previously posted messages or delete them.
*   **Private Messages with KEY Protection**: Post private messages protected by a KEY. Only users who know the correct KEY can view these messages.
*   **User Authentication**: Register and login system with session-based authentication.
*   **User-Specific Private Messages**: Logged-in users can view all their private messages without entering KEYs individually.
*   **Image Upload Support**: Upload and display images in messages (one image per message, max 10MB, supports JPEG, PNG, GIF, WebP).
*   **Responsive Design**: The application is designed to be accessible and usable across various devices, with mobile-friendly buttons.
*   **Dockerized Deployment**: Easy setup and deployment using Docker and Docker Compose.

## Tech Stack

*   **Backend**: Node.js (Latest Alpine) with Express.js
*   **Database**: SQLite3
*   **Authentication**: Express Session with SQLite session store, bcrypt for password hashing
*   **Templating**: EJS
*   **Styling**: Tailwind CSS (configured for `darkMode: 'class'`)
*   **Client-side Logic**: Native JavaScript (Fetch API)
*   **Markdown Rendering**: Showdown.js
*   **File Upload**: Multer for handling image uploads
*   **Containerization**: Docker, Docker Compose

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

You need to have Docker and Docker Compose installed on your system.

*   [Install Docker](https://docs.docker.com/get-docker/)

### Important Note for Cross-Platform Compatibility

sqlite3 is a native Node.js module that needs to be compiled on specific platform architectures. Binaries compiled on Windows are not compatible with Linux Docker containers.

To rebuild the container: Reinstall and recompile all dependencies inside the container
```bash
docker compose up --build -d
```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/carterwayneskhizeine/AnonymousMessageBoard.git
    cd AnonymousMessageBoard
    ```

2.  **Build and run the application using Docker Compose:**
    ```bash
    docker compose up --build -d
    ```
    This command will:
    *   Build the Docker image for the `message-board` service based on the `Dockerfile`.
    *   Install all Node.js dependencies, including Tailwind CSS and Showdown.js.
    *   Run the Tailwind CSS build process.
    *   Start the `message-board` container in detached mode (`-d`).
    *   Map port `1989` from your host to the container.
    *   Mount a local `./data` directory to `/app/data` inside the container for SQLite database persistence.

### Accessing the Application

Once the Docker containers are up and running, open your web browser and navigate to:

[http://localhost:1989](http://localhost:1989)

## Usage

### Public Messages
*   **Post a Message**: Type your message (you can use Markdown!) in the text area and click "Post Message".
*   **Edit a Message**: Click the "Edit" button next to a message. An edit box will appear pre-filled with the message's original Markdown content. Make your changes and click "Save".
*   **Delete a Message**: Click the "Delete" button next to a message. Confirm your action to remove the message.

### Private Messages
*   **Post a Private Message**:
    1. Type your message in the text area
    2. Click "Post Message"
    3. In the popup dialog, select "Private Message"
    4. Enter a KEY (any text or symbols) for your private message
    5. Click "Confirm" to send
    *Note: Private messages are not immediately visible after posting*

*   **View Private Messages**:
    1. Click the "KEY" button below the message input area
    2. A KEY input field will appear between the KEY button and Post Message button
    3. Enter the correct KEY for the private messages you want to view
    4. Click the "Send" button or press Enter
    5. Matching private messages will appear above all public messages, marked with private

*   **Hide Private Messages**:
    *   Click the "KEY" button again to hide the input field and clear the KEY
    *   Refresh the page - private messages are automatically hidden on page refresh
    *   Private messages require re-entering the KEY to view again

### User Authentication

#### Registration and Login
*   **Register a New Account**:
    1. Click the "Login" button in the top-right corner of the page
    2. In the login modal, click the "Register" button in the bottom-left corner
    3. Fill in the registration form:
        - Username (3-20 characters)
        - Password (at least 6 characters)
        - Confirm password
    4. Click "Register" to create your account
    *Note: After successful registration, you will be automatically logged in*

*   **Login to Existing Account**:
    1. Click the "Login" button in the top-right corner
    2. Enter your username and password
    3. Click "Login"
    *Note: Login status is maintained via session cookies*

*   **Logout**:
    - Click the "登出" button in the top-right corner when logged in

### Image Messages

*   **Post a Message with Image**:
    1. Type your message in the text area (optional - you can post just an image)
    2. Click the "Upload Image" button below the text area
    3. Select an image file from your device (JPEG, PNG, GIF, or WebP, max 10MB)
    4. The image preview will appear below the upload button
    5. Click "Post Message" to send
    *Note: Each message can contain either text, an image, or both*

*   **View Image Messages**:
    - Images are displayed above the text content in messages
    - Click on an image to view it in full size
    - Image messages follow the same privacy rules as text messages

*   **Remove Selected Image**:
    - Click the "Remove" button on the image preview to cancel image selection
    - This only removes the selection before posting, not already posted images

*   **Edit Image Messages**:
    - Messages containing images cannot be edited (to maintain one-image-per-message constraint)
    - To modify an image message, delete it and create a new one

#### User-Specific Features
*   **Automatic Private Message Access**: Once logged in, all your private messages are automatically displayed without needing to enter KEYs.
*   **Dual-Mode Private Messages**:
    - **Traditional Mode**: Create private messages with KEYs (works for both logged-in and anonymous users)
    - **User Mode**: When logged in, private messages are automatically associated with your account and accessible without KEYs

#### Backward Compatibility
*   Existing private messages with KEYs continue to work as before
*   Anonymous users can still create and view private messages using KEYs
*   Logged-in users can access both types of private messages:
    - Their own private messages (no KEY required)
    - KEY-protected private messages (by entering the KEY)

### API Usage with curl

You can interact with the message board API directly using `curl` commands. This is useful for testing, automation, or integration with other tools.

#### Basic Message Operations

**1. Get all public messages**
```bash
curl -s "http://localhost:1989/api/messages"
```

**2. Post a public message**
```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Your message here\"}"
```

**3. Post a private message with KEY**
```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Secret message\", \"isPrivate\": true, \"privateKey\": \"your-secret-key\"}"
```

**4. View private messages with KEY**
```bash
curl -s "http://localhost:1989/api/messages?privateKey=your-secret-key"
```

#### User Authentication API

**5. Register a new user**
```bash
curl -s -X POST "http://localhost:1989/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testuser\", \"password\": \"password123\"}"
```

**6. Login (creates a session cookie)**
```bash
curl -s -X POST "http://localhost:1989/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testuser\", \"password\": \"password123\"}" \
  -c cookies.txt
```

**7. Get current user info (with session cookie)**
```bash
curl -s "http://localhost:1989/api/auth/me" \
  -b cookies.txt
```

**8. Logout**
```bash
curl -s -X POST "http://localhost:1989/api/auth/logout" \
  -b cookies.txt
```

#### Image Upload API

**9. Upload an image**
```bash
curl -s -X POST "http://localhost:1989/api/upload" \
  -F "image=@/path/to/your/image.jpg" \
  -H "Content-Type: multipart/form-data"
```

**10. Post a message with image (two-step process)**
```bash
# Step 1: Upload the image
curl -s -X POST "http://localhost:1989/api/upload" \
  -F "image=@/path/to/your/image.jpg" \
  -H "Content-Type: multipart/form-data" \
  -o upload-response.json

# Step 2: Post message with image reference
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "$(cat <<'EOF'
{
  "content": "Message with image",
  "hasImage": true,
  "imageFilename": "$(jq -r '.filename' upload-response.json)",
  "imageMimeType": "$(jq -r '.mimeType' upload-response.json)",
  "imageSize": $(jq -r '.size' upload-response.json)
}
EOF
)"
```

**11. Post private message with image**
```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Private image message\", \"isPrivate\": true, \"privateKey\": \"secret123\", \"hasImage\": true, \"imageFilename\": \"1734267890123_abc123_image.jpg\", \"imageMimeType\": \"image/jpeg\", \"imageSize\": 102400}"
```

#### Advanced Examples

**12. Post message as logged-in user (with session cookie)**
```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Message from logged-in user\"}" \
  -b cookies.txt
```

**13. Post private message as logged-in user (auto-generates KEY)**
```bash
curl -s -X POST "http://localhost:1989/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"Private message from user\", \"isPrivate\": true}" \
  -b cookies.txt
```

**14. Get messages for logged-in user (shows user's private messages)**
```bash
curl -s "http://localhost:1989/api/messages" \
  -b cookies.txt
```

#### Response Format Examples

**Successful message post response:**
```json
{
  "id": 5,
  "content": "Your message",
  "timestamp": "2025-12-12 14:04:51",
  "is_private": 0,
  "private_key": null,
  "user_id": null,
  "has_image": 0,
  "image_filename": null,
  "image_mime_type": null,
  "image_size": null
}
```

**Image message post response:**
```json
{
  "id": 6,
  "content": "Check out this image!",
  "timestamp": "2025-12-15 15:30:45",
  "is_private": 0,
  "private_key": null,
  "user_id": null,
  "has_image": 1,
  "image_filename": "1734267890123_abc123_image.jpg",
  "image_mime_type": "image/jpeg",
  "image_size": 102400
}
```

**Image upload response:**
```json
{
  "success": true,
  "filename": "1734267890123_abc123_image.jpg",
  "originalName": "myphoto.jpg",
  "mimeType": "image/jpeg",
  "size": 102400,
  "url": "/uploads/1734267890123_abc123_image.jpg"
}
```

**Messages list response:**
```json
{
  "messages": [
    {
      "id": 1,
      "content": "Public message",
      "timestamp": "2025-12-12 14:03:29",
      "is_private": 0,
      "private_key": null,
      "user_id": null,
      "has_image": 0,
      "image_filename": null,
      "image_mime_type": null,
      "image_size": null
    },
    {
      "id": 2,
      "content": "Message with image",
      "timestamp": "2025-12-15 15:35:20",
      "is_private": 0,
      "private_key": null,
      "user_id": null,
      "has_image": 1,
      "image_filename": "1734267890123_abc123_image.jpg",
      "image_mime_type": "image/jpeg",
      "image_size": 102400
    }
  ],
  "hasPrivateMessages": false,
  "privateKeyProvided": false,
  "userId": null
}
```

#### Tips
- Use `-s` flag for silent mode (no progress meter)
- Use `-v` flag for verbose output to see request/response headers
- Save cookies with `-c cookies.txt` and reuse with `-b cookies.txt`
- For Windows PowerShell, use double quotes and escape inner quotes with backtick (`)
- For Windows CMD, use double quotes and escape inner quotes with backslash (\\)

#### Using JavaScript (Fetch API)

**1. Get all public messages**
```javascript
fetch('http://localhost:1989/api/messages')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**2. Post a public message**
```javascript
fetch('http://localhost:1989/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Your message here'
  })
})
.then(response => response.json())
.then(data => console.log('Message posted:', data))
.catch(error => console.error('Error:', error));
```

**3. Post a private message with KEY**
```javascript
fetch('http://localhost:1989/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Secret message',
    isPrivate: true,
    privateKey: 'your-secret-key'
  })
})
.then(response => response.json())
.then(data => console.log('Private message posted:', data))
.catch(error => console.error('Error:', error));
```

**4. Register a new user**
```javascript
fetch('http://localhost:1989/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log('User registered:', data))
.catch(error => console.error('Error:', error));
```

**5. Login and maintain session**
```javascript
fetch('http://localhost:1989/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for session cookies
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log('Logged in:', data))
.catch(error => console.error('Error:', error));
```

#### Using Python (requests library)

First install the requests library:
```bash
pip install requests
```

**1. Get all public messages**
```python
import requests

response = requests.get('http://localhost:1989/api/messages')
print(response.json())
```

**2. Post a public message**
```python
import requests

data = {
    'content': 'Your message here'
}
response = requests.post('http://localhost:1989/api/messages', json=data)
print('Message posted:', response.json())
```

**3. Post a private message with KEY**
```python
import requests

data = {
    'content': 'Secret message',
    'isPrivate': True,
    'privateKey': 'your-secret-key'
}
response = requests.post('http://localhost:1989/api/messages', json=data)
print('Private message posted:', response.json())
```

**4. Register a new user**
```python
import requests

data = {
    'username': 'testuser',
    'password': 'password123'
}
response = requests.post('http://localhost:1989/api/auth/register', json=data)
print('User registered:', response.json())
```

**5. Login and maintain session with cookies**
```python
import requests

# Create a session to maintain cookies
session = requests.Session()

# Login
login_data = {
    'username': 'testuser',
    'password': 'password123'
}
login_response = session.post('http://localhost:1989/api/auth/login', json=login_data)
print('Logged in:', login_response.json())

# Get messages as logged-in user
messages_response = session.get('http://localhost:1989/api/messages')
print('Messages for logged-in user:', messages_response.json())

# Post message as logged-in user
post_data = {
    'content': 'Message from logged-in user via Python'
}
post_response = session.post('http://localhost:1989/api/messages', json=post_data)
print('Message posted:', post_response.json())

# Logout
logout_response = session.post('http://localhost:1989/api/auth/logout')
print('Logged out:', logout_response.status_code)
```

**6. Using async/await with aiohttp (Python)**
```python
import aiohttp
import asyncio

async def main():
    async with aiohttp.ClientSession() as session:
        # Get messages
        async with session.get('http://localhost:1989/api/messages') as response:
            messages = await response.json()
            print('Messages:', messages)

        # Post a message
        data = {'content': 'Async message from Python'}
        async with session.post('http://localhost:1989/api/messages', json=data) as response:
            result = await response.json()
            print('Posted:', result)

# Run the async function
asyncio.run(main())
```

#### Using Node.js

**1. Get all public messages**
```javascript
const https = require('https'); // or 'http' if not using SSL

const options = {
  hostname: 'localhost',
  port: 1989,
  path: '/api/messages',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
```

**2. Post a public message (Node.js with axios)**
```javascript
const axios = require('axios');

axios.post('http://localhost:1989/api/messages', {
  content: 'Message from Node.js'
})
.then(response => {
  console.log('Message posted:', response.data);
})
.catch(error => {
  console.error('Error:', error);
});
```

### Markdown Examples

You can use standard Markdown syntax in your messages, for example:

```markdown
## Anonymous Thought 💭

This platform allows for completely **anonymous sharing** of ideas. You can use **Markdown** for rich formatting,
including `inline code` and [links](https://links).

Feel free to **post** and **edit** your messages freely!

```


## Database Migration

This project uses SQLite for its database, which stores all data in a single file named `messages.db`. This file is persisted on your host machine in the `./data/` directory, thanks to a Docker volume. Migrating your messages to another Docker device is straightforward:

1.  **On the Source Device**: Locate the `data/messages.db` file within your project directory.
2.  **Transfer the File**: Copy this `messages.db` file to your new device using your preferred method (e.g., `scp`, USB drive, cloud storage).
3.  **On the New Device**: Place the copied `messages.db` file into the `data/` directory of your project on the new device. Ensure it replaces any existing `messages.db` file if you want to use the old data.
4.  **Start the Application**: Run `docker compose up -d` on the new device. Your application will automatically use the migrated database, and all your messages will be available.

## Project Structure

*   `./data/`: Contains the `messages.db` SQLite database file (persisted via Docker volume).
    *   `data/uploads/`: Directory for uploaded image files (created automatically).
*   `./public/`: Static assets (CSS, client-side JS).
    *   `public/js/main.js`: Main client-side script for dynamic interactions (modified to support private messages).
    *   `public/style.css`: Compiled Tailwind CSS output.
*   `./src/`: Server-side source code and input CSS.
    *   `src/index.js`: Express.js backend server (modified to support private messages API).
    *   `src/input.css`: Tailwind CSS input file.
*   `./views/`: EJS template files.
    *   `views/index.ejs`: Main application layout (modified to add KEY button, input field, and modal dialog).
*   `Dockerfile`: Defines the Docker image build process.
*   `docker-compose.yml`: Defines the services, networks, and volumes for Docker Compose.
*   `package.json`: Node.js project metadata and dependencies.
*   `tailwind.config.js`: Tailwind CSS configuration.
*   `.gitignore`: Specifies intentionally untracked files to ignore.

### Key Modifications for Features

#### Private Messages Feature
The following files were modified to implement the private messages feature:

1. **`src/index.js`**:
   - Added `is_private` and `private_key` columns to the `messages` table
   - Modified `POST /api/messages` to accept `isPrivate` and `privateKey` parameters
   - Modified `GET /api/messages` to support `privateKey` query parameter
   - Updated root route to only show public messages

2. **`views/index.ejs`**:
   - Added dark "KEY" button below message input
   - Added KEY input field and "Send" button (hidden by default)
   - Added modal dialog for message type selection (Public/Private)
   - Added error message display area

3. **`public/js/main.js`**:
   - Added event listeners for KEY button, Send button, and modal dialog
   - Modified message posting flow to show type selection dialog
   - Updated message loading to filter by private KEY
   - Added error handling for invalid KEY input

#### Image Upload Feature
The following modifications were made to implement image upload functionality:

1. **`package.json`**:
   - Added new dependency: `multer` for handling file uploads

2. **`src/index.js`**:
   - Added `has_image`, `image_filename`, `image_mime_type`, `image_size` columns to the `messages` table
   - Added Multer configuration for image uploads (10MB limit, image files only)
   - Added `/api/upload` endpoint for image uploads
   - Added permission middleware for image access (follows same rules as messages)
   - Modified `POST /api/messages` to accept image parameters
   - Enhanced `DELETE /api/messages/:id` to delete associated image files
   - Added orphaned image cleanup function (runs hourly)

3. **`views/index.ejs`**:
   - Added image upload button below message input area
   - Added hidden file input for image selection
   - Added image preview container with remove button
   - Added image status display

4. **`public/js/main.js`**:
   - Added image upload state management (`selectedImage` variable)
   - Added `uploadImage()` function for uploading images to server
   - Added image selection and preview functionality
   - Modified `renderMessage()` to display images in messages
   - Added click-to-view functionality for images
   - Modified message posting to handle images (two-step process: upload then post)
   - Added restriction: messages with images cannot be edited

#### User Authentication Feature
The following modifications were made to implement user authentication:

1. **`package.json`**:
   - Added new dependencies: `bcrypt`, `express-session`, `connect-sqlite3`

2. **`src/index.js`**:
   - Added `users` table with `id`, `username`, `password_hash`, `created_at` columns
   - Added `user_id` column to `messages` table for message ownership
   - Added session middleware with SQLite session store
   - Added password utility functions (`hashPassword`, `comparePassword`)
   - Added authentication APIs:
     - `POST /api/auth/register` - User registration
     - `POST /api/auth/login` - User login
     - `POST /api/auth/logout` - User logout
     - `GET /api/auth/me` - Get current user info
   - Modified message APIs to support user authentication:
     - `GET /api/messages` - Returns public messages + user's private messages when logged in
     - `POST /api/messages` - Associates messages with user_id when logged in
     - `PUT /api/messages/:id` - Added permission check (users can only edit their own messages)
     - `DELETE /api/messages/:id` - Added permission check (users can only delete their own messages)
   - Added authentication middleware (`requireAuth`, `getCurrentUser`)

3. **`views/index.ejs`**:
   - Added user area in header with login button (top-right corner)
   - Added login modal with registration button in bottom-left corner
   - Added registration modal
   - Added conditional rendering based on user login status
   - Added user view with username display and logout button

4. **`public/js/main.js`**:
   - Added authentication-related DOM elements
   - Added authentication helper functions (`updateUIForUser`, `checkAuthStatus`, `showError`, `clearError`)
   - Modified `fetchAndRenderMessages` to handle user authentication
   - Added event handlers for login, registration, and logout
   - Modified message posting logic for logged-in users
   - Added registration flow from login modal

## Development

If you make changes to the code, especially to `package.json`, `src/index.js`, `public/js/main.js`, `src/input.css`, `tailwind.config.js`, or the `Dockerfile`, you will need to rebuild the Docker image to apply these changes:

```bash
docker compose up --build -d
```

This ensures that any new dependencies are installed, CSS is recompiled, and your latest code is included in the running container.

### Database Migration

#### For Private Messages Feature
When upgrading from a previous version without private messages support, the database will be automatically migrated to include the new `is_private` and `private_key` columns. All existing messages will be marked as public (`is_private = 0`).

#### For User Authentication Feature
When upgrading to the version with user authentication, the database will be automatically migrated to include:
- `users` table for storing user accounts
- `user_id` column in `messages` table for message ownership
- `sessions` table for session storage (managed by `connect-sqlite3`)

All existing messages will have `user_id` set to `NULL` (anonymous messages).

#### For Image Upload Feature
When upgrading to the version with image upload support, the database will be automatically migrated to include:
- `has_image` column in `messages` table (default 0)
- `image_filename` column in `messages` table (default NULL)
- `image_mime_type` column in `messages` table (default NULL)
- `image_size` column in `messages` table (default NULL)

The application will also create the `./data/uploads/` directory for storing uploaded images.

### Clearing the Database

If you need to clear all messages and start fresh, you can delete the database files. The application uses two SQLite database files stored in the `./data/` directory:

1. **`messages.db`** - Stores all messages (public and private)
2. **`sessions.db`** - Stores user session data

Additionally, uploaded image files are stored in the `./data/uploads/` directory.

#### Method 1: Stop containers and delete files (Recommended)
```bash
# Stop the running containers
docker compose down

# Delete the database files and uploaded images
rm -f data/messages.db data/sessions.db
rm -rf data/uploads/*

# Restart the containers (new databases will be created automatically)
docker compose up -d
```

#### Method 2: Delete files while containers are running
```bash
# Delete the database files and uploaded images
rm -f data/messages.db data/sessions.db
rm -rf data/uploads/*

# Restart the application container to recreate databases
docker compose restart message-board
```

#### Method 3: Using a one-liner command
```bash
docker compose down && rm -f data/messages.db data/sessions.db && rm -rf data/uploads/* && docker compose up -d
```

**Note**:
- Deleting `sessions.db` will log out all users
- Deleting `messages.db` will remove ALL messages permanently
- Deleting files in `data/uploads/` will remove ALL uploaded images
- The application will automatically create new empty databases when restarted
- User accounts are stored in `messages.db`, so deleting it will also remove all user accounts

## License

This project is licensed under the [WTFPL](LICENSE) - see the LICENSE file for details.

---
Built by Love.
