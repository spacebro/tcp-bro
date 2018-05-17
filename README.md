# TCP Bro

A simple spacebro to TCP message gateway

## ❓Why ?

Sometime you can't use spacebro and you need to communicate through more simple message.
This project aims to ease communication between spacebro and already existing project running on simple TCP layer.

## 🌍 Installation

`npm install` or `yarn`

## ⚙ Configuration

`cp settings/settings.default.json settings/settings.json`

Then change the `tcp-server` configuration:

```
{
  "service":{
    "tcp-server":{
      "port": 8888,
      "host": "127.0.0.1"
    }
  }
}
```

## 👋 Usage

`npm start` or `yarn start`

## 📦 Dependencies

- json-socket
- spacebro-client
- standard-settings

## 🕳 Troubleshooting

All the help you can provide to avoid falling in a trap or a black hole.

## ❤️ Contribute

Explain how to contribute to the project