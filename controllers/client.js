import { response } from "express";
import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import getCountryIso3 from 'country-iso-2-to-3'

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
export const getCustomers= async(request,response) =>{
    try {
        const customers = await User.find({role: "user"}).select('-password')
        return (
            response.status(200).json(customers)
        )
    } catch (error) {
        response.status(404).json({message:error.message});
    }
}
export const getTransactions = async(request,response) =>{
    try {
        //sort should look like this ('field':'userId', 'sort':'desc')
        const {page =1, pageSize=20,sort=null,search=""} = request.query;
        //formatted sort should look like ('userId: -1')
        const generateSort = () => {
            const sortParsed = JSON.parse(sort);
            const sortFormatted ={
                [sortParsed.field]:(sortParsed.sort = "asc" ? 1 : -1)
            };
            return sortFormatted;
        }
        const sortFormatted = Boolean(sort) ? generateSort(): {};
        const transactions = await Transaction.find({
            $or: [
                {
                    cost:{
                        $regex: new RegExp(search,'i') // allows us to use search field
                    }
                },
                {
                    userId:{
                        $regex: new RegExp(search,'i') 
                    }
                }
            ] 
        }).sort(sortFormatted).skip(page *pageSize).limit(pageSize)
        const total = await Transaction.countDocuments({
            name:{$regex: search, $options: "i" }
        })
        response.status(200).json({
            transactions,
            total
        })
    } catch (error) { 
        response.status(404).json({message:error.message});
    }
}
export const getGeography = async (request, response) => {
    try {
      const users = await User.find();
  
      const mappedLocations = users.reduce((acc, { country }) => {
        const countryISO3 = getCountryIso3(country);
        if (!acc[countryISO3]) {
          acc[countryISO3] = 0;
        }
        acc[countryISO3]++;
        return acc;
      }, {});
  
      const formattedLocations = Object.entries(mappedLocations).map(
        ([country, count]) => {
          return { id: country, value: count };
        }
      );
  
      response.status(200).json(formattedLocations);
    } catch (error) {
      response.status(404).json({ message: error.message });
    }
  };