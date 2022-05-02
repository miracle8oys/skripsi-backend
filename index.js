const express = require("express");
const cors = require("cors");
const parse = require('csv-parse').parse;
const os = require('os');
const multer = require('multer');
const fs = require('fs');
const Port = 8000;

const association = require("./services/fpgrowth");
const getRecomendation = require("./services/saw");
const combineRecomendation = require("./services/combineRecomendation");

const app = express();
const upload = multer({dest: os.tmpdir()})

app.use(cors('*'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.post('/api/main', upload.single('file'), async (req, res) => {


    const file = req.file;
    const {dataProducts, minSupport, productAmount, stockPercentage, expPercentage, profitPercentage} = req.body
    const parseData = JSON.parse(dataProducts);

    
    const parseProductAmount = JSON.parse(productAmount);
    const parseStockPercentage = JSON.parse(stockPercentage);
    const parseExpPercentage = JSON.parse(expPercentage);
    const parseProfitPercentage = JSON.parse(profitPercentage);
    const parseMinSupport = JSON.parse(minSupport);

    const transactions = fs.readFileSync(file.path)
        .toString()
        .split('\n')
        .map(e => e.trim())
        .map(e => e.split(',').map(e => e.trim()));

    const itemset = await association(transactions, parseMinSupport);
    const products = await getRecomendation(parseData, parseStockPercentage/100, parseExpPercentage/100, parseProfitPercentage/100);
    // slice product to get the 3 best
    const bestProduct = products.slice(0, parseProductAmount);
    const result = await combineRecomendation(itemset, bestProduct);
    res.status(201).json({
        status: "OK",
        data: {
            bestProduct,
            result,
            itemset
        }
    })
})

app.post('/api/csv', upload.fields([{name : 'product', maxCount: 1}, {name: 'transaction', maxCount: 1}]), async (req, res) => {

    const dataProducts = req.files.product;
    const transaction = req.files.transaction;

    const {minSupport, productAmount, stockPercentage, expPercentage, profitPercentage} = req.body;

    const parseProductAmount = JSON.parse(productAmount);
    const parseStockPercentage = JSON.parse(stockPercentage);
    const parseExpPercentage = JSON.parse(expPercentage);
    const parseProfitPercentage = JSON.parse(profitPercentage);
    const parseMinSupport = JSON.parse(minSupport);

    const parseProduct = fs.readFileSync(dataProducts[0].path).toString().split('\n').map(e => e.trim());

    // convrt to array of object
    let resProduct = [];
    const headers = parseProduct[0].split(',');
    for(let i = 1; i < parseProduct.length; i++) {
    const data = parseProduct[i].split(',');
    let obj = {};
    for(let j = 0; j < data.length; j++) {
        if (j > 1) {
            obj[headers[j].trim()] = parseInt(data[j].trim());
        } else {
            obj[headers[j].trim()] = data[j].trim();
        }
    }
    resProduct.push(obj);
}
    const products = await getRecomendation(resProduct, parseStockPercentage/100, parseExpPercentage/100, parseProfitPercentage/100);
    // slice product to get the 3 best
    const bestProduct = products.slice(0, parseProductAmount);

    const transactionsData = fs.readFileSync(transaction[0].path)
        .toString()
        .split('\n')
        .map(e => e.trim())
        .map(e => e.split(',').map(e => e.trim()));

    const itemset = await association(transactionsData, parseMinSupport);
    const sortedItemset = itemset.sort((a, b) => {
        return b.confidence - a.confidence
    })

    const result = await combineRecomendation(itemset, bestProduct);
    res.status(201).json({
        status: "OK",
        data: {
            bestProduct,
            result,
            itemset: sortedItemset
        }
    })
})

app.listen(process.env.PORT || Port, () => console.log('Listening on port 8000'));