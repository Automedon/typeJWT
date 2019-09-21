import {Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware} from "type-graphql";
import {hash, compare} from "bcryptjs";
import {User, UserType} from './models/User'
import {MyContext} from "./MyContext";
import {createAcessToken, createRefreshToken} from "./auth";
import {isAuth} from "./isAuthMIddleware";
import {verify} from "jsonwebtoken";
import {sendRefreshToken} from "./sendRefreshToken";


@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string

    tokenVersion:number

    @Field(()=>UserType)
    user:UserType;
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hi'
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx(){payload}: MyContext
    ) {
        return `your user id is: ${payload!.userId}`
    }

    @Query(() => [UserType])
    users() {
        return User.find()
    }
    @Query(() => UserType,{nullable:true})
    me(
        @Ctx()context: MyContext
    ) {
        const authorization = context.req.headers['authorization'];

        if (!authorization){
            return null
        }
        try {
            const token = authorization.split(' ')[1];
            const payload : any = verify(token,process.env.ACCESS_TOKEN_SECRET!);
            context.payload = payload as any;
            return User.findById({_id:payload.userId})
        }catch (e) {
            return null
        }
    }
    @Mutation(() => Boolean)
    async logout(
        @Ctx(){res}:MyContext
    ) {
        sendRefreshToken(res,'')
        return true
    }
    @Mutation(() => Boolean)
    async evokeRefreshTokenForUser(
        @Arg('userId', () => String)userId: string,
    ) {
        await User.findById({_id: userId}, (err: any, doc: { tokenVersion: number, save: () => void }) => {
            doc.tokenVersion++;
            doc.save()
        });
        return true
    }
    @Mutation(() => Boolean)
    async register(
        @Arg('email', () => String)email: string,
        @Arg('password', () => String)password: string,
    ) {
        const hashedPassword = await hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPassword
        });
        try {
            await user.save();
            return true

        } catch (e) {
            console.log(e);
            return false
        }
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email', () => String)email: string,
        @Arg('password', () => String)password: string,
        @Ctx() {res}: MyContext
    ): Promise<LoginResponse> {

        const user = await User.findOne({email});
        if (!user) {
            throw new Error('no user')
        }
        const valid = await compare(password, user.password);
        if (!valid) {
            throw new Error('no valid password')
        }

        //login ok
        res.cookie('jid', createRefreshToken(user), {httpOnly: true});

        return {
            accessToken: createAcessToken(user),
            tokenVersion:user.tokenVersion,
            user
        }
    }
}
