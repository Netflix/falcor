module.exports = function(pv1, pv2) {
    pv1 = JSON.stringify(pv1);
    pv2 = JSON.stringify(pv2);
    if(pv1 < pv2) {
        return 1;
    } else if(pv1 > pv2) {
        return -1;
    } else {
        return 0;
    }
}
