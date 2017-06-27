const runStuff = ()=>{
    let source = '';


    loadOtherJS(data=>{
        source=data;
        console.log(source.length);
        let a = new StaticAnalyzer(source);
        let t = Date.now(); a.analyzeComments(); alert(Date.now() - t);
    }, true);

};

setTimeout(runStuff, 2000);
