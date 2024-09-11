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

        console.log('hit app proxy')

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
                  name: field(key: "name") {
                    value
                  }
                  email: field(key: "email") {
                    value
                  }
                  phone: field(key: "phone") {
                    value
                  }
                  company_name: field(key: "company_name") {
                    value
                  }
                  company_address: field(key: "company_address") {
                    value
                  }
                  apt_suite: field(key: "apt_suite") {
                    value
                  }
                  city: field(key: "city") {
                    value
                  }
                  postal_code: field(key: "postal_code") {
                    value
                  }
                  province: field(key: "province") {
                    value
                  }
                  products: field(key: "products") {
                    value
                  }
                  terms_conditions: field(key: "terms_conditions") {
                    value
                  }
                  comments: field(key: "comments") {
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
                  "type": "request_demo",
                  "handle": `${slugify(response.name)}`,
                  "capabilities": {
                     "publishable": {
                        status: "ACTIVE"
                     }
                  },
                  "fields": [
                    {
                      "key": "name",
                      "value": `${response.name}`
                    },
                    {
                      "key": "email",
                      "value": `${response.email}`
                    },
                    {
                      "key": "phone",
                      "value": `${response.phone}`
                    },
                    {
                        "key": "company_name",
                        "value": `${response.company_name}`
                    },
                    {
                        "key": "company_address",
                        "value": `${response.company_address}`
                    },
                    {
                        "key": "apt_suite",
                        "value": `${response.apt_suite}`
                    },
                    {
                        "key": "city",
                        "value": `${response.city}`
                    },
                    {
                        "key": "postal_code",
                        "value": `${response.postal_code}`
                    },
                    {
                        "key": "province",
                        "value": `${response.province}`
                    },
                    {
                        "key": "products",
                        "value": `${response.products}`
                    },
                    {
                        "key": "terms_conditions",
                        "value": `${response.terms_conditions}`
                    },
                    {
                        "key": "comments",
                        "value": `${response.comments}`
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
            "handle": "request-demo-form-submit",
            "payload": {
              "name": `${response.name}`,
              "email": `${response.email}`,
              "phone": `${response.phone}`,
              "company name": `${response.company_name}`,
              "company address": `${response.company_address}`,
              "apt suite": `${response.apt_suite}`,
              "city": `${response.city}`,
              "postal code": `${response.postal_code}`,
              "province": `${response.province}`,
              "products": `${response.products}`,
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