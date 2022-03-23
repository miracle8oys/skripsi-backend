const FPGrowth = require("node-fpgrowth");

// var transactions = [
//     ['Beer', 'Nuts', 'Diaper'],
//     ['Coffee', 'Diaper', 'Beer'],
//     ['Egg', 'Beer', 'Diaper'],
//     ['Nuts', 'Egg', 'Milk'],
//     ['Nuts', 'Coffee', 'Diaper', 'Egg', 'Milk']
// ];




const association = async (transactions, minSupport) => {
    
    console.log(`Executing FPGrowth...`);
    
    const fpgrowth = new FPGrowth.FPGrowth(.03);
    
    let Data = [];
    
    fpgrowth.on('data', function (itemset) {
        // Do something with the frequent itemset.
        const support = itemset.support;
        const items = itemset.items;
        
        //console.log(`Itemset { ${items.join(',')} } is frequent and have a support of ${support}`);
        if (items.length === 1) {
            Data.push({
                item: items[0],
                support
            });
        }
    })

    const associationResult = fpgrowth.exec(transactions)
    .then(function (itemsets) {
        let result = [];
        // console.log("ITEMSET", Data);
        // Returns an array representing the frequent itemsets.
        const combineItemset = itemsets.filter(item =>  item.items.length > 1);
        combineItemset.forEach(itemset => {
            itemset.items.forEach(itemName => {
                const supportDevide =  Data.filter(i => i.item === itemName)
                //console.log(supportDevide[0].support);
                //console.log(itemset);
                //console.log(`Itemset ${itemset.items.join(',')} => ${supportDevide[0].item} has support ${itemset.support / transactions.length * 100}% Confidence ${itemset.support / supportDevide[0].support * 100}%`);
                if (itemset.support / transactions.length * 100 > minSupport) {
                    result.push({
                        itemset: itemset.items,
                        product: supportDevide[0].item,
                        support: itemset.support / transactions.length * 100,
                        confidence: itemset.support / supportDevide[0].support * 100
                    })
                }
            })
        });
        //console.log(`Finished executing FPGrowth. ${itemsets.length} frequent itemset(s) were found.`);
        //   console.log(itemsets);
        return result
    });

    //console.log(await associationRes);
    return associationResult

}

module.exports = association;