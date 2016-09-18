#FROM gaiaadm/nodejs:4.4.3
FROM node:4.4-slim

# Set the working directory
WORKDIR /src

# Bundle app source
COPY . /src

# setup.sh script is temporary workaround until Docker adds support for passing ENV variables
# to docker build command to allow setting up proxy
ADD setup.sh /tmp/setup.sh
RUN chmod +x /tmp/setup.sh
RUN sync
RUN /tmp/setup.sh /src

EXPOSE 3000 
CMD ["npm", "start"]
