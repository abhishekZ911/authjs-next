import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';

connect();

export async function POST(request: NextResponse){
    try {
        const reqBody = await request.json();
        const { email, password} = reqBody;
        console.log(reqBody);

        //checking if user is already existing 

        const user = await User.findOne({email});

        if(!user){
            return NextResponse.json(
                {error: "User does  not exists"},
                {status: 400}
            )
        }

        //Checking if password is correct or not 

        const validPassword = await bcryptjs.compare(password, user.password)
        if(!validPassword){
            return NextResponse.json({error: "Invalid password"}, {status: 400});
        }

        //creating token data

        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }

        //Creating token 

        const token = await jwt.sign(tokenData,
            process.env.TOKEN_SECRET!, 
            {expiresIn: "1d"})

        //setting cookies with response
        
        const response = NextResponse.json({
            message: "login successful",
            success: true,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
        })

        return response;


        
    } catch (error: any) {
        return NextResponse.json({error: error.message},
            {status: 500})
    }
}