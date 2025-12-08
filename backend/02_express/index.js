import express from 'express';

import logger from "./02_logger.js";
import morgan from "morgan";

//we are extracting these data from url
const morganFormat = ":method :url :status :response-time ms";



const app = express();
const port = 3000;
app.use(express.json())

//here we are telling the express to pass through this every request
app.use(

//craetes a morgon logger which will send by winston(in my case here) later
  morgan(morganFormat, {
    //take the stream of data and write
    stream: {

    //here we are just splitting the msg and assigning the value to each component
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
        //we have a winston obect which contains info method which we are calling here
      },
    },
  })
);
//it is used to convert raw body data into json object for future use

const data=[];
let newId=1;

//adding new objects
app.get("/",(req,res)=>{
    const {name,price}=req.body;
    const newObj = {id:newId++,name,price};
    data.push(newObj);
    res.status(200).send(newObj)
})

//displaying all the objects
app.get("/all/:id",(req,res)=>{
    const currentData=data.find(t=>t.id===parseInt(req.params.id))
    res.status(200).send(currentData);
})

//now how to delete the data
app.delete("/delete/:id",(req,res)=>{
    const currentData=data.find(t=>t.id===parseInt(req.params.id))
    data.splice(currentData,1)
    res.status(200).send('DELTED SUCCESSFULLY');
})

app.listen(port,()=>{
    console.log(`Server is running on ${port}`);
})