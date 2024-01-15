# Step 1: Use the official Node.js 18 image as the base image
FROM node:18-alpine

# Step 2: Set the working directory inside the image
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the source code
COPY . .

# Step 6: Build the Next.js application
RUN npm run build

# Step 7: Expose the port Next.js runs on
EXPOSE 3000

# Step 8: Define the command to run your app using CMD
CMD [ "npm", "start" ]
