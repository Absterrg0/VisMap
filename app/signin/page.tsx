'use client'
import { signIn } from "@/lib/client";
import { ProviderConfig } from "@/lib/auth-providers";
import { AuthProviders } from "@/lib/auth-providers";
import { Button } from "@/components/ui/button";


export default function SignIn() {

const handleClick = async (provider:ProviderConfig) => {
    signIn.social({
        provider:provider.id as any,
        callbackURL:'/dashboard'

    })
}

    return (
        <div>
            <h1>Sign In</h1>
            {AuthProviders.map((provider)=>(
                <Button key={provider.id} onClick={()=>handleClick(provider)}>
                    {provider.name}
                </Button>
            ))}
        </div>
    )
}