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
   
});

router.get('/:slug/reviews/:reviewId', (req,res)=>{
     try{
        const dataBuffer = fs.readFileSync('./data/bestSeller.json')
        const bestSellerData = JSON.parse(dataBuffer);

        const foundBestSeller = bestSellerData.find((bestSeller)=>{
            return bestSeller.slug === req.params.slug
        })
        if(!foundBestSeller){
            res.status(400).send('Error fetching best seller')
        }
        const foundReview = foundBestSeller.reviews.find((review)=>{
            return review.id === req.params.reviewId
        })
        if(!foundReview){
            res.status(400).send('Error fetching review')
        }
        res.status(200).send({message: 'Review fetched successfully', data: foundReview});
     }catch (error){
        res.status(500).json('Internal server error')
     }
})

router.put('/:slug/reviews/:reviewId/like', (req,res)=> {
   
    try{
        const {slug, reviewId} = req.params;
        console.log('recieved reviewId:', req.params.reviewId)
        const dataBuffer = fs.readFileSync('./data/bestSeller.json');
        const bestSellerData = JSON.parse(dataBuffer);
       
        const foundBestSeller = bestSellerData.find((bestSeller)=>{
            return bestSeller.slug === req.params.slug;
        })
        if(!foundBestSeller){
            res.status(400).send('Error fetching bestSeller')
        }

        const foundReview = foundBestSeller.reviews?.find((review)=>{
            return review.id === req.params.reviewId
            
        })
        console.log(reviewId);
        if(!foundReview){
            res.status(400).send('Error fetching review')
        }
        /// increment likes count

        foundReview.like = (foundReview.like || 0) + 1;

        /// save the updated data back to json file

        fs.writeFileSync('./data/bestSeller.json', JSON.stringify(bestSellerData, null,2));

        return res.status(200).json({message: 'Like updated succesfully'})
    }catch (error){
       return res.status(500).send('Internal server error')
    }

})
router.put('/:slug/reviews/:reviewId/unlike', (req,res)=>{
    try{
        const {slug, reviewId} = req.params;
        console.log('Unlike reviewId:', req.params.reviewId)
        //// read and parse best seller data in the json
        const dataBuffer = fs.readFileSync('./data/bestSeller.json');
        const bestSellerData = JSON.parse(dataBuffer);
        
        //// find a single bestseller by id in the best seller data
        const foundBestSeller = bestSellerData.find((bestSeller)=>{
            return bestSeller.slug === req.params.slug;
        })
        if(!foundBestSeller){
            return res.status(400).send('Error fetching best seller')
        }
        //// now find review in the returned single best seller object
        const foundReview = foundBestSeller.reviews.find((review)=>{
            return review.id === req.params.reviewId
            
        })
        if(!foundReview){
            return res.status(400).send('Error fetching reviews')
        }

        //// decrement the likes
        foundReview.unlike = (foundReview.unlike || 0) +1;

        //// write back the data to the json file

        fs.writeFileSync('./data/bestSeller.json', JSON.stringify(bestSellerData,null,2));
        return res.status(200).json({message: 'Unlike updated succesfully'})
        
    }catch (error){
       return res.status(500).send('Internal server error')
    }
});

router.delete('/:slug/reviews/:reviewId', (req,res)=>{
    try{
        console.log(`Recieved DELETE req for slug: ${req.params.slug}, reviewId: ${req.params.reviewId}`)

        const dataBuffer = fs.readFileSync('./data/bestSeller.json');
        const bestSellerData = JSON.parse(dataBuffer);

        const foundBestSeller = bestSellerData.find((bestSeller)=>{
            return bestSeller.slug === req.params.slug
        })
        if(!foundBestSeller){
            console.error('Best seller not found')
            return res.status(400).json({error: 'Error fetching best seller'})
        }
        const foundReviewIndex = foundBestSeller.reviews?.findIndex((review)=> review.id === req.params.reviewId)
        if(!foundReviewIndex === -1){
            return res.status(400).send('Error getting review')
        }
        foundBestSeller.reviews.splice(foundReviewIndex, 1);

        fs.writeFileSync('./data/bestSeller.json', JSON.stringify(bestSellerData, null, 2))
         return res.status(200).json({message: 'review deleted succesfully'})
         
    }catch(error){
          res.status(500).send('Internal server error')
    }
})

export default router;
