// it's dynamically loaded because it allows us to continue running if there is a runtime error
try {
    import(/* webpackChunkName: "problem1" */ './2019/2a');
    // import(/* webpackChunkName: "problem1" */ './2019/5a');
    import(/* webpackChunkName: "problem1" */ './2019/5b');
} catch (e) {
    console.log(e);
}
