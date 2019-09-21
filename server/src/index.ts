import "reflect-metadata"
import 'dotenv/config'
import express from 'express';
import mongoose from 'mongoose'
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import {UserResolver} from "./UserResolver";
import cookieParser from "cookie-parser";
import {verify} from "jsonwebtoken";
import cors from "cors";
import {User} from "./models/User";
import {createAcessToken, createRefreshToken} from "./auth";
import {sendRefreshToken} from "./sendRefreshToken";




(async ()=>{
    const app = express();
    app.use(cors({
        credentials:true,
        origin:'http://localhost:3000'
    }))
    app.use(express.json());
    app.use(cookieParser());
    mongoose
        .connect('mongodb://localhost:27017/jwtgraph', {useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true})
        .then(() => {
            console.log('MongoDB ON')
        })
        .catch((err:string) => console.log(err));
    app.get('/',(_req,res)=>{
        res.send('Hello')
    });
    app.post('/refresh_token', async (req,res)=>{
        const token = req.cookies.jid;
        if (!token){
            return res.send({ok:false,accessToken:''})
        }
        let payload:any = null;
        try {
            payload = verify(token,process.env.REFRESH_TOKEN_SECRET!)
        }catch (e) {
            console.log(e);
            return res.send({ok:false,accessToken:'1'})
        }
        const user = await User.findById({_id:payload.userId}).then((user:object)=>user)

        if (!user){
            return res.send({ok:false,accessToken:'2'})
        }
        if (user.tokenVersion !==payload.tokenVersion){
            return res.send({ok:false,accessToken:'3'})
        }
        sendRefreshToken(res,createRefreshToken(user));
         return res.send({ok:true,accessToken:createAcessToken(user)})
    });
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers:[UserResolver]
        }),
        context:({req,res})=>({req,res})
    });
    apolloServer.applyMiddleware({app,cors:false});
    app.listen(3005,()=>console.log('Server on'))
})();




