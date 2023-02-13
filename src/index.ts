import express from 'express';
import { userRouter } from './routes/userRouter';
import { ownerRouter } from './routes/ownerRouter';
// import { adminRouter } from './routes/adminRouter';
import morgan from 'morgan';

// env configuration.............
import * as dotenv from 'dotenv';
dotenv.config()


const app = express();

app.use(morgan('tiny'));
const PORT = process.env.PORT || 5000;

//parse json bodies..............
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use('/admin', adminRouter); 
app.use('/owner', ownerRouter);
app.use('/', userRouter);


app.listen(PORT, (): void => {
    console.log(`Server is running on ${PORT}`);
})
    