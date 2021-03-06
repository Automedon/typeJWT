import {MiddlewareFn} from "type-graphql/dist/interfaces/Middleware";
import {verify} from 'jsonwebtoken'
import {MyContext} from "./MyContext";

//bearer

export const isAuth:MiddlewareFn<MyContext>=({context},next)=>{
    const authorization = context.req.headers['authorization'];
    //console.log(authorization)
    if (!authorization){
        throw new Error('no authorization')
    }
    try {
       const token = authorization.split(' ')[1];
        const payload = verify(token,process.env.ACCESS_TOKEN_SECRET!);
        context.payload = payload as any;
    }catch (e) {
        //console.log(e)
    }
    return next()
};