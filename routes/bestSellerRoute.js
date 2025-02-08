import express from 'express'
import fs from 'fs'

const router = express.Router();


router.get('/', (req, res)=> {
    const dataBuffer = fs.readFileSync('./data/bestSeller.json');
    const bestSellerData = JSON.parse(dataBuffer) ////Parse means to break something down into smaller, understandable parts.
    res.send(bestSellerData);
});

export default router;
