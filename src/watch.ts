import { promises as fs } from 'fs';

// it's dynamically loaded because it allows us to continue running if there is a runtime error, i.e., it allows me
// put the import inside the try/catch, which was important before I did the p2.run(). Before, all the commands were
// within the file and not a function, so just importing it would run the code.
export async function run() {
    try {
        const p = await import(/* webpackChunkName: "problem1" */ './2018/8');
        p.run();
    } catch (e) {
        console.error(e);
    }
}
// run(); // run a single file

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
