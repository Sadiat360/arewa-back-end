import { timeStamp } from 'console';
import express from 'express';
import fs from 'fs';
import crypto from 'crypto';
import admin from 'firebase-admin';


const serviceAccount = JSON.parse(fs.readFileSync('./config/arewafile-firebase-adminsdk-fbsvc-95334f880a.json', 'utf8'));

const router = express.Router();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "arewafile.appspot.com" // Replace with your Firebase Storage bucket
  });
  
  const db = admin.firestore();
//   const bucket = admin.storage().bucket();

  // Multer setup for handling file uploads
// const upload = multer({ storage: multer.memoryStorage() });
  

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
   
});
router.get('/:slug/reviews', (req,res)=>{

    try{
        const dataBuffer = fs.readFileSync('./data/bestSeller.json')
        const bestSellerData = JSON.parse(dataBuffer);

        const foundBestSeller = bestSellerData.find((bestSeller)=>{
            return bestSeller.slug === req.params.slug;
        });
        if(!foundBestSeller){
            res.status(400).send('The product does not exist');
        }
        
        const reviews = (foundBestSeller.reviews || []);
        res.json(reviews)
        console.log(reviews)
    }catch (error){
        res.status(500).json({error: 'Internal server error'})
    }
    
})

router.post('/:slug/reviews',( req, res) => {
   
    const {
       user,
        comment,
        image,
        createdAt
    } = req.body;
    const newReview = {
        user: user,
        comment: comment,
        image: image,
        createdAt:  createdAt,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
    }
    try{ 
       
          const dataBuffer = fs.readFileSync('./data/bestSeller.json');
          const bestSellerData = JSON.parse(dataBuffer);

         const foundBestSeller = bestSellerData.find((bestSeller)=>{
            return bestSeller.slug ===req.params.slug;
         })
         if(!foundBestSeller){
            res.status(400).send('Error fetching best seller with slug')
         }
         /// add new review to the product reviews
         foundBestSeller.reviews.push(newReview);

         fs.writeFileSync('./data/bestSeller.json', JSON.stringify(bestSellerData))

         res.status(200).json({message: 'Review updated successfully', data: newReview})
    }catch(error){
        res.status(500).send('Internal server error for posting new review')
    }
   
})

export default router;
