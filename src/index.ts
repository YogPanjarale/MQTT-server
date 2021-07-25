import aedess from "aedes";
const aedes = aedess()
import { createServer}  from 'net';
const server = createServer(aedes.handle)
const port = 1883
server.listen(port,()=>{
    console.log(`Aedes listening on port ${port}`)
})