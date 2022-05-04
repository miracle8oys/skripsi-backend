const express = require("express");
const cors = require("cors");
const os = require('os');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./model/user');
const Result = require('./model/result');
const Port = 8000;

const association = require("./services/fpgrowth");
const getRecomendation = require("./services/saw");
const combineRecomendation = require("./services/combineRecomendation");
const { where } = require("./model/user");

const app = express();
const upload = multer({dest: os.tmpdir()})

app.use(cors('*'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://miracle8oys:mrc201@cluster0.8ocp4.mongodb.net/bundlingRecomendations?retryWrites=true&w=majority')
    .then(() => console.log("database connected"))
    .catch(() => console.log('failed to connect database'));

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

app.post('/register', async (req, res) => {
    const {username, password, company} = req.body;
    const newUser = new User({
        user_id: mongoose.Types.ObjectId(),
        username: username,
        password: password,
        company: company,
        date: new Date()
    })

    newUser.save().then(result => {
        res.status(201).json({
            status: "OK",
            data: result
        })
    }).catch(err => {
        res.status(500).json({
            status: "OK",
            data: err
        })
    })

});

app.post('/login', async (req, res) => {

    const {username, password} = req.body;

    const user = await User.findOne({
        username: username
    })

    if (!user) {
        res.status(403).json({
            status: "OK",
            message: "Username not found",
        })
    }

    if (user.password === password) {
        
        res.status(201).json({
            status: "OK",
            message: "Login Success",
            data: user
        })
    } else {
        res.status(403).json({
            status: "OK",
            message: "Forbiden access",
        })
    }

})

app.post('/save', async (req, res) => {
    const {user_id, result} = req.body;

    const newResult = new Result({
        result_id: mongoose.Types.ObjectId(),
        user_id: user_id,
        result: result,
        date: new Date()
    })

    newResult.save().then(response => {
        res.status(201).json({
            status: "OK",
            data: response
        })
    }).catch(err => {
        res.status(500).json({
            status: "OK",
            data: err
        })
    })
})

app.get('/history/:user_id', async (req, res) => {

    const {user_id} = req.params;

    const result = await Result.find({
        user_id
    })

    if (!result) {
        res.status(403).json({
            status: "OK",
            message: "History not found",
        })
    } else {
        res.status(200).json({
            status: "OK",
            data: result
        })
    }

})

app.listen(process.env.PORT || Port, () => console.log('Listening on port 8000'));