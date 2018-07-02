# talk-to-books-api
[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/twistedogic/talk-to-books-api)

# API Wrapper around Google's talk to books with puppeteer

## Requirements
Chromium

## Getting Started

### Install dependencies.
`npm install`

### Start server (If you can run Chromium)
`npm start`

(service port: 3000)

### Start server using docker (If you can not run Chromium and installed docker)
`docker run -d --name api -p 8080:3000 talk-to-books`

### Test on your browser
Input url `http://localhost:{port}/?q=who got the ring`

## API

| Name    | Required | Value               | Description            |
|---------|:--------:|:-------------------:|------------------------|
|`q`      | yes      |                     |Query                   |
|`page`   |          |number               |Show more pages         |

