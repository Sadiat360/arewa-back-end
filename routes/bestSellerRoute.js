import express from 'express'
import fs from 'fs'

const router = express.Router();



router.get('/', (req, res)=> {
    const dataBuffer = fs.readFileSync('./data/bestSeller.json');
    const bestSellerData = JSON.parse(dataBuffer) ////Parse means to break something down into smaller, understandable parts.
    res.send(bestSellerData);
});
router.get('/:slug', (req,res)=>{
     try{
        const dataBuffer = fs.readFileSync('./data/bestSeller.json');
        const bestSellerData = JSON.parse(dataBuffer)
        
        const foundBestSeller = bestSellerData.find((bestSeller)=>{
            return bestSeller.slug === req.params.slug;
        })
        if(!foundBestSeller){
            res.status(400).send('The product does not exist');
        }
        res.status(200).json({message: 'Request successful', data: foundBestSeller});
       
        
     }catch (error){
        res.status(500).json({error: 'Internal server error'})
     }
   
})

export default router;
