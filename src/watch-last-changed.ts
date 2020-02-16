import { promises as fs } from 'fs';

async function getFiles(dir: string) {
    return (await fs.readdir(`src/${dir}`, {withFileTypes: true }))
        .filter(f => f.isFile && f.name.slice(-3) === '.ts')
        .map(f => `${f.name}`);
}

async function getLatestFile(dir: string, files: string[]) {
    const times = await Promise.all(files.map(f => fs.stat(`src/${dir}/${f}`)));
    const filesWithTime = files.map((f, i) => ({file: f, time: times[i].mtime.getTime()}));
    return filesWithTime.reduce((max, c) => c.time > max.time ? c : max, filesWithTime[0]).file;
}

export async function runLastChanged() {
    const dir = '2018';
    const file = await getLatestFile(dir, await getFiles(dir));
    const sanitized = file.replace(/(src)|(\.ts)/g, '');
    // dir is hard-coded again below because without, dynamic improt will build every file that ends with *.ts
    // with it being hard-coded, it'll only build files that satisfy ./2018/*.ts
    try {
        const p = await import(/* webpackChunkName: "customProblem" */`./2018/${sanitized}.ts`);
        p.run();
    } catch (e) {
        console.log(e);
    }
}

runLastChanged();
