import  express from "express"
import  bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import {config} from "dotenv"
import winston from 'winston'
import { format} from 'winston'
const {timestamp, label, prettyPrint } = format;
import expressWinston from 'express-winston'
import helmet from 'helmet'
import hpp from 'hpp'
import cors from 'cors'
import "./services/telegramBot/bot"


AppDataSource.initialize().then(async () => {
    
    // create express app
    const app = express()
    app.use(bodyParser.json())
    config()

app.use(cors())
app.use(helmet())
app.use(hpp())

// await mqConnection.connect();
// await mqConnection.sendToQueue('userLogs' , {message : 'test passed????'});




//set logger
app.use(
    expressWinston.logger({
        transports: [new winston.transports.Console(), new (winston.transports.File)({ filename: 'myLogs.log' })],
        format: format.combine(
            label({ label: 'right meow!' }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            prettyPrint()
        ),
        statusLevels: true,
        meta: true,
        msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
        expressFormat: true,
        ignoreRoute() {
            return false;
        },
    })
);

// inside logger!!!!
winston.configure({
    format: format.combine(

        label({ label: 'right meow!' }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        prettyPrint()
    ),
    transports: [
        new (winston.transports.File)({ filename: 'inside.log' }),
        // new winston.transports.Console()
    ],
})



process.on('unhandledRejection', (error) => {
    console.log('error occured . . .', error)
});

process.on('uncaughtException', (error) => {
    console.log('error occured', error)
})

process.on('unhandledException', (error) => {
    console.log('error occured . . .', error)
})


    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route,route.middlware,(req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)

        })
    })

    // setup express app here
    // ...
    const port=+process.env.PORT || 7000
    // start express server
    app.listen(port)
    console.log(`Express server has started on port ${port} . Open http://localhost:${port}  to see results`)

}).catch(error => console.log(error))
