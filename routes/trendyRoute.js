import express from 'express';
import fs from  'fs'

const router = express.Router()

router.get('/', (req,res)=>{

    const dataBuffer = fs.readFileSync('./data/trendy.json')
    const trendyData = JSON.parse(dataBuffer);
    res.send(trendyData);
    // console.log(trendyData);
})
export default router;