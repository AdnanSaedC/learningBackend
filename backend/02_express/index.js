import express from 'express';

const app = express();
const port = 3000;
app.use(express.json())
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