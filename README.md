# Facemash Clone

This project is a clone of the original Facemash website, allowing users to compare images and vote on their preferences. The application is built using Node.js and Express, with a simple front-end interface.

## Project Structure

```
facemash-clone
├── public
│   ├── index.html        # Main HTML document
│   └── styles.css       # CSS styles for the website
├── src
│   ├── app.js           # Entry point of the application
│   ├── controllers
│   │   └── facemashController.js  # Logic for handling requests
│   ├── models
│   │   └── user.js      # User data model
│   ├── routes
│   │   └── facemashRoutes.js  # Route definitions
│   └── utils
│       └── helpers.js   # Utility functions
├── package.json         # NPM configuration file
├── .gitignore           # Files to ignore in Git
└── README.md            # Project documentation
```

## Features

- Users can view images and vote on their preferences.
- The application randomly selects images for comparison.
- Simple and responsive design.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd facemash-clone
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and go to `http://localhost:3000` to view the application.

## Usage Guidelines

- Users can vote on images by clicking on their preferred choice.
- The application will display the results based on user votes.

## Contributing

Feel free to submit issues or pull requests to improve the project!