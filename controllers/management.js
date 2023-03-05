import User from "../models/User.js"
import Transaction from "../models/Transaction.js"
import mongoose from "mongoose"

export const getAdmins = async (request,response) => {
    try {
        const admins = await User.find({role:"admin"}).select('-password')
        response.status(200).json(admins)
    } catch (error) {
        response.status(404).json({message: error.message})
    }
}
export const getUserPerformance = async (request,response) => {
    try {
        const {id} = request.params
        const userWithStats = User.aggregate([
            { $match:{_id: new mongoose.Types.ObjectId(id)}},
            {
                $lookup:{
                    from:"affiliatestats",
                    localField:"_id",
                    foreignField:"userId",
                    as:"affiliatestat"
                }
            },
            {$unwind: "$affiliateStats"}
        ])
        const saleTransactions = await Promise.all(
            userWithStats[0].affiliateSales((id) => {
                Transaction.findById(id)
            })
        )
        const filteredSaleTransactions = saleTransactions.filter(
            (transaction) => transaction !== null
        )
        response.status(200).json({user:userWithStats[0],sales:filteredSaleTransactions})
    } catch (error) {
        response.status(400).json({message:error.message})
    }
}