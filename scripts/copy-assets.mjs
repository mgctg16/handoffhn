import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/src", { recursive: true });
await cp("src/assets", "dist/src/assets", { recursive: true });
await cp("src/a30new.svg", "dist/src/a30new.svg");
