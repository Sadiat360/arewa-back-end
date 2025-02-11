import express from 'express'
import cors from 'cors'
import bestSellerRoute from './routes/bestSellerRoute.js'


const app = express();
const PORT =process.env.PORT || 5050
const BASEURL =process.env.BASE_URL //// correctthis

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/bestseller', bestSellerRoute);

app.get('/', (req, res)=>{
    res.send('welcome to Arewa server')

    
})

app.listen(PORT,()=>{
     console.log(`Server running at http://localhost:${PORT}`)
})