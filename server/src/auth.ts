import {UserType} from "./models/User";
import {sign} from "jsonwebtoken";


export  const  createAcessToken = (user:UserType)=>{
    return sign({userId:user.id},process.env.ACCESS_TOKEN_SECRET!,{expiresIn:'15m'})
};

export  const  createRefreshToken = (user:UserType)=>{
    return sign({userId:user.id,tokenVersion:user.tokenVersion},process.env.REFRESH_TOKEN_SECRET!,{expiresIn:'7d'})
};