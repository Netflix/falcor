module.exports = function(onNode, options, link) {
    
    options.shorted = false;
    
    var depth = 0;
    var height = link.length;
    
    while(depth < height) {
        if(onNode(options, link, depth, link[depth], false) === false) {
            options.shorted = true;
            break;
        }
        depth += 1;
    }
    
    options.depth = depth;
    
    return options;
}