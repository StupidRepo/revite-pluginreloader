# Revite PluginReloader
A useful tool for devs to automatically reload a plugin when it changes!

## Usage
After the plugin is loaded, run this in the console of Revite:
```js
hot();
```

This will open a folder picker, where you will then choose a folder containing the following files:
- `manifest.json` - Your plugin manifest (see below for format)
- `main.js` - Your plugin code

> [!IMPORTANT]
> `manifest.json` needs to have all [the basic manifest fields][m], but **do *NOT* include the `entrypoint` field**.

> [!TIP]
> You could also use a `.ts` file, providing you also set up a way to compile it to a `main.js` file via use of `tsc` or something else!

## Building
Clone the repo, and then run `yarn install` and `yarn build` to build the plugin. Then, copy the contents of `target/plugin.json` and run the following in the console of Revite:
```js
state.plugins.add(/* Paste the contents of plugin.json here */);
```
It should then look something like this:
```js
state.plugins.add({format: 1, version: "1.0.0", ... });
```

[m]: https://developers.revolt.chat/developers/legacy-plugin-api.html?search=#plugin-manifest