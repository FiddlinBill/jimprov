FROM node:9.8.0-alpine

# Don't run as root user
ENV user app
RUN addgroup -S $user && adduser -S -g $user $user

# Create app directory
RUN mkdir -p /$user/src/www
WORKDIR /$user/src/www

# Copy application
COPY . /$user/src/www/

# Install dependencies
RUN npm install \
npm install -g nodemon

RUN chown -R $user:$user /$user/src/www/
USER $user

EXPOSE 8000
CMD ["node", "app/server/index.js"]
