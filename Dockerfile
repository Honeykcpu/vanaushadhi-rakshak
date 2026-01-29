# Step 1: Use Node 20 for Expo compatibility
FROM node:20

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package.json files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the project files
COPY . .

# Step 6: Install Expo CLI globally
RUN npm install -g expo-cli

# Step 7: Expose ports for phone and web
EXPOSE 19006
EXPOSE 8081

# Step 8: Start the application with tunnel (phone + web)
CMD ["npx", "expo", "start", "--tunnel"]
