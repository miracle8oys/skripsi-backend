const combineRecomendation = async (itemset, products) => {

    
    const productName = products.map(i => i.name);
    let recomendedItemset = []
    // itemset.forEach(item => {
    //     console.log(item);
    //     if (productName.includes(item.itemset)) {
    //         //recomendedItemset.push(item);
    //     }
    // });
    itemset.forEach(item => {
        // item.itemset.forEach((itemsetName) => {
        //     if (productName.includes(itemsetName)) {
        //         console.log(item);
        //         recomendedItemset.push(item);
        //     }
        // })

        for (let index = 0; index < item.itemset.length; index++) {
            if (productName.includes(item.itemset[index])) {
                recomendedItemset.push(item);
                index++
            }    
        }
    });
    return recomendedItemset

}

module.exports = combineRecomendation;