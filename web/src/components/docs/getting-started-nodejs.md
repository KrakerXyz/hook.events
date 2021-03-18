# Use node js to connect to your hook

In this tutorial, we'll show how you how to start a new Node.js project, install hook-events and connect to a hook to receive events.

## Prerequisites
Before getting start, create a new hook on https://hook.events and copy the hook url

### Initialize a new npm project with a default package json by running
~~~
npm init -y
~~~

### Install the hook-events npm package
The hook-event npm package contains a client that lets you easily connect to your hook and register callbacks to be invoked when calls to your hook are made.

~~~~
npm i hook-events
~~~~

### Create a hook.events client
We'll create a simple Node.js script to create a hook events client that will handle the connection to hook.events for us.

Create a empty `index.js`  file and add the following code to it

~~~javascript
const receiver = require('hook-events/receiver');

const client = new receiver.client('https://hookId.hook.events');
~~~
*You'll need to replace the `https://hookId.hook.events` hook url with your actual hook you created in the Prerequisites section.*

### Register a event callback
We want to run some code whenever a call is made to our hook. In this sample app, we'll simply log the requests to the console output

Add the following to `index.js`

~~~javascript
const subscripton = client.onEvent(e => {
   console.log(`Received a ${e.method} call to ${e.path}`);
});
~~~

If we run this in Node.js by calling 
~~~ 
node index.js 
~~~
then open our hook url in a browser, we should see the following output in our console

```
Received a GET call to /
Received a GET call to /favicon.ico
```

### Cleanup
Whenever we're done using our connection to hook.events, we should remove the listener. We can do this in code by calling `dispose` on our `subscription`.

*To conserve resources, the hook-event client will only connect and maintain a connection when there's at least one active listener.*

#### Example
~~~javascript
const subscripton = client.onEvent(e => {
   // ... code to run on calls to our hook
});

// .... the rest of our app

//Stop listening to our hook
subscription.dispose();

~~~

