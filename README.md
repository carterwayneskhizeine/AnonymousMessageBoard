# Anonymous Message Board

A simple, anonymous message board web application built with Node.js, Express, EJS, and SQLite3, containerized using Docker and Docker Compose. This application features a pure dark mode interface, support for Markdown content, and allows users to post, edit, and delete messages anonymously.

## Features

*   **Anonymous Posting**: Share your thoughts without revealing your identity.
*   **Pure Dark Mode**: A sleek, modern dark theme is enforced throughout the application. No theme switching needed.
*   **SQLite3 Database**: Lightweight and efficient data storage.
*   **Data Persistence**: All messages are stored persistently using Docker volumes, ensuring your data is safe across container restarts.
*   **Markdown Support**: Write messages using Markdown syntax (headings, bold, italics, lists, code blocks, etc.), which will be rendered beautifully.
*   **Edit & Delete Messages**: Users can edit their previously posted messages or delete them.
*   **Responsive Design**: The application is designed to be accessible and usable across various devices.
*   **Dockerized Deployment**: Easy setup and deployment using Docker and Docker Compose.

## Tech Stack

*   **Backend**: Node.js (Latest Alpine) with Express.js
*   **Database**: SQLite3
*   **Templating**: EJS
*   **Styling**: Tailwind CSS (configured for `darkMode: 'class'`)
*   **Client-side Logic**: Native JavaScript (Fetch API)
*   **Markdown Rendering**: Showdown.js
*   **Containerization**: Docker, Docker Compose

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

You need to have Docker and Docker Compose installed on your system.

*   [Install Docker](https://docs.docker.com/get-docker/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/carterwayneskhizeine/AnonymousMessageBoard.git
    cd anonymous-message-board
    ```

2.  **Build and run the application using Docker Compose:**
    ```bash
    docker-compose up --build -d
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

*   **Post a Message**: Type your message (you can use Markdown!) in the text area and click "Post Message".
*   **Edit a Message**: Click the blue "Edit" button next to a message. An edit box will appear pre-filled with the message's original Markdown content. Make your changes and click "Save".
*   **Delete a Message**: Click the red "Delete" button next to a message. Confirm your action to remove the message.

### Markdown Examples

You can use standard Markdown syntax in your messages, for example:

```markdown
# My Awesome Message

Hello **world**! This is a *great* message.

- Item One
- Item Two
  - Sub-item

```javascript
// This is a code block
console.log("Hello Markdown!");
```

> This is a blockquote.

```

## Database Migration

This project uses SQLite for its database, which stores all data in a single file named `messages.db`. This file is persisted on your host machine in the `./data/` directory, thanks to a Docker volume. Migrating your messages to another Docker device is straightforward:

1.  **On the Source Device**: Locate the `data/messages.db` file within your project directory.
2.  **Transfer the File**: Copy this `messages.db` file to your new device using your preferred method (e.g., `scp`, USB drive, cloud storage).
3.  **On the New Device**: Place the copied `messages.db` file into the `data/` directory of your project on the new device. Ensure it replaces any existing `messages.db` file if you want to use the old data.
4.  **Start the Application**: Run `docker-compose up -d` on the new device. Your application will automatically use the migrated database, and all your messages will be available.

## Project Structure

*   `./data/`: Contains the `messages.db` SQLite database file (persisted via Docker volume).
*   `./public/`: Static assets (CSS, client-side JS).
    *   `public/js/main.js`: Main client-side script for dynamic interactions.
    *   `public/style.css`: Compiled Tailwind CSS output.
*   `./src/`: Server-side source code and input CSS.
    *   `src/index.js`: Express.js backend server.
    *   `src/input.css`: Tailwind CSS input file.
*   `./views/`: EJS template files.
    *   `views/index.ejs`: Main application layout.
*   `Dockerfile`: Defines the Docker image build process.
*   `docker-compose.yml`: Defines the services, networks, and volumes for Docker Compose.
*   `package.json`: Node.js project metadata and dependencies.
*   `tailwind.config.js`: Tailwind CSS configuration.
*   `.gitignore`: Specifies intentionally untracked files to ignore.

## Development

If you make changes to the code, especially to `package.json`, `src/index.js`, `public/js/main.js`, `src/input.css`, `tailwind.config.js`, or the `Dockerfile`, you will need to rebuild the Docker image to apply these changes:

```bash
docker-compose up --build -d
```

This ensures that any new dependencies are installed, CSS is recompiled, and your latest code is included in the running container.

---
Built by Gemini CLI.
