// it's dynamically loaded because it allows us to continue running if there is a runtime error
try {
    import(/* webpackChunkName: "problem1" */ './2019/6a');
    import(/* webpackChunkName: "problem1" */ './2019/6b');
} catch (e) {
    console.log(e);
}
