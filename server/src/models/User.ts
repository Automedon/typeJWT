import {Field, ObjectType} from "type-graphql";


const mongoose = require("mongoose");

@ObjectType()
export class UserType {
    @Field()
    id: string;

    @Field()
    email: string;

    password: string;

    tokenVersion: number;
}

const schema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    tokenVersion:{type:Number, default:0}

});
export const User = mongoose.model("User", schema);
