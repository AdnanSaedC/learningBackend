const http = require('http');

const hostName = '127.0.0.1'
const port = 3000

const server = http.createServer((req,res)=>{
    if(req.url === '/'){
        res.statusCode = 200,
        res.setHeader('Content-Type','text/plain'),
        res.end("hello")
    }
})

server.listen(port,hostName,()=>{
    console.log(`Server is running on ${port} and listening to this ${hostName}`)
})