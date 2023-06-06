const request = async aaa => {
    setTimeout(() => {
        console.log("timeout log");
    }, 5000);
}

const reqPromise = new Promise(res => {
    setTimeout(() => {
        console.log("timeout log");
        res("resolve is done!");
    }, 5000);
});

(async function test() {
    console.log("before timeout print");
    // request().then(() => {
    //     console.log("promise log")
    // })
    reqPromise.then(() => {
        console.log("promise log")
    })

    console.log("after timeout print");
})()