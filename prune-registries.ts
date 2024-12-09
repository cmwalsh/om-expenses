import { walk } from "https://deno.land/std@0.170.0/fs/walk.ts";

interface LockFile {
  npm: {
    [nameAtVersion: string]: {
      integrity: string;
    };
  };
}

interface RegistryFile {
  name: string;
  versions: {
    [version: string]: {
      version: string;
      //...
    };
  };
}

async function main() {
  const base = Deno.env.get("HOME")! + "/.cache/deno";

  const lock: LockFile = JSON.parse(Deno.readTextFileSync("deno.lock"));

  const lockVersions = Object.keys(lock.npm)
    .flatMap((k) => k.split("_"))
    .map((s) => ({ name: s.substring(0, s.lastIndexOf("@")), version: s.substring(s.lastIndexOf("@") + 1) }));

  const registriesDir = base + "/npm/registry.npmjs.org/";

  const registriesPaths = [];
  for await (const walkEntry of walk(registriesDir)) {
    if (walkEntry.name === "registry.json") {
      registriesPaths.push(walkEntry.path);
    }
  }

  for (const registryPath of registriesPaths) {
    const registry: RegistryFile = JSON.parse(Deno.readTextFileSync(registryPath));
    const versionsUsed = lockVersions.filter((v) => v.name === registry.name).map((v) => v.version);

    for (const version in registry.versions) {
      if (!versionsUsed.includes(version)) {
        console.log("Removing version", registry.name, version);
        delete registry.versions[version];
      }
    }

    Deno.writeTextFileSync(registryPath, JSON.stringify(sortObjectKeys(registry)));
  }

  // const remoteDir = base + "/remote/https/";

  // for await (const walkEntry of walk(remoteDir)) {
  //   const type = walkEntry.isSymlink ? "symlink" : walkEntry.isFile ? "file" : "directory";

  //   if (type === "file") {
  //     let src = Deno.readTextFileSync(walkEntry.path);
  //     src = src.replace(/\/\/ denoCacheMetadata.*/, "");
  //     console.log("Normalising", walkEntry.path);
  //     Deno.writeTextFileSync(walkEntry.path, src);
  //   }
  // }

  const magicFiles = [
    "latest.txt",
    "dep_analysis_cache_v2",
    "dep_analysis_cache_v2-shm",
    "dep_analysis_cache_v2-wal",
    "node_analysis_cache_v2",
    "node_analysis_cache_v2-shm",
    "node_analysis_cache_v2-wal",
    "v8_code_cache_v2",
    "v8_code_cache_v2-shm",
    "v8_code_cache_v2-wal",
    "check_cache_v2-shm",
    "check_cache_v2-wal",
    "fast_check_cache_v2-shm",
    "fast_check_cache_v2-wal",
  ];

  for await (const walkEntry of walk(base)) {
    if (magicFiles.includes(walkEntry.name)) {
      console.log("Deleting", walkEntry.path);
      Deno.removeSync(walkEntry.path);
    }
  }
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (obj !== null && typeof obj === "object") {
    const sortedObj: Record<string, any> = {};
    const keys = Object.keys(obj).sort(); // Sort keys alphabetically
    for (const key of keys) {
      sortedObj[key] = sortObjectKeys(obj[key]);
    }
    return sortedObj;
  }
  return obj; // Return primitive values as-is
}

main();
