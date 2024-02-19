#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import readline from "node:readline"
import fs from "node:fs"
import querystring from "node:querystring"
import http from "node:http"
import open from "open"
import { runInNewContext } from 'node:vm'

yargs(hideBin(process.argv))
  .command('create', 'fetch the contents of the URL', () => {}, (argv) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question("What is your json array name inside the db.json file ?: ", function(name) {
          
        const file = fs.createWriteStream(new URL(`./db.json`, import.meta.url).pathname)
       
        
        // stream takes only string or buffer thats why we need to convert the object to string using JSON.stringify
        file.write(JSON.stringify({[name]: []}))
         
        file.end()

        file.on("finish",()=>{
            console.log("File created successfully.\n")
            fs.readFile("./db.json",(err,data)=>{
                if(err) throw err
                console.log(data.toString())
            
            })
        
        })

          rl.close()

    })
  })
    .command('add <json>', 'fetch the contents of the URL', () => {}, async(argv) => {

        try{

            const file = await fs.createReadStream("./db.json")
            file.on("data",(chunk)=>{

                const obj = JSON.parse(chunk.toString())

                const data = querystring.parse(argv.json)
                
                const keys = Object.keys(obj);
                
                if(keys.length === 0){
                    console.log("Please create a json array first")
                    return
                }

                const key = keys[0]
                const value = obj[key]

                const newData = [...value,data]

                const newObject = {
                    [key]: newData
                }

                const newFile = fs.createWriteStream(new URL(`./db.json`, import.meta.url).pathname)
                newFile.write(JSON.stringify(newObject,null,2))
                newFile.end()
                newFile.on("finish",()=>{
                    console.log("Data added successfully.\n")
                    fs.readFile("./db.json",(err,data)=>{
                        if(err) throw err
                        console.log(data.toString())
                    
                    })
                
                })

                

                
                

            })

        }
        catch(err){
            console.log(err)
        }


    })
    
    .command("web [port]","Start a web server",(yargs)=>{
        return yargs.positional("port",{
            describe: "Port to listen on",
            default:8000,
            type: "number"
        })
    },async(argv)=>{
        try{
            const file = await fs.promises.readFile("./db.json")
            const data = JSON.parse(file.toString())

            const server = http.createServer((req,res)=>{
                res.writeHead(200,{"Content-Type":"application/json"})
                res.end(JSON.stringify(data))
            })
            server.listen(argv.port,()=>{
                console.log(`Server is running on port ${argv.port}`)
                open(`http://localhost:${argv.port}`)
            })

        }
        catch(err){
            console.log(err)
        }

      
        

        
        
                


    })

    .command("clear","Clear the db.json file",()=>{},
        async()=>{
       const file = fs.createWriteStream(new URL(`./db.json`, import.meta.url).pathname)

       file.write(JSON.stringify({}))

       file.end();

       file.on("finish",()=>{
           console.log("Database cleared successfully")
       })
    })

    

  .demandCommand(1)
  .parse()