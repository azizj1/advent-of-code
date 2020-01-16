// it's dynamically loaded because it allows us to continue running if there is a runtime error, i.e., it allows me
// put the import inside the try/catch, which was important before I did the p2.run(). Before, all the commands were
// within the file and not a function, so just importing it would run the code.
async function run() {
    try {
        // const p1 = await import(/* webpackChunkName: "problem1" */ './2019/22');
        const p2 = await import(/* webpackChunkName: "problem1" */ './2019/24');
        // p1.run();
        p2.run();
        // p2.test();
    } catch (e) {
        console.error(e);
    }
}
run();
