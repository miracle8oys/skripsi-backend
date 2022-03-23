const _ = require('lodash');
// const criteria = require('./criteria');

const criteria = {
    stock: 0.35,
    exp: 0.35,
    profit: 0.3
  };


function getMinMax(value) {
  const expMin = _.minBy(value, 'exp');
  const profitMax = _.maxBy(value, 'profit');
  const stockMax = _.maxBy(value, 'stock');
  return {
    exp: expMin.exp,
    profit: profitMax.profit,
    stock: stockMax.stock
  }
}

function normalize(matrix, maxmin) {
  matrix.exp = maxmin.exp / matrix.exp;
  matrix.stock = matrix.stock / maxmin.stock;
  matrix.profit = matrix.profit / maxmin.profit;


  return matrix;
}

function countRank(nilai) {
  const total = (nilai.stock * criteria.stock) + (nilai.exp * criteria.exp) + (nilai.profit * criteria.profit); 
  const result = {
    name: nilai.name,
    id: nilai.id,
    total: total
  }
  return result;
}

const getRecomendation = async (data) => {
  console.log(`Executing SAW...`);
    const rangeValue = getMinMax(data);
    const normalizeValue = _.map(data, nilai => normalize(nilai, rangeValue));
    const weightRank = _.map(normalizeValue, nilai => countRank(nilai));
    const result = weightRank.sort((a, b) => {
        return a.total - b.total
    });
    //console.log(result.reverse());
    const descResult = result.reverse()

    return descResult
};


module.exports = getRecomendation;


// Controller.getRecomendation = (req, res) => {
//   const post = req.body;
//   const getNilaiBobot = post;
//   const getMaxMin = getMinMax(getNilaiBobot);
//   const normalisasiNilai = _.map(getNilaiBobot, nilai => normalisasi(nilai, getMaxMin));
//   const hitungBobotPeringkat = _.map(normalisasiNilai, nilai => hitungPeringkat(nilai));
//   res.json(hitungBobotPeringkat)
// };



// module.exports = Controller;