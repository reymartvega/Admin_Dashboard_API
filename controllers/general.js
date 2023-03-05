import User from "../models/User.js"
import OverallStat from "../models/OverallStat.js";
import Transaction from "../models/Transaction.js";

export const getUser = async(request,response) =>{
    try {
        const { id } = request.params;
        const user = await User.findById(id);
        response.status(200).json(user)
    } catch (error) {
        response.status(404).json({message:error.message});
    }
}
export const getDashboardStats = async(request,response) =>{
    try {
        //hardcoded values because of limited mock data
        const currentMonth = "November"
        const currentYear = 2021
        const currentDay = "2021-11-15"
        //recent transactions
        const transactions = await Transaction.find().limit(50).sort({createdOm:-1})
        //overall stats
        const overallStat = await OverallStat.find({year:currentYear})
        const{
            totalCustomers,
            yearlyTotalSoldUnits,
            yearlySalesTotal,
            monthlyData,
            salesByCategory
        } = overallStat[0]
        const thisMonthStats = overallStat[0].monthlyData.find(({month}) => {
            return month === currentMonth
        })
        const todayStats = overallStat[0].dailyData.find(({date}) => {
            return date === currentDay
        })
        response.status(200).json({
            totalCustomers,
            yearlyTotalSoldUnits,
            yearlySalesTotal,
            monthlyData,
            salesByCategory,
            thisMonthStats,
            todayStats,
            transactions
        })
    } catch (error) {
        response.status(404).json({message:error.message});
    }
}