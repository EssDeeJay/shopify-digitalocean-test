import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const loader = async ({request}) => {
    const { session, admin } = await authenticate.public.appProxy(request);

    if(session){
        return json({success: true, message: 'nothing here !! Nice try, mate !'});
    }

    return json({success: false, message: 'something went wrong'}, {status: 404});
}