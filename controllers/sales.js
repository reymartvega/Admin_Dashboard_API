import OverallStat from "../models/OverallStat.js";

export const getSales = async (request,response) => {
    try {
        const overallStats = await OverallStat.find()

        response.status(200).json(overallStats[0])
    } catch (error) {
        response.status(404).json({message:error.message})
    }
}