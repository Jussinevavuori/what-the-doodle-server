"use strict";
function difference(setA, setB) {
    var _difference = new Set(setA);
    setB.forEach(function (elem) { return _difference.delete(elem); });
    return _difference;
}
