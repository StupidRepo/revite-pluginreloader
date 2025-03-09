interface Manifest {
    namespace: string;
    id: string;

    entrypoint: string | null;
}

interface PluginAPI {
    /**
     * Add a plugin
     * @param plugin Plugin Manifest
     */
    add(plugin: Manifest);

    /**
     * Remove a plugin
     * @param namespace Plugin Namespace
     * @param id Plugin Id
     */
    remove(namespace: string, id: string);

    /**
     * Load a plugin
     * @param namespace Plugin Namespace
     * @param id Plugin Id
     */
    load(namespace: string, id: string);

    /**
     * Unload a plugin
     * @param namespace Plugin Namespace
     * @param id Plugin Id
     */
    unload(namespace: string, id: string);

    /**
     * Reset everything
     */
    reset();
}

async function watchAndExecuteScript(dirHandle: FileSystemDirectoryHandle) {
    const pluginAPI: PluginAPI = (window as any).state.plugins;

    try {
        const manifestHandle = await dirHandle.getFileHandle("manifest.json");
        const scriptHandle = await dirHandle.getFileHandle("main.js");
        let lastModified = (await scriptHandle.getFile()).lastModified;

        const manifestFile = await manifestHandle.getFile();
        const manifest: Manifest = JSON.parse(await manifestFile.text());

        manifest.entrypoint = await (await scriptHandle.getFile()).text();
        pluginAPI.add(manifest);

        console.log("Loaded plugin:", manifest.namespace, "/", manifest.id);

        async function reloadScript() {
            const scriptFile = await scriptHandle.getFile();
            const newModified = scriptFile.lastModified;
            if (newModified !== lastModified) {
                lastModified = newModified;

                // Update the entrypoint and add the plugin again
                manifest.entrypoint = await scriptFile.text();

                pluginAPI.add(manifest);
            }
        }

        // Poll for changes every 2 seconds
        setInterval(reloadScript, 2000);
        console.log("Watching for updates to main.js...");
    } catch (err) {
        console.error("Failed to watch plugin:", err);
    }
}

() => {
    // @ts-ignore
    if(!window.hot) {
        // @ts-ignore
        window.hot = async () => {
            try {
                // @ts-ignore
                const dirHandle = await window.showDirectoryPicker();

                console.log("Selected folder:", dirHandle.name);

                // Watch for plugin changes.
                await watchAndExecuteScript(dirHandle);
            } catch (err) {
                console.error("Error loading plugin:", err);
            }
        }
    }

    return ({
        onUnload: () => {
            console.log('PluginReloader unloaded!');
            window.location.reload();
        }
    });
};