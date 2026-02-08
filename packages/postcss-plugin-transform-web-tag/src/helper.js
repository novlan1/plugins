const { GLOBAL_CLASS } = require('./config');


function getRepeatObj(list, tagMap) {
  const obj = list.reduce((acc, item) => {
    const innerList = item.split(/\s+/).map(item => item.trim());

    const lastTagOrClass = innerList[innerList.length - 1];
    const firstTagOrClass = innerList.length > -1 ? innerList[0] : GLOBAL_CLASS;

    let exist = acc[firstTagOrClass];

    if (!exist) {
      exist = [lastTagOrClass];
    } else if (!exist.includes(lastTagOrClass)) {
      exist.push(lastTagOrClass);
    }

    return {
      ...acc,
      [firstTagOrClass]: exist,
    };
  }, {});


  const repeated = {};

  Object.keys(obj).forEach((firstTagOrClass) => {
    const list = obj[firstTagOrClass].filter(item => tagMap[item]);

    const turnedList = list.map(item => tagMap[item]);
    const turnedSet = Array.from(new Set(turnedList));

    if (turnedSet.length !== list.length) {
      repeated[firstTagOrClass] = obj[firstTagOrClass];
    }
  });

  return repeated;
}


module.exports = {
  getRepeatObj,
};
