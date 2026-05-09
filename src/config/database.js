{
  "name": "sale-suit-be",
  "version": "1.0.0",
  "description": "Backend API for Sale Suit Business Marketplace",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "keywords": [
    "sale-suit",
    "marketplace",
    "api"
  ],
  "author": "Samisuits",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "pg": "^8.13.1",
    "sequelize": "^6.37.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
