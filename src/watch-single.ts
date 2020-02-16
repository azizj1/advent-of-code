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
run(); // run a single file
