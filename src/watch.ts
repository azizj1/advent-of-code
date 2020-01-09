// it's dynamically loaded because it allows us to continue running if there is a runtime error
async function run() {
    try {
        // const p1 = await import(/* webpackChunkName: "problem1" */ './2019/18');
        const p2 = await import(/* webpackChunkName: "problem1" */ './2019/19');
        // p1.run();
        p2.run();
    } catch (e) {
        console.error(e);
    }
}
run();
