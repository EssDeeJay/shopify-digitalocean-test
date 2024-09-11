import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { slugify } from "../utils/utils";

export const loader = async({request}) => {
    const { session, admin } = await authenticate.public.appProxy(request);

    try{
        if(session){
            console.log('get route hit, return the json data');
            const response = json({success: true, message: 'nothing here !! Nice try, mate !'});
            return (response);
        }

    }catch(error){
       console.error('error in loader', error);
    }
    return json({success: false, message: 'something went wrong'}, {status: 404});
}

export const action = async ({request}) => {
    const { session, admin } = await authenticate.public.appProxy(request);

    if(session){
        const { shop } = session;
        const response = await request.json();

        console.log('hit app proxy');

        const metaObjectCreate = await admin.graphql(
            `#graphql
            mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
              metaobjectCreate(metaobject: $metaobject) {
                metaobject {
                  handle
                  capabilities{
                    publishable{
                      status
                    }
                  }
                  first_name: field(key: "first_name") {
                    value
                  }
                  last_name: field(key: "last_name") {
                    value
                  }
                  dealer_name: field(key: "dealer_name") {
                    value
                  }
                  city: field(key: "city") {
                    value
                  }
                  province: field(key: "province") {
                    value
                  }
                  postal_code: field(key: "postal_code") {
                    value
                  }
                  phone: field(key: "phone") {
                    value
                  }
                  email: field(key: "email") {
                    value
                  }          
                  interested_products: field(key: "interested_products") {
                    value
                  }
                  comments: field(key: "comments") {
                    value
                  }
                  terms_conditions: field(key: "terms_conditions") {
                    value
                  }
                }
                userErrors {
                  field
                  message
                  code
                }
              }
            }`,
            {
              variables: {
                "metaobject": {
                  "type": "become_dealer",
                  "handle": `${slugify(response.first_name)}`,
                  "capabilities": {
                     "publishable": {
                        status: "ACTIVE"
                     }
                  },
                  "fields": [
                    {
                      "key": "first_name",
                      "value": `${response.first_name}`
                    },
                    {
                      "key": "last_name",
                      "value": `${response.last_name}`
                    },
                    {
                      "key": "dealer_name",
                      "value": `${response.dealer_name}`
                    },
                    {
                      "key": "city",
                      "value": `${response.city}`
                    },
                    {
                      "key": "province",
                      "value": `${response.province}`
                    },
                    {
                      "key": "postal_code",
                      "value": `${response.postal_code}`
                    },
                    {
                      "key": "phone",
                      "value": `${response.phone}`
                    },
                    {
                      "key": "email",
                      "value": `${response.email}`
                    },     
                    {
                        "key": "interested_products",
                        "value": `${response.interested_products}`
                    },
                    {
                        "key": "comments",
                        "value": `${response.comments}`
                    },
                    {
                        "key": "terms_conditions",
                        "value": `${response.terms_conditions}`
                    }
                  ]
                }
              },
            },
          );

          const flowTriggerMutation = await admin.graphql(`
          #graphql
          mutation flowTriggerReceive($handle: String, $payload: JSON) {
            flowTriggerReceive(handle: $handle, payload: $payload) {
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          variables: {
            "handle": "become-dealer-form-submit",
            "payload": {
              "first name": `${response.first_name}`,
              "last name": `${response.last_name}`,
              "dealer name": `${response.dealer_name}`,
              "city": `${response.city}`,
              "province": `${response.province}`,
              "postal code": `${response.postal_code}`,
              "phone": `${response.phone}`,
              "email": `${response.email}`,  
              "interested products": `${response.interested_products}`,
              "terms conditions": `${response.terms_conditions}`,
              "comments": `${response.comments}`
            }
          }
        }
      );

        const metaObjectResponse = await metaObjectCreate.json();

        const flowResponse = await flowTriggerMutation.json();
        
        if(metaObjectResponse.data.metaobjectCreate.userErrors.length){
            json({success: false, errors: metaObjectResponse.data.metaobjectCreate.userErrors})
        } 
        if(flowResponse.data.flowTriggerReceive.userErrors.length){
          json({success: false, errors: flowResponse.data.flowTriggerReceive.userErrors})
      }

            
      return json({success: true, response: response, metaObjectResponse: metaObjectResponse, shop: shop, flowResponse: flowResponse});
        
    }

    return json({success: false, message: 'something went wrong'})
}