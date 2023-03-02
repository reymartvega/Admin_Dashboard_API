import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";

export const getProducts = async(request,response) =>{
    try {
        const products = await Product.find();
        const productWithStats = await Promise.all(
            products.map(async(product)=>{
                const stat = await ProductStat.find({
                    productId:product._id
                })
                return{
                    ...product._doc,
                    stat
                }
            })
        )
        response.status(200).json(productWithStats)
    } catch (error) {
        response.status(404).json({message:error.message});
    }  
}