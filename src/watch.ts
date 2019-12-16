// it's dynamically loaded because it allows us to continue running if there is a runtime error
try {
    import(/* webpackChunkName: "problem1" */ './2019/10b');
    // import(/* webpackChunkName: "problem1" */ './2019/5a');
} catch (e) {
    console.log(e);
}
