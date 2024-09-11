import {
    Card,
    Layout,
    Link,
    List,
    Page,
    Text,
    BlockStack,
  } from "@shopify/polaris";
  import { TitleBar } from "@shopify/app-bridge-react";
  
  export default function RequestDemo() {

    const handleCreateRequest = () => {
        console.log('new request button clicked !!');
    }
    return (
      <Page>
        <TitleBar title="Request A Demo Form Submissions">
            <button onClick={handleCreateRequest} variant="primary">Create New Request</button>
        </TitleBar>
        <Layout>
          
        </Layout>
      </Page>
    );
  }
  