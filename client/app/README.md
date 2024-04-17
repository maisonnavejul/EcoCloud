# app

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


## Particular configuration

Since the files downloaded are served over a http connexion, downloading multiple files 
at the same time might be a trouble dur to browser restriction. In order to solve this problem you can try to set some parameters for your browser:

- **Chrome**: Go to `chrome://flags/#allow-insecure-localhost` and set the parameter to enabled
- **Mozilla Firefox**: Navigate to `about:config` in the address bar, search for `security.fileuri.strict_origin_policy` and set it to false.
